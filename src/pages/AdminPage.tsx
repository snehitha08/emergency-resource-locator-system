import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  Users, 
  ShieldAlert, 
  FileText, 
  MapPin, 
  AlertTriangle,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Profile, SOSAlert, IncidentReport, EmergencyResource } from '../types/database';

export function AdminPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'alerts' | 'reports' | 'resources'>('alerts');
  const [loading, setLoading] = useState(true);
  
  const [users, setUsers] = useState<Profile[]>([]);
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [resources, setResources] = useState<EmergencyResource[]>([]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchData();
    }
  }, [profile, activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        setUsers(data || []);
      } else if (activeTab === 'alerts') {
        const { data } = await supabase.from('sos_alerts').select('*, profiles(*)').order('created_at', { ascending: false });
        setAlerts(data || []);
      } else if (activeTab === 'reports') {
        const { data } = await supabase.from('incident_reports').select('*, profiles(*)').order('created_at', { ascending: false });
        setReports(data || []);
      } else if (activeTab === 'resources') {
        const { data } = await supabase.from('emergency_resources').select('*').order('created_at', { ascending: false });
        setResources(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-900">Access Denied</h1>
        <p className="text-zinc-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Admin Panel</h1>
        <p className="text-zinc-500">System management and monitoring.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-100 pb-4">
        {[
          { id: 'alerts', label: 'SOS Alerts', icon: AlertTriangle },
          { id: 'reports', label: 'Incident Reports', icon: FileText },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'resources', label: 'Resources', icon: MapPin },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === tab.id 
                ? "bg-zinc-900 text-white shadow-md" 
                : "bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-100"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-2xl bg-zinc-100 animate-pulse" />)}
        </div>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              {activeTab === 'alerts' && (
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">User</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Location</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Time</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                </tr>
              )}
              {activeTab === 'reports' && (
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Title</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">User</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Location</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Date</th>
                </tr>
              )}
              {activeTab === 'users' && (
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Email</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">City</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Role</th>
                </tr>
              )}
              {activeTab === 'resources' && (
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">City</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {activeTab === 'alerts' && alerts.map(alert => (
                <tr key={alert.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{alert.profiles?.full_name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {alert.latitude ? `${alert.latitude.toFixed(4)}, ${alert.longitude?.toFixed(4)}` : 'No GPS'}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{format(new Date(alert.timestamp), 'MMM d, p')}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Emergency
                    </span>
                  </td>
                </tr>
              ))}
              {activeTab === 'reports' && reports.map(report => (
                <tr key={report.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{report.title}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{report.profiles?.full_name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{report.location}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{format(new Date(report.incident_date), 'MMM d')}</td>
                </tr>
              ))}
              {activeTab === 'users' && users.map(user => (
                <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{user.full_name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{user.city}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      user.role === 'admin' ? "bg-purple-100 text-purple-800" : "bg-zinc-100 text-zinc-800"
                    )}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
              {activeTab === 'resources' && resources.map(resource => (
                <tr key={resource.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{resource.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{resource.category}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{resource.city}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{resource.availability_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {((activeTab === 'alerts' && alerts.length === 0) || 
            (activeTab === 'reports' && reports.length === 0) || 
            (activeTab === 'users' && users.length === 0) || 
            (activeTab === 'resources' && resources.length === 0)) && (
            <div className="py-12 text-center text-zinc-500 text-sm">
              No data available for this category.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

import { cn } from '../lib/utils';
