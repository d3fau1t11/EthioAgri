'use client';

import { Sprout, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemo } from '@/components/demo-provider';
import { FarmerProfile } from '@/components/farmer-profile';
import { FARMERS } from '@/lib/demo-data';

export default function FarmersPage() {
  const { store, ready } = useDemo();
  const farmers = [...FARMERS, ...store.accounts.filter(a => a.role === 'farmer' && !FARMERS.some(f => f.id === a.id)).map(a => ({ ...a, location: 'Ethiopia', speciality: 'Local produce', story: 'A new farmer in the EthioAgri community.', rating: null }))];
  return <main className="bg-gray-50 min-h-screen"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 className="text-3xl font-bold mb-2">Meet Our Farmers</h1><p className="text-gray-600 mb-8">Discover the growers behind your food. These are sample profiles for the demo.</p>
    {!ready ? <p role="status">Loading farmers…</p> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{farmers.map(farmer => <Card key={farmer.id} className="overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-green-100 to-yellow-100 flex items-center justify-center"><Sprout className="h-16 w-16 text-green-600" /></div>
      <CardHeader><CardTitle>{farmer.name}</CardTitle><CardDescription className="flex items-center gap-1"><MapPin className="h-4 w-4" />{farmer.location} · {farmer.speciality}</CardDescription></CardHeader>
      <CardContent className="space-y-4"><p className="text-sm text-gray-600">{farmer.story}</p><p className="text-sm">{store.products.filter(p => p.farmerId === farmer.id).length} products {farmer.rating && `· ★ ${farmer.rating} sample rating`}</p><FarmerProfile farmerId={farmer.id} /></CardContent>
    </Card>)}</div>}
  </div></main>;
}
