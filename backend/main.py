import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from parser import parse_resume
from llm_service import tailor_resume_with_llm
from schemas import TailoredResumeResponse

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Resume Customizer API",
    description="Backend API for parsing resumes and intelligently tailoring them to Job Descriptions using LLMs.",
    version="1.0.0",
)

# Configure CORS so our Next.js frontend can call this backend
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev & cloud deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Max allowed file size: 5 MB
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024


@app.get("/")
def root():
    return {
        "message": "Resume Customizer API is online.",
        "docs_url": "/docs",
        "health_url": "/health",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "resume-customizer-api",
        "version": "1.0.0",
    }


@app.post("/api/tailor", response_model=TailoredResumeResponse)
async def tailor_resume_endpoint(
    file: UploadFile = File(..., description="Uploaded resume file (PDF or DOCX)"),
    job_description: str = Form(..., description="Target Job Description text"),
):
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
