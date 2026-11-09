'use client';

import { useDemo } from '@/components/demo-provider';
import { FARMERS } from '@/lib/demo-data';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function FarmerProfile({ farmerId, label = 'View Profile' }: { farmerId: string; label?: string }) {
  const { store } = useDemo();
  const farmer = FARMERS.find(f => f.id === farmerId);
  const account = store.accounts.find(a => a.id === farmerId);
  const name = farmer?.name ?? account?.name ?? 'Local farmer';
  const products = store.products.filter(p => p.farmerId === farmerId);
  return <Dialog><DialogTrigger asChild><Button variant="outline" size="sm">{label}</Button></DialogTrigger><DialogContent>
    <DialogHeader><DialogTitle>{name}</DialogTitle><DialogDescription>{farmer?.location ?? 'Ethiopia'} · {farmer?.speciality ?? 'Local produce'}</DialogDescription></DialogHeader>
    <p className="text-gray-700">{farmer?.story ?? 'A new farmer in the EthioAgri demo community.'}</p>
    {farmer && <p className="text-sm">★ {farmer.rating} sample rating</p>}
    <div><h3 className="font-semibold mb-2">Available products</h3>{products.length ? <ul className="space-y-1 text-sm">{products.map(p => <li key={p.id}>{p.name} · {p.quantity} {p.unit} available</li>)}</ul> : <p className="text-sm text-gray-600">No products listed yet.</p>}</div>
    <div className="bg-amber-50 p-3 rounded-md text-sm"><p className="font-semibold">Demo contact</p><p className="break-all">{farmer?.email ?? account?.email ?? 'No contact listed'}</p><p className="mt-2 text-gray-600">This is a sample profile. Contact details are for demonstration; no message is sent.</p></div>
  </DialogContent></Dialog>;
}
