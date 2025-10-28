# Nurse Logging System - Setup Guide

## Prerequisites

1. A Supabase account and project
2. The SQL schema already executed in your database

## Configuration Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on the **Settings** icon (gear) in the left sidebar
3. Navigate to **API** section
4. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbG...`)

### 2. Setup Environment Variables

1. Create a `.env` file in the root directory (same level as package.json)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** 
- Never commit the `.env` file to version control
- An `.env.example` file is provided as a template
- Restart your development server after creating/updating the `.env` file

### 3. Set Up Row Level Security (RLS)

Run the following SQL in your Supabase SQL Editor to enable security:

```sql
-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurses ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes_of_administration ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

-- Create user_roles table for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'nurse');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for authenticated users (nurses can read/write)
CREATE POLICY "Authenticated users can read departments"
ON departments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read nurses"
ON nurses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage patients"
ON patients FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read medications"
ON medications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read routes"
ON routes_of_administration FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage logs"
ON nurse_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage schedules"
ON medication_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage vital signs"
ON vital_signs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Admin-only policies
CREATE POLICY "Admins can manage departments"
ON departments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage nurses"
ON nurses FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage medications"
ON medications FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

### 4. Create Your First Admin User

After signing up through the app:

1. Get your user ID from Supabase Dashboard → Authentication → Users
2. Run this SQL to make yourself an admin:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('your-user-id-here', 'admin');
```

### 5. Configure Authentication Settings

In your Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your app URL
3. Add your app URL to **Redirect URLs**

### 6. Disable Email Confirmation (Optional - for development)

For easier testing:

1. Go to **Authentication** → **Providers** → **Email**
2. Disable **Confirm email**

## System Features

### For Nurses
- View and manage patients
- Log medication administration
- Record vital signs
- View medication schedules

### For Admins
- All nurse features
- Manage departments
- Manage nurses
- Manage medications
- View system-wide reports

## Default Routes of Administration

The system includes these pre-configured routes:
- IV (Intravenous)
- Oral
- IM (Intramuscular)
- SC (Subcutaneous)
- Topical
- Inhalation
- BD (Twice daily)
- TDS (Three times daily)
- SOS (As needed)
