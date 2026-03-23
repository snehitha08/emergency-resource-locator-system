import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { EmergencyContact } from '../types/database';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Users, Phone, UserPlus, Trash2, Edit2, X, Check } from 'lucide-react';

export function ContactsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchContacts();
  }, [user]);

  async function fetchContacts() {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error:', error);
    else setContacts(data || []);
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('emergency_contacts')
          .update({ name, relationship, phone_number: phoneNumber })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('emergency_contacts')
          .insert({
            user_id: user?.id,
            name,
            relationship,
            phone_number: phoneNumber
          });
        if (error) throw error;
      }

      resetForm();
      fetchContacts();
    } catch (error) {
      alert('Failed to save contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);
    
    if (error) alert('Failed to delete');
    else fetchContacts();
  };

  const startEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhoneNumber(contact.phone_number);
    setIsAdding(true);
  };

  const resetForm = () => {
    setName('');
    setRelationship('');
    setPhoneNumber('');
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Emergency Contacts</h1>
          <p className="text-zinc-500">Manage people who should be notified in emergencies.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="rounded-full">
            <UserPlus className="h-4 w-4 mr-2" /> Add Contact
          </Button>
        )}
      </div>

      {isAdding && (
        <Card title={editingId ? "Edit Contact" : "Add New Contact"} className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Full Name" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Jane Doe"
            />
            <Input 
              label="Relationship" 
              required 
              value={relationship} 
              onChange={(e) => setRelationship(e.target.value)} 
              placeholder="e.g. Mother, Spouse, Friend"
            />
            <Input 
              label="Phone Number" 
              type="tel" 
              required 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
              placeholder="e.g. +1234567890"
            />
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" isLoading={submitting}>
                {editingId ? "Update Contact" : "Save Contact"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-2xl bg-zinc-100 animate-pulse" />)}
        </div>
      ) : contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <Card key={contact.id} className="relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">{contact.name}</h3>
                    <p className="text-sm text-zinc-500">{contact.relationship}</p>
                  </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(contact)} className="p-1.5 text-zinc-400 hover:text-emerald-600">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(contact.id)} className="p-1.5 text-zinc-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center text-zinc-600 font-medium">
                  <Phone className="h-4 w-4 mr-2 text-zinc-400" />
                  {contact.phone_number}
                </div>
                <a 
                  href={`tel:${contact.phone_number}`}
                  className="p-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : !isAdding && (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
          <Users className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900">No contacts yet</h3>
          <p className="text-zinc-500 mb-6">Add your first emergency contact to stay prepared.</p>
          <Button onClick={() => setIsAdding(true)}>Add Your First Contact</Button>
        </div>
      )}
    </div>
  );
}
