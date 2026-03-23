export type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
  city: string | null;
  role: 'user' | 'admin';
  created_at: string;
};

export type EmergencyResource = {
  id: string;
  name: string;
  category: 'Hospital' | 'Police' | 'Fire' | 'Ambulance' | 'Women Help Center';
  address: string;
  city: string;
  contact_number: string;
  availability_status: 'Available' | 'Busy' | 'Closed';
  created_at: string;
};

export type EmergencyContact = {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone_number: string;
  created_at: string;
};

export type SOSAlert = {
  id: string;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  created_at: string;
  profiles?: Profile;
};

export type IncidentReport = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  incident_date: string;
  created_at: string;
  profiles?: Profile;
};
