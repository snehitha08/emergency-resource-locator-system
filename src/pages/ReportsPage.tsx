import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { IncidentReport } from '../types/database';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { FileText, MapPin, Clock, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

export function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 16));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchReports();
  }, [user]);

  async function fetchReports() {
    const { data, error } = await supabase
      .from('incident_reports')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error:', error);
    else setReports(data || []);
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('incident_reports')
        .insert({
          user_id: user?.id,
          title,
          description,
          location,
          incident_date: new Date(incidentDate).toISOString()
        });

      if (error) throw error;
      
      setTitle('');
      setDescription('');
      setLocation('');
      setIsAdding(false);
      fetchReports();
    } catch (error) {
      alert('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Incident Reports</h1>
          <p className="text-zinc-500">Report and track emergency incidents you've witnessed.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" /> Submit Report
          </Button>
        )}
      </div>

      {isAdding && (
        <Card title="Submit New Incident Report" className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Incident Title" 
              required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Road Accident at Main St"
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Description</label>
              <textarea 
                className="flex min-h-[120px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about the incident..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Location" 
                required 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. Downtown, near City Park"
              />
              <Input 
                label="Date & Time" 
                type="datetime-local" 
                required 
                value={incidentDate} 
                onChange={(e) => setIncidentDate(e.target.value)} 
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" isLoading={submitting}>
                Submit Report
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-zinc-100 animate-pulse" />)}
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:border-emerald-100 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-zinc-900">{report.title}</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-500">
                      Reported
                    </span>
                  </div>
                  <p className="text-zinc-600 text-sm mb-4 leading-relaxed">{report.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                      {report.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                      Incident: {format(new Date(report.incident_date), 'PPP p')}
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                      Submitted: {format(new Date(report.created_at), 'PPP')}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : !isAdding && (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
          <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900">No reports yet</h3>
          <p className="text-zinc-500 mb-6">You haven't submitted any incident reports yet.</p>
          <Button onClick={() => setIsAdding(true)}>Submit Your First Report</Button>
        </div>
      )}
    </div>
  );
}
