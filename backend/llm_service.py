import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

from schemas import TailoredResumeResponse

# Load environment variables from .env
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY or API_KEY in ("your_actual_api_key_here", "your_gemini_api_key_here"):
    raise RuntimeError("GEMINI_API_KEY is not set or is still a placeholder in backend/.env")

# Initialize the Gemini client
client = genai.Client(api_key=API_KEY)

SYSTEM_PROMPT = """You are an elite Executive Technical Recruiter and Career Strategist.
Your objective is to ingest a candidate's existing resume and a target Job Description (JD), and produce a COMPLETE, PRODUCTION-READY TAILORED RESUME DOCUMENT alongside match analytics.

Core Principles:
1. TRUTHFUL EXTRACTION: Extract the candidate's real personal details (Full Name, Contact Phone, Email, Links like LinkedIn/GitHub/Portfolio/LeetCode, Education, Companies, Project names). Do NOT fabricate false degrees or unheld company roles.
   - For candidate links, extract both display labels and real destination URLs into `link_items` (e.g. label='LinkedIn', url='http://www.linkedin.com/in/...', label='GitHub', url='https://github.com/...'). Look at the extracted document hyperlinks provided at the bottom of the resume text.
   - For projects, if the resume contains a live link or repo URL, preserve it in `link_url` (e.g. 'https://frienz.vercel.app') and set `link` to 'View Live' or 'Live Demo'.
2. INTELLIGENT TAILORING & GOOGLE XYZ FORMULA:
   - Target Job Title: Extract a clean snake_case title for the role from the JD (e.g. 'software_developer', 'full_stack_engineer').
   - Summary: Rewrite a 2-3 sentence high-impact summary sharply emphasizing the candidate's real achievements and alignment with the JD.
   - Work Experience: Keep companies, roles, locations, and dates intact. Rephrase and reorder bullet points following Google's XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]". Highlight relevant technologies, action verbs, and keywords from the JD.
   - Projects: Enhance project bullet points to showcase relevant architecture, APIs, or frameworks mentioned in the JD.
   - Categorized Skills: Group technical skills cleanly into categories (e.g. Frontend, Backend, Databases, Tools & DevOps, Deployment), ensuring skills relevant to the JD appear prominent.
   - Education & Achievements: Preserve existing education and notable extracurriculars/achievements accurately.
3. ATS & MATCH SCORING:
   - Provide a realistic match percentage (0-100) reflecting compatibility between the candidate and the target role.
   - Provide concise score analysis, matched skills, missing keywords, and actionable recommendations.

FEW-SHOT BULLET REWRITING EXAMPLES (Google XYZ Formula):
Example 1 (Backend & APIs):
- Before (Weak): "Built backend APIs using Node.js and MongoDB for user authentication."
- After (Tailored High-Impact): "Architected and deployed 15+ secure RESTful microservices using Node.js, Express, and MongoDB, implementing JWT authentication and reducing average API response latency by 35% across 10,000+ monthly active users."

Example 2 (Frontend & Full Stack):
- Before (Weak): "Worked on the frontend dashboard using React and Tailwind CSS."
- After (Tailored High-Impact): "Engineered a responsive analytics dashboard using React.js and Tailwind CSS with real-time WebSocket updates, slashing initial page load time by 40% and improving Core Web Vitals (LCP) to 1.1s."

Always output strictly valid JSON conforming to the TailoredResumeResponse schema.
"""

CANDIDATE_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
]


def tailor_resume_with_llm(resume_text: str, job_description: str) -> TailoredResumeResponse:
    """
    Calls the Gemini API to customize the resume against the target Job Description.
    Iterates through candidate models for reliability and returns a validated TailoredResumeResponse.
    """
    user_prompt = f"""Target Job Description:
\"\"\"
{job_description}
\"\"\"

Candidate's Current Resume Content:
\"\"\"
{resume_text}
\"\"\"
"""

    last_error = None
    for model_name in CANDIDATE_MODELS:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=TailoredResumeResponse,
                    temperature=0.2,
                ),
            )

            response_text = response.text
            if not response_text:
                continue

            data = json.loads(response_text)
            return TailoredResumeResponse(**data)

        except Exception as e:
            last_error = e
            continue

    raise RuntimeError(f"All candidate LLM models failed. Last error: {str(last_error)}")


def tailor_resume_stream_with_llm(resume_text: str, job_description: str):
    """
    Generator yielding Server-Sent Events (SSE) as Gemini streams tokens in real time.
    Yields:
      - event: status with current progress message
      - event: token with text chunks
      - event: complete with final validated TailoredResumeResponse
    """
    user_prompt = f"""Target Job Description:
\"\"\"
{job_description}
\"\"\"

Candidate's Current Resume Content:
\"\"\"
{resume_text}
\"\"\"
"""
    yield f"event: status\ndata: {json.dumps({'stage': 'Initiating Gemini AI with Google XYZ impact rubric...'})}\n\n"

    last_error = None
    for model_name in CANDIDATE_MODELS:
        try:
            yield f"event: status\ndata: {json.dumps({'stage': f'Streaming tokens from {model_name}...'})}\n\n"
            response_stream = client.models.generate_content_stream(
                model=model_name,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=TailoredResumeResponse,
                    temperature=0.2,
                ),
            )

            chunks = []
            for chunk in response_stream:
                if chunk.text:
                    chunks.append(chunk.text)
                    yield f"event: token\ndata: {json.dumps({'chunk': chunk.text})}\n\n"

            full_text = "".join(chunks)
            if not full_text:
                continue

            data = json.loads(full_text)
            validated = TailoredResumeResponse(**data)
            yield f"event: complete\ndata: {validated.model_dump_json()}\n\n"
            return

        except Exception as e:
            last_error = e
            continue

    yield f"event: error\ndata: {json.dumps({'error': f'All candidate LLM models failed. Last error: {str(last_error)}'})}\n\n"
