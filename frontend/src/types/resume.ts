export interface ContactInfo {
  name: string;
  title?: string;
  phone?: string;
  email?: string;
  links?: string[];
}

export interface ExperienceItem {
  role: string;
  company: string;
  location?: string;
  dates?: string;
  original_bullets?: string[];
  tailored_bullets: string[];
}

export interface ProjectItem {
  name: string;
  tech_stack?: string;
  link?: string;
  bullets: string[];
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  location?: string;
  dates?: string;
  details?: string;
}

export interface TailoredResumeDocument {
  contact: ContactInfo;
  target_job_title: string;
  summary: string;
  skills_categories: SkillCategory[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  achievements?: string[];
}

export interface TailoredResumeResponse {
  success: boolean;
  match_score: number;
  score_analysis: string;
  matched_skills: string[];
  missing_keywords: string[];
  key_recommendations: string[];
  tailored_document: TailoredResumeDocument;
}
