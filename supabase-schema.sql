-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  city TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create emergency_resources table
CREATE TABLE IF NOT EXISTS emergency_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Hospital', 'Police', 'Fire', 'Ambulance', 'Women Help Center')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  availability_status TEXT DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Busy', 'Closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create sos_alerts table
CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create incident_reports table
CREATE TABLE IF NOT EXISTS incident_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Resources: Everyone can view, only admins (manual check) or system can edit
CREATE POLICY "Everyone can view resources" ON emergency_resources FOR SELECT USING (true);

-- Contacts: Users can manage only their own contacts
CREATE POLICY "Users can manage own contacts" ON emergency_contacts FOR ALL USING (auth.uid() = user_id);

-- SOS Alerts: Users can create and view their own alerts
CREATE POLICY "Users can create alerts" ON sos_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own alerts" ON sos_alerts FOR SELECT USING (auth.uid() = user_id);

-- Incident Reports: Users manage own, but everyone authenticated can see (for awareness)
CREATE POLICY "Users can manage own reports" ON incident_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view reports" ON incident_reports FOR SELECT USING (auth.role() = 'authenticated');

-- 8. Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, city)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'city');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid errors on multiple runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. Sample Data
INSERT INTO emergency_resources (name, category, address, city, contact_number, availability_status) VALUES
('City General Hospital', 'Hospital', '123 Health St', 'New York', '+1-555-0101', 'Available'),
('Central Police Station', 'Police', '456 Safety Ave', 'New York', '+1-555-0202', 'Available'),
('Metro Fire Department', 'Fire', '789 Rescue Rd', 'New York', '+1-555-0303', 'Available'),
('Rapid Response Ambulance', 'Ambulance', '101 Speed Way', 'New York', '+1-555-0404', 'Available'),
('Women Support Center', 'Women Help Center', '202 Care Ln', 'New York', '+1-555-0505', 'Available');
