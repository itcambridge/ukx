-- UJC MVP Initial Schema Migration
-- This migration creates the initial database schema for the UJC MVP platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set up storage for project images
INSERT INTO storage.buckets (id, name, public) VALUES ('project_images', 'project_images', true);

-- Create tables with RLS policies

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  is_admin BOOLEAN DEFAULT false NOT NULL
);

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Environment', 'Education', 'Community', 'Health', 'Arts')),
  region TEXT NOT NULL CHECK (region IN ('UK-wide', 'England', 'Scotland', 'Wales', 'Northern Ireland')),
  beneficiary_address TEXT NOT NULL,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'live', 'completed', 'rejected')),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Additional metadata
  images JSONB DEFAULT '[]'::JSONB, -- Array of additional image URLs
  staffing_enabled BOOLEAN DEFAULT false NOT NULL
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'visible', 'hidden')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Proposals table (for governance)
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  choices JSONB NOT NULL, -- Array of voting options
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  choice INTEGER NOT NULL,
  signature TEXT NOT NULL,
  payload JSONB NOT NULL, -- The signed message payload
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Enforce one vote per proposal per voter
  UNIQUE(proposal_id, voter_id)
);

-- Donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  tx_hash TEXT NOT NULL UNIQUE,
  confirmed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Staff applications table
CREATE TABLE public.staff_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL, -- References a role in the project's roles JSON
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bid_amount NUMERIC NOT NULL,
  pitch TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  payment_tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Enforce one application per role per applicant
  UNIQUE(project_id, role_id, applicant_id)
);

-- Create indexes for performance
CREATE INDEX idx_projects_owner ON public.projects(owner_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_comments_project ON public.comments(project_id);
CREATE INDEX idx_comments_author ON public.comments(author_id);
CREATE INDEX idx_votes_proposal ON public.votes(proposal_id);
CREATE INDEX idx_votes_voter ON public.votes(voter_id);
CREATE INDEX idx_donations_project ON public.donations(project_id);
CREATE INDEX idx_staff_applications_project ON public.staff_applications(project_id);
CREATE INDEX idx_staff_applications_applicant ON public.staff_applications(applicant_id);

-- Set up Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_applications ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Projects RLS policies
CREATE POLICY "Public projects are viewable by everyone"
  ON public.projects FOR SELECT
  USING (status = 'live');

CREATE POLICY "Project owners can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Project owners can insert their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can update their own non-live projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = owner_id AND status != 'live')
  WITH CHECK (auth.uid() = owner_id AND status != 'live');

CREATE POLICY "Admins can update any project"
  ON public.projects FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Comments RLS policies
CREATE POLICY "Visible comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (status = 'visible');

CREATE POLICY "Comment authors can view their own comments"
  ON public.comments FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all comments"
  ON public.comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can update any comment"
  ON public.comments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Proposals RLS policies
CREATE POLICY "Active and closed proposals are viewable by everyone"
  ON public.proposals FOR SELECT
  USING (status IN ('active', 'closed'));

CREATE POLICY "Proposal creators can view their own proposals"
  ON public.proposals FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all proposals"
  ON public.proposals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can insert proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admins can update proposals"
  ON public.proposals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Votes RLS policies
CREATE POLICY "Votes are viewable by everyone"
  ON public.votes FOR SELECT
  USING (true);

-- Votes are inserted via Edge Functions only

-- Donations RLS policies
CREATE POLICY "Donations are viewable by everyone"
  ON public.donations FOR SELECT
  USING (true);

-- Donations are inserted via Edge Functions only

-- Staff applications RLS policies
CREATE POLICY "Project owners can view applications for their projects"
  ON public.staff_applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_id AND owner_id = auth.uid()
  ));

CREATE POLICY "Applicants can view their own applications"
  ON public.staff_applications FOR SELECT
  USING (auth.uid() = applicant_id);

CREATE POLICY "Authenticated users can insert applications"
  ON public.staff_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Project owners can update application status"
  ON public.staff_applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_id AND owner_id = auth.uid()
  ));

-- Create functions for common operations

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, wallet_address, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'wallet_address', new.raw_user_meta_data->>'wallet_address');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables with that column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_staff_applications_updated_at
  BEFORE UPDATE ON public.staff_applications
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
