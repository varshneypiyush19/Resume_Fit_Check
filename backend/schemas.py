from typing import List, Optional
from pydantic import BaseModel, Field


class ContactInfo(BaseModel):
    name: str = Field(description="Candidate's full name, e.g. PIYUSH VARSHNEY")
    title: Optional[str] = Field(default="", description="Professional title/tagline from resume")
    phone: Optional[str] = Field(default="", description="Phone number")
    email: Optional[str] = Field(default="", description="Email address")
    links: List[str] = Field(
        default_factory=list,
        description="Links such as LinkedIn, GitHub, Portfolio, LeetCode"
    )


class ExperienceItem(BaseModel):
    role: str = Field(description="Role / Job title")
    company: str = Field(default="", description="Company or organization name")
    location: Optional[str] = Field(default="", description="City, country or Remote")
    dates: Optional[str] = Field(default="", description="Employment dates, e.g., July 2025 - Present")
    original_bullets: List[str] = Field(
        default_factory=list,
        description="Original bullet points from the resume"
    )
    tailored_bullets: List[str] = Field(
        description="Tailored bullet points incorporating target keywords, impact, and metrics"
    )


class ProjectItem(BaseModel):
    name: str = Field(description="Project name")
    tech_stack: Optional[str] = Field(default="", description="Technologies used, e.g. MERN, Socket.IO")
    link: Optional[str] = Field(default="", description="Project links, e.g. Live Demo, GitHub")
    bullets: List[str] = Field(description="Impactful bullet points describing the project")


class SkillCategory(BaseModel):
    category: str = Field(description="Skill category name, e.g. Frontend, Backend, Databases, Tools, Deployment")
    skills: List[str] = Field(description="List of skills in this category")


class EducationItem(BaseModel):
    institution: str = Field(description="University or College name")
    degree: str = Field(description="Degree and Major, e.g. Bachelor Of Technology, Information Technology")
    location: Optional[str] = Field(default="", description="City, Country")
    dates: Optional[str] = Field(default="", description="Dates attended or graduation year")
    details: Optional[str] = Field(default="", description="CGPA / GPA or academic honors")


class TailoredResumeDocument(BaseModel):
    contact: ContactInfo = Field(description="Candidate's personal and contact information")
    target_job_title: str = Field(
        description="Target job title from the JD formatted in snake_case (e.g. software_developer, full_stack_developer)"
    )
    summary: str = Field(description="Tailored professional summary aligned with the target JD")
    skills_categories: List[SkillCategory] = Field(description="Categorized technical skills")
    experience: List[ExperienceItem] = Field(description="Work experience with tailored bullets")
    projects: List[ProjectItem] = Field(description="Projects with tailored bullets")
    education: List[EducationItem] = Field(description="Education history")
    achievements: List[str] = Field(
        default_factory=list,
        description="Achievements, hackathons, and extracurricular activities"
    )


class TailoredResumeResponse(BaseModel):
    success: bool = Field(default=True, description="Whether the operation succeeded")
    match_score: int = Field(ge=0, le=100, description="Estimated match percentage (0-100) between resume and JD")
    score_analysis: str = Field(description="Concise score breakdown and analysis")
    matched_skills: List[str] = Field(description="Skills matched directly with JD")
    missing_keywords: List[str] = Field(description="Missing keywords or tools from JD")
    key_recommendations: List[str] = Field(description="Actionable career coach tips")
    tailored_document: TailoredResumeDocument = Field(
        description="The complete structured tailored resume document ready to render and print"
    )
