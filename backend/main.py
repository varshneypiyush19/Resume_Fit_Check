import os
import time
from collections import defaultdict
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from parser import parse_resume
from llm_service import tailor_resume_with_llm, tailor_resume_stream_with_llm
from schemas import TailoredResumeResponse

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Resume Customizer API",
    description="Backend API for parsing resumes and intelligently tailoring them to Job Descriptions using LLMs.",
    version="1.0.0",
)

# Configure CORS strictly from environment variables
frontend_env = os.getenv("FRONTEND_URL")
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")

origins = []
if frontend_env:
    for url in frontend_env.split(","):
        if url.strip():
            origins.append(url.strip().rstrip("/"))
if allowed_origins_env:
    for url in allowed_origins_env.split(","):
        if url.strip():
            origins.append(url.strip().rstrip("/"))

# Strict CORS: Only origins explicitly registered in FRONTEND_URL or ALLOWED_ORIGINS can call the API
cors_origins = origins if origins else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Max allowed file size: 5 MB
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

# Quota & Billing Protection: Max 6 AI tailoring requests per minute per IP address
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 3
_ip_request_timestamps = defaultdict(list)

def enforce_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    # Retain only timestamps inside active window
    _ip_request_timestamps[client_ip] = [
        t for t in _ip_request_timestamps[client_ip] if now - t < RATE_LIMIT_WINDOW_SECONDS
    ]
    if len(_ip_request_timestamps[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded (maximum 3 optimizations per minute). Please wait a moment before trying again to protect Gemini API quota.",
        )
    _ip_request_timestamps[client_ip].append(now)


@app.get("/")
def root():
    return {
        "message": "Resume Customizer API is online.",
        "docs_url": "/docs",
        "health_url": "/health",
        "authorized_origins": cors_origins,
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "resume-customizer-api",
        "version": "1.0.0",
        "authorized_origins": cors_origins,
    }


@app.post("/api/tailor", response_model=TailoredResumeResponse)
async def tailor_resume_endpoint(
    request: Request,
    file: UploadFile = File(..., description="Uploaded resume file (PDF or DOCX)"),
    job_description: str = Form(..., description="Target Job Description text"),
):
    enforce_rate_limit(request)
    # 1. Validate Job Description input
    jd_clean = job_description.strip()
    if not jd_clean or len(jd_clean) < 30:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please provide a complete job description (at least 30 characters).",
        )

    # 2. Validate File Extension
    filename = file.filename or ""
    filename_lower = filename.lower()
    if not (filename_lower.endswith(".pdf") or filename_lower.endswith(".docx")):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format for '{filename}'. Only PDF (.pdf) and Word (.docx) files are supported.",
        )

    # 3. Read file contents and check size limit
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {str(e)}")

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty (0 bytes).")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of 5MB (Uploaded: {len(file_bytes) / (1024 * 1024):.1f}MB).",
        )

    # 4. Parse resume text from binary bytes
    try:
        resume_text = parse_resume(file_bytes, filename)
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Error parsing document: {str(err)}")

    # 5. Tailor resume using LLM
    try:
        tailored_result = tailor_resume_with_llm(
            resume_text=resume_text,
            job_description=jd_clean,
        )
        return tailored_result
    except Exception as llm_err:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to customize resume with AI: {str(llm_err)}",
        )


@app.post("/api/tailor-stream")
async def tailor_resume_stream_endpoint(
    request: Request,
    file: UploadFile = File(..., description="Uploaded resume file (PDF or DOCX)"),
    job_description: str = Form(..., description="Target Job Description text"),
):
    """
    Real-time streaming endpoint yielding Server-Sent Events (SSE) as Gemini generates tokens.
    """
    enforce_rate_limit(request)
    jd_clean = job_description.strip()
    if not jd_clean or len(jd_clean) < 30:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please provide a complete job description (at least 30 characters).",
        )

    filename = file.filename or ""
    filename_lower = filename.lower()
    if not (filename_lower.endswith(".pdf") or filename_lower.endswith(".docx")):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format for '{filename}'. Only PDF (.pdf) and Word (.docx) files are supported.",
        )

    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {str(e)}")

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="The uploaded file is empty (0 bytes).")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of 5MB (Uploaded: {len(file_bytes) / (1024 * 1024):.1f}MB).",
        )

    try:
        resume_text = parse_resume(file_bytes, filename)
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Error parsing document: {str(err)}")

    return StreamingResponse(
        tailor_resume_stream_with_llm(resume_text, jd_clean),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
