import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { User, Mail, Phone, MapPin, Shield, CheckCircle } from 'lucide-react';

export function ProfilePage() {
  const { profile, user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || '');
  const [city, setCity] = useState(profile?.city || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          city: city,
        })
        .eq('id', user?.id);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Your Profile</h1>
        <p className="text-zinc-500">Manage your personal information and account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-emerald-600" />
            </div>
            <h3 className="font-bold text-zinc-900">{profile?.full_name || 'User'}</h3>
            <p className="text-sm text-zinc-500 mb-4">{profile?.email}</p>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <Shield className="h-3 w-3 mr-1" />
              {profile?.role === 'admin' ? 'Administrator' : 'Standard User'}
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card title="Personal Information">
            <form onSubmit={handleUpdate} className="space-y-4">
              {success && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-2 text-sm border border-emerald-100">
                  <CheckCircle className="h-4 w-4" />
                  Profile updated successfully!
                </div>
              )}
              
              <Input 
                label="Full Name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="John Doe"
              />
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Email Address</label>
                <div className="flex items-center h-10 w-full rounded-xl border border-zinc-100 bg-zinc-50 px-3 text-sm text-zinc-500 cursor-not-allowed">
                  <Mail className="h-4 w-4 mr-2" />
                  {profile?.email}
                </div>
                <p className="text-[10px] text-zinc-400">Email cannot be changed</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Phone Number" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  placeholder="+1 234 567 890"
                />
                <Input 
                  label="City / Location" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="New York"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full md:w-auto px-8" isLoading={loading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
