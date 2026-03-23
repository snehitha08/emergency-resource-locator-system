import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { EmergencyResource } from '../types/database';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';
import { 
  MapPin, 
  Phone, 
  Search, 
  Filter, 
  Hospital, 
  Shield, 
  Flame, 
  Truck, 
  Heart,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = ['All', 'Hospital', 'Police', 'Fire', 'Ambulance', 'Women Help Center'];

export function ResourcesPage() {
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch data from Supabase
  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Use supabase.from('emergency_resources').select('*')
      // 2. Fetch data properly using async/await
      const { data, error: supabaseError } = await supabase
        .from('emergency_resources')
        .select('*');

      if (supabaseError) throw supabaseError;

      // 3. Store in state
      setResources(data || []);
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setError(err.message || 'Failed to load emergency resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Filter logic
  const filteredResources = resources.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hospital': return <Hospital className="h-5 w-5 text-blue-600" />;
      case 'Police': return <Shield className="h-5 w-5 text-zinc-700" />;
      case 'Fire': return <Flame className="h-5 w-5 text-orange-600" />;
      case 'Ambulance': return <Truck className="h-5 w-5 text-red-600" />;
      case 'Women Help Center': return <Heart className="h-5 w-5 text-pink-600" />;
      default: return <MapPin className="h-5 w-5 text-zinc-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Emergency Resources</h1>
          <p className="text-zinc-500 mt-1">Quickly locate life-saving services in your area.</p>
        </div>
        <Button onClick={fetchResources} variant="outline" size="sm" isLoading={loading}>
          Refresh Data
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <Input 
            className="pl-10"
            placeholder="Search by name, city, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-zinc-400" />
          </div>
          <select
            className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all appearance-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-zinc-100 animate-pulse border border-zinc-200" />
          ))}
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 4. Render using map() */}
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="flex flex-col h-full hover:shadow-md transition-all border-zinc-200">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                    {getCategoryIcon(resource.category)}
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border",
                    resource.availability_status === 'Available' 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                      : "bg-zinc-50 text-zinc-500 border-zinc-100"
                  )}>
                    {resource.availability_status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-zinc-900 leading-tight">{resource.name}</h3>
                  <p className="text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wide">
                    {resource.category}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start text-sm text-zinc-600">
                    <MapPin className="h-4 w-4 mr-3 mt-0.5 text-zinc-400 flex-shrink-0" />
                    <span className="leading-snug">{resource.address}, {resource.city}</span>
                  </div>
                  <div className="flex items-center text-sm text-zinc-600">
                    <Phone className="h-4 w-4 mr-3 text-zinc-400 flex-shrink-0" />
                    <span className="font-medium">{resource.contact_number}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100">
                <a 
                  href={`tel:${resource.contact_number}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-sm"
                >
                  <Phone className="h-4 w-4" />
                  Call Emergency Line
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* 5. Show fallback text if empty */
        <div className="flex flex-col items-center justify-center py-24 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
          <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-zinc-300" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">No resources found</h3>
          <p className="text-zinc-500 max-w-xs text-center mt-2">
            We couldn't find any resources matching your current search or category filter.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          >
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
