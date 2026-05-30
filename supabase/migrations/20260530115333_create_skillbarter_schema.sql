/*
  # SkillBarter Platform - Complete Database Schema

  ## Overview
  Full schema for the SkillBarter peer-to-peer skill exchange platform.

  ## Tables Created
  1. profiles - Extended user profiles with roles, skills, credits
  2. skills - Master list of skills available on platform
  3. user_skills - Skills owned/wanted by each user
  4. skill_credit_transactions - Ledger for credit system
  5. sessions - Booking system for skill exchange sessions
  6. assessments - MCQ-based competency tests
  7. assessment_questions - Questions for each assessment
  8. assessment_attempts - User attempts at assessments
  9. certificates - Issued certificates with verification IDs
  10. reviews - Ratings and reviews after sessions
  11. jobs - Employer job postings
  12. job_applications - Applications to jobs
  13. notifications - In-app notification system
  14. meetups - Community offline meetup events
  15. videos - Recorded learning sessions

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Public read access for skills, jobs, certificates (verification)
  - Employers can manage their own jobs
  - Admins have elevated access via role check
*/

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'teacher', 'employer', 'admin')),
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  location text DEFAULT '',
  availability text DEFAULT 'flexible' CHECK (availability IN ('weekdays', 'weekends', 'evenings', 'flexible')),
  skill_credits integer NOT NULL DEFAULT 5,
  profile_completion integer NOT NULL DEFAULT 0,
  is_verified boolean NOT NULL DEFAULT false,
  rating_avg numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Skills master table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('programming', 'design', 'marketing', 'languages', 'business', 'crafts', 'music', 'cooking', 'other')),
  description text DEFAULT '',
  icon text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active skills"
  ON skills FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can insert skills"
  ON skills FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update skills"
  ON skills FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- User Skills (skills known and wanted)
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('known', 'wanted')),
  proficiency text DEFAULT 'beginner' CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id, type)
);

ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user skills"
  ON user_skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own user skills"
  ON user_skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own user skills"
  ON user_skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own user skills"
  ON user_skills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Skill Credit Transactions (ledger)
CREATE TABLE IF NOT EXISTS skill_credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earned', 'spent', 'bonus', 'refund')),
  description text NOT NULL DEFAULT '',
  reference_id uuid,
  reference_type text DEFAULT '',
  balance_after integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skill_credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON skill_credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert transactions"
  ON skill_credit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Sessions (booking system)
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  learner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'cancelled', 'rescheduled')),
  meeting_url text DEFAULT '',
  notes text DEFAULT '',
  credits_cost integer NOT NULL DEFAULT 1,
  recording_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session participants can view sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id OR auth.uid() = learner_id);

CREATE POLICY "Learners can insert sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Participants can update sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id OR auth.uid() = learner_id)
  WITH CHECK (auth.uid() = teacher_id OR auth.uid() = learner_id);

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  pass_score integer NOT NULL DEFAULT 70,
  time_limit_minutes integer NOT NULL DEFAULT 30,
  question_count integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert assessments"
  ON assessments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Assessment Questions
CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  explanation text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view questions"
  ON assessment_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert questions"
  ON assessment_questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Assessment Attempts
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON assessment_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON assessment_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts"
  ON assessment_attempts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  assessment_attempt_id uuid REFERENCES assessment_attempts(id),
  verification_id text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  score integer NOT NULL DEFAULT 0,
  issued_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_valid boolean NOT NULL DEFAULT true
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can verify certificate by id"
  ON certificates FOR SELECT
  USING (true);

CREATE POLICY "System can insert certificates"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  knowledge_rating integer NOT NULL CHECK (knowledge_rating BETWEEN 1 AND 5),
  communication_rating integer NOT NULL CHECK (communication_rating BETWEEN 1 AND 5),
  helpfulness_rating integer NOT NULL CHECK (helpfulness_rating BETWEEN 1 AND 5),
  overall_rating numeric(3,2) GENERATED ALWAYS AS ((knowledge_rating + communication_rating + helpfulness_rating)::numeric / 3) STORED,
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, reviewer_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Session participants can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  requirements text DEFAULT '',
  salary_range text DEFAULT '',
  job_type text DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'remote')),
  required_skills text[] DEFAULT '{}',
  requires_certification boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  applications_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobs"
  ON jobs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Employers can insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = employer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employer', 'admin'))
  );

CREATE POLICY "Employers can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = employer_id);

-- Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resume_url text DEFAULT '',
  cover_letter text DEFAULT '',
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'under_review', 'interview', 'selected', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicants can view own applications"
  ON job_applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() = applicant_id OR
    EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND employer_id = auth.uid())
  );

CREATE POLICY "Authenticated users can apply to jobs"
  ON job_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Employers can update application status"
  ON job_applications FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = applicant_id OR
    EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND employer_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = applicant_id OR
    EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND employer_id = auth.uid())
  );

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'session', 'credit', 'certificate', 'job')),
  is_read boolean NOT NULL DEFAULT false,
  reference_id uuid,
  reference_type text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Meetups
CREATE TABLE IF NOT EXISTS meetups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'other' CHECK (category IN ('tailoring', 'cooking', 'bike_repair', 'carpentry', 'gardening', 'art', 'other')),
  location text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  max_attendees integer DEFAULT 20,
  attendees_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meetups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view meetups"
  ON meetups FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can create meetups"
  ON meetups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update meetups"
  ON meetups FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- Meetup RSVPs
CREATE TABLE IF NOT EXISTS meetup_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id uuid NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attended boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(meetup_id, user_id)
);

ALTER TABLE meetup_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rsvps"
  ON meetup_rsvps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can rsvp"
  ON meetup_rsvps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can update attendance"
  ON meetup_rsvps FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM meetups WHERE id = meetup_id AND organizer_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM meetups WHERE id = meetup_id AND organizer_id = auth.uid())
  );

-- Videos
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text DEFAULT '',
  duration_seconds integer DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public videos"
  ON videos FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = uploader_id);

CREATE POLICY "Users can upload videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Uploaders can update videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (auth.uid() = uploader_id)
  WITH CHECK (auth.uid() = uploader_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_learner ON sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_credits_user ON skill_credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification ON certificates(verification_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
