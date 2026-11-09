'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDemo } from '@/components/demo-provider';
import { CATEGORIES, formatPrice, Product, SEED_PRODUCTS } from '@/lib/demo-data';

export default function DashboardPage() {
  const { user, ready, store, saveProduct, removeProduct } = useDemo();
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  if (!ready) return <main className="p-12 text-center" role="status">Loading your farm…</main>;
  if (user?.role !== 'farmer') return <main className="max-w-xl mx-auto p-8 text-center"><h1 className="text-2xl font-bold mb-4">Your Farm Dashboard</h1><p className="mb-4">Sign in as a farmer to manage your products and see demo orders.</p><Link href="/login/" className="text-green-700 underline">Sign in as a farmer</Link></main>;
  const products = store.products.filter(p => p.farmerId === user.id);
  const orders = store.orders.filter(o => o.items.some(i => i.farmerId === user.id));
  const revenue = orders.reduce((sum, o) => sum + o.items.filter(i => i.farmerId === user.id).reduce((s, i) => s + i.price * i.quantity, 0), 0);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);
    try {
      saveProduct({ id: editing?.id ?? crypto.randomUUID(), farmerId: user.id, name: String(data.get('name')).trim(), description: String(data.get('description')).trim(), price: Number(data.get('price')), quantity: Number(data.get('quantity')), category: String(data.get('category')), imageUrl: String(data.get('image')), unit: String(data.get('unit')) });
      setOpen(false); setMessage(editing ? 'Product updated.' : 'Product added. Browse Products to see your listing.'); setError('');
    } catch (e) { setError((e as Error).message); }
  }
  return <main className="bg-gray-50 min-h-screen"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 className="text-3xl font-bold mb-2">My Farm Dashboard</h1><p className="text-gray-600 mb-8">Welcome, {user.name}. Manage your sample listings and demo sales.</p>
    <div className="grid sm:grid-cols-3 gap-4 mb-8">{[['My listings', products.length], ['Demo orders', orders.length], ['Demo sales', formatPrice(revenue)]].map(([label, value]) => <Card key={label}><CardContent className="pt-6"><p className="text-sm text-gray-600">{label}</p><p className="text-3xl font-bold text-green-700 mt-2">{value}</p></CardContent></Card>)}</div>
    {message && <p role="status" className="p-3 bg-green-50 text-green-800 mb-4 rounded-md">{message}</p>}
    {error && !open && <p role="alert" className="p-3 bg-red-50 text-red-700 mb-4 rounded-md">{error}</p>}
    <div className="flex justify-between items-center gap-4 mb-4"><h2 className="text-xl font-bold">My Products</h2><Button className="bg-green-600 hover:bg-green-700" onClick={() => { setEditing(null); setError(''); setOpen(true); }}>Add Product</Button></div>
    {!products.length ? <p className="bg-white border rounded-lg p-8 text-gray-600">You have no listings yet. Add your first product to get started.</p> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{products.map(p => <Card key={p.id} data-testid="farm-product"><CardHeader><CardTitle className="text-lg">{p.name}</CardTitle></CardHeader><CardContent><p className="text-sm text-gray-600 mb-2">{p.category} · {p.quantity} {p.unit} available</p><p className="font-semibold text-green-700 mb-4">{formatPrice(p.price)} / {p.unit}</p><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { setEditing(p); setError(''); setOpen(true); }}>Edit</Button><Button variant="outline" size="sm" className="text-red-700" onClick={() => setRemoving(p)}>Remove</Button></div></CardContent></Card>)}</div>}
    <section className="mt-8"><h2 className="text-xl font-bold mb-4">Farm Demo Orders</h2>{!orders.length ? <p className="text-gray-600">No demo orders yet. Switch to the customer demo and order one of your products to see it here.</p> : <div className="space-y-3">{orders.map(order => <Card key={order.id}><CardContent className="pt-6"><p className="font-semibold">Order {order.id.slice(0, 8)} · {store.accounts.find(a => a.id === order.customerId)?.name ?? 'Demo customer'}</p><p className="text-xs text-gray-500 mb-2">{new Date(order.createdAt).toLocaleString('en-GB', { timeZone: 'Africa/Addis_Ababa' })}</p>{order.items.filter(i => i.farmerId === user.id).map(i => <p className="text-sm" key={i.productId}>{i.name} · {i.quantity} {i.unit} · {formatPrice(i.price * i.quantity)}</p>)}</CardContent></Card>)}</div>}</section>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle><DialogDescription>Changes are saved in this browser’s demo marketplace.</DialogDescription></DialogHeader>{error && <p role="alert" className="text-red-700 text-sm">{error}</p>}<form onSubmit={submit} className="space-y-4" key={editing?.id ?? 'new'}>
      <div><Label htmlFor="product-name">Product name</Label><Input id="product-name" name="name" defaultValue={editing?.name} required maxLength={80} className="mt-1" /></div>
      <div><Label htmlFor="description">Description</Label><textarea id="description" name="description" defaultValue={editing?.description} required maxLength={400} className="w-full rounded-md border border-gray-200 p-2 mt-1" /></div>
      <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="price">Price (ETB)</Label><Input id="price" name="price" type="number" min="0.01" max="1000000" step="0.01" defaultValue={editing?.price} required className="mt-1" /></div><div><Label htmlFor="quantity">Available quantity</Label><Input id="quantity" name="quantity" type="number" min="0" max="1000000" step="1" defaultValue={editing?.quantity} required className="mt-1" /></div></div>
      <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="product-category">Category</Label><select id="product-category" name="category" defaultValue={editing?.category ?? 'Vegetables'} className="w-full border rounded-md p-2 mt-1">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div><div><Label htmlFor="unit">Unit</Label><select id="unit" name="unit" defaultValue={editing?.unit ?? 'kg'} className="w-full border rounded-md p-2 mt-1"><option value="kg">kg</option><option value="bunch">bunch</option><option value="piece">piece</option></select></div></div>
      <div><Label htmlFor="image">Sample image</Label><select id="image" name="image" defaultValue={editing?.imageUrl ?? SEED_PRODUCTS[0].imageUrl} className="w-full border rounded-md p-2 mt-1">{SEED_PRODUCTS.map(p => <option key={p.id} value={p.imageUrl}>{p.name}</option>)}</select></div>
      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Save Product</Button>
    </form></DialogContent></Dialog>
    <Dialog open={!!removing} onOpenChange={value => { if (!value) setRemoving(null); }}><DialogContent><DialogHeader><DialogTitle>Remove {removing?.name}?</DialogTitle><DialogDescription>The listing will disappear from the demo marketplace. Existing order history is kept.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setRemoving(null)}>Cancel</Button><Button variant="destructive" onClick={() => { try { if (removing) removeProduct(removing.id); setRemoving(null); setMessage('Product removed.'); setError(''); } catch (e) { setRemoving(null); setError((e as Error).message); } }}>Remove Product</Button></div></DialogContent></Dialog>
  </div></main>;
}

