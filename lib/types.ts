export type UserRole = 'learner' | 'teacher' | 'employer' | 'admin';
export type SessionStatus = 'pending' | 'approved' | 'completed' | 'cancelled' | 'rescheduled';
export type ApplicationStatus = 'applied' | 'under_review' | 'interview' | 'selected' | 'rejected';
export type SkillCategory = 'programming' | 'design' | 'marketing' | 'languages' | 'business' | 'crafts' | 'music' | 'cooking' | 'other';
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'session' | 'credit' | 'certificate' | 'job';
export type CreditType = 'earned' | 'spent' | 'bonus' | 'refund';
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type UserSkillType = 'known' | 'wanted';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string;
  bio: string;
  location: string;
  availability: string;
  skill_credits: number;
  profile_completion: number;
  is_verified: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  type: UserSkillType;
  proficiency: SkillProficiency;
  created_at: string;
  skill?: Skill;
}

export interface SkillCreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: CreditType;
  description: string;
  reference_id?: string;
  reference_type?: string;
  balance_after: number;
  created_at: string;
}

export interface Session {
  id: string;
  teacher_id: string;
  learner_id: string;
  skill_id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: SessionStatus;
  meeting_url: string;
  notes: string;
  credits_cost: number;
  recording_url: string;
  created_at: string;
  updated_at: string;
  teacher?: Profile;
  learner?: Profile;
  skill?: Skill;
}

export interface Assessment {
  id: string;
  skill_id: string;
  title: string;
  description: string;
  pass_score: number;
  time_limit_minutes: number;
  question_count: number;
  is_active: boolean;
  created_at: string;
  skill?: Skill;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  created_at: string;
}

export interface AssessmentAttempt {
  id: string;
  user_id: string;
  assessment_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  started_at: string;
  completed_at?: string;
  created_at: string;
  assessment?: Assessment;
}

export interface Certificate {
  id: string;
  user_id: string;
  skill_id: string;
  assessment_attempt_id?: string;
  verification_id: string;
  score: number;
  issued_at: string;
  expires_at?: string;
  is_valid: boolean;
  skill?: Skill;
  profile?: Profile;
}

export interface Review {
  id: string;
  session_id: string;
  reviewer_id: string;
  reviewee_id: string;
  knowledge_rating: number;
  communication_rating: number;
  helpfulness_rating: number;
  overall_rating: number;
  comment: string;
  created_at: string;
  reviewer?: Profile;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salary_range: string;
  job_type: string;
  required_skills: string[];
  requires_certification: boolean;
  is_active: boolean;
  applications_count: number;
  created_at: string;
  updated_at: string;
  employer?: Profile;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_url: string;
  cover_letter: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  job?: Job;
  applicant?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  reference_id?: string;
  reference_type?: string;
  created_at: string;
}

export interface Meetup {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  scheduled_at: string;
  max_attendees: number;
  attendees_count: number;
  is_active: boolean;
  created_at: string;
  organizer?: Profile;
}

export interface Video {
  id: string;
  uploader_id: string;
  session_id?: string;
  skill_id?: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  views_count: number;
  is_public: boolean;
  created_at: string;
  skill?: Skill;
  uploader?: Profile;
}

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: any; Update: any };
      skills: { Row: Skill; Insert: any; Update: any };
      user_skills: { Row: UserSkill; Insert: any; Update: any };
      skill_credit_transactions: { Row: SkillCreditTransaction; Insert: any; Update: any };
      sessions: { Row: Session; Insert: any; Update: any };
      assessments: { Row: Assessment; Insert: any; Update: any };
      assessment_questions: { Row: AssessmentQuestion; Insert: any; Update: any };
      assessment_attempts: { Row: AssessmentAttempt; Insert: any; Update: any };
      certificates: { Row: Certificate; Insert: any; Update: any };
      reviews: { Row: Review; Insert: any; Update: any };
      jobs: { Row: Job; Insert: any; Update: any };
      job_applications: { Row: JobApplication; Insert: any; Update: any };
      notifications: { Row: Notification; Insert: any; Update: any };
      meetups: { Row: Meetup; Insert: any; Update: any };
      meetup_rsvps: { Row: { id: string; meetup_id: string; user_id: string; attended: boolean; created_at: string }; Insert: any; Update: any };
      videos: { Row: Video; Insert: any; Update: any };
    };
  };
};
