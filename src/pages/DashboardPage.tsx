import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  MapPin, 
  Phone, 
  Clock,
  AlertTriangle,
  Database,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { EmergencyContact, IncidentReport, EmergencyResource } from '../types/database';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const { profile, user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ resources: number, reports: number, status: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchSystemStats();
    }
  }, [user]);

  async function fetchSystemStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setDbStatus(data);
    } catch (error) {
      console.error('Failed to fetch system stats');
    }
  }

  async function fetchData() {
    // Fetch contacts
    const { data: contactsData } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user?.id)
      .limit(3);
    if (contactsData) setContacts(contactsData);

    // Fetch reports
    const { data: reportsData } = await supabase
      .from('incident_reports')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(3);
    if (reportsData) setReports(reportsData);

    // Fetch resources in user's city
    if (profile?.city) {
      const { data: resourcesData } = await supabase
        .from('emergency_resources')
        .select('*')
        .eq('city', profile.city)
        .limit(3);
      if (resourcesData) setResources(resourcesData);
    }
  }

  const handleSOS = async () => {
    setSosLoading(true);
    setSosSuccess(false);

    try {
      let latitude = null;
      let longitude = null;

      if ("geolocation" in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      const { error } = await supabase.from('sos_alerts').insert({
        user_id: user?.id,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;
      setSosSuccess(true);
      toast.success('SOS Alert Sent! Help is on the way.', {
        duration: 5000,
        icon: '🚨',
        style: {
          borderRadius: '12px',
          background: '#18181b',
          color: '#fff',
        },
      });
      setTimeout(() => setSosSuccess(false), 5000);
    } catch (error) {
      console.error('SOS Error:', error);
      toast.error('Failed to send SOS alert.');
    } finally {
      setSosLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Hello, {profile?.full_name || 'User'}</h1>
          <p className="text-zinc-500">Stay safe and prepared. Here is your emergency overview.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm font-medium text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <span>{profile?.city || 'Location not set'}</span>
        </div>
      </div>

      {/* SOS Button Section */}
      <Card className="bg-red-50 border-red-100 overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-red-900 flex items-center justify-center md:justify-start gap-2">
              <AlertTriangle className="h-6 w-6" />
              Emergency SOS
            </h2>
            <p className="mt-2 text-red-700 max-w-md">
              Click the button below to instantly alert emergency services and save your current location.
            </p>
          </div>
          <Button 
            variant="danger" 
            size="lg" 
            className="h-24 w-24 rounded-full shadow-xl shadow-red-200 animate-pulse hover:animate-none"
            onClick={handleSOS}
            isLoading={sosLoading}
          >
            <span className="text-xl font-black">SOS</span>
          </Button>
        </div>
        {sosSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-emerald-100 text-emerald-800 rounded-xl text-center font-medium border border-emerald-200"
          >
            SOS Alert Sent Successfully! Help is on the way.
          </motion.div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Contacts */}
        <div className="lg:col-span-1 space-y-8">
          <Card title="System Status" className="bg-zinc-900 text-white border-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                {dbStatus?.status === "Connected to Database" ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase">
                    <CheckCircle2 className="h-3 w-3" /> Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase">
                    <XCircle className="h-3 w-3" /> Offline
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-2xl font-bold text-white">{dbStatus?.resources || 0}</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Resources</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-2xl font-bold text-white">{dbStatus?.reports || 0}</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Reports</p>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 text-center">
                Backend API: Connected via Express.js
              </p>
            </div>
          </Card>

          <Card title="Profile Summary" className="h-fit">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{profile?.full_name}</p>
                  <p className="text-xs text-zinc-500">{profile?.email}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-50 space-y-2">
                <div className="flex items-center text-sm text-zinc-600">
                  <Phone className="h-4 w-4 mr-2 text-zinc-400" />
                  {profile?.phone_number || 'No phone set'}
                </div>
                <div className="flex items-center text-sm text-zinc-600">
                  <MapPin className="h-4 w-4 mr-2 text-zinc-400" />
                  {profile?.city || 'No city set'}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Emergency Contacts" className="h-fit">
            <div className="space-y-4">
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{contact.name}</p>
                      <p className="text-xs text-zinc-500">{contact.relationship}</p>
                    </div>
                    <a href={`tel:${contact.phone_number}`} className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <Phone className="h-4 w-4" />
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">No contacts added yet.</p>
              )}
              <Button variant="outline" className="w-full" onClick={() => window.location.href='/contacts'}>
                Manage Contacts
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Recent Reports & Resources */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Recent Incident Reports">
            <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <div key={report.id} className="p-4 rounded-xl border border-zinc-100 hover:border-emerald-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-zinc-900">{report.title}</h4>
                      <span className="text-xs text-zinc-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(report.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 line-clamp-2">{report.description}</p>
                    <div className="mt-2 flex items-center text-xs text-zinc-400">
                      <MapPin className="h-3 w-3 mr-1" />
                      {report.location}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 text-center py-8">No reports submitted yet.</p>
              )}
              <Button variant="outline" className="w-full" onClick={() => window.location.href='/reports'}>
                View All Reports
              </Button>
            </div>
          </Card>

          <Card title={`Emergency Resources in ${profile?.city || 'your area'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {resources.length > 0 ? (
                resources.map((resource) => (
                  <div key={resource.id} className="p-4 rounded-xl bg-zinc-50 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {resource.category}
                      </span>
                      <h4 className="mt-2 font-semibold text-zinc-900 text-sm">{resource.name}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{resource.address}</p>
                    </div>
                    <a 
                      href={`tel:${resource.contact_number}`} 
                      className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-white bg-zinc-900 py-2 rounded-lg"
                    >
                      <Phone className="h-3 w-3" />
                      Call Now
                    </a>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-8 text-center">
                  <p className="text-sm text-zinc-500">No resources found for your city.</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => window.location.href='/resources'}>
                    Search Resources
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
