'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingBasket, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDemo } from '@/components/demo-provider';
import { FarmerProfile } from '@/components/farmer-profile';
import { assetUrl, CATEGORIES, FARMERS, formatPrice } from '@/lib/demo-data';

export default function ProductsPage() {
  const { store, user, ready, placeOrder } = useDemo();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const products = store.products.filter(p => {
    const farmer = FARMERS.find(f => f.id === p.farmerId);
    const account = store.accounts.find(a => a.id === p.farmerId);
    return (category === 'all' || p.category === category) && `${p.name} ${p.description} ${farmer?.name ?? account?.name ?? ''} ${farmer?.location ?? ''}`.toLowerCase().includes(search.toLowerCase());
  });
  const cartItems = Object.entries(cart).map(([id, quantity]) => ({ product: store.products.find(p => p.id === id), quantity })).filter(item => item.product);
  const total = cartItems.reduce((sum, item) => sum + item.product!.price * item.quantity, 0);
  const orders = user ? store.orders.filter(o => o.customerId === user.id) : [];
  function checkout() {
    setError(''); setMessage('');
    try {
      const id = placeOrder(Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity })));
      setCart({}); setMessage(`Demo order ${id.slice(0, 8)} placed! Stock and order history have been updated in this browser. No payment or delivery is arranged.`);
    } catch (e) { setError((e as Error).message); }
  }
  return <main className="bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Fresh Products</h1>
      <p className="text-gray-600 mb-6">Discover fresh produce from Ethiopian farms. Prices are per kg unless marked otherwise.</p>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1"><Label htmlFor="search" className="sr-only">Search products or farmers</Label><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input id="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or farmers" className="pl-9 bg-white" /></div>
        <div><Label htmlFor="category" className="sr-only">Category</Label><select id="category" value={category} onChange={e => setCategory(e.target.value)} className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"><option value="all">All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
      </div>
      {!ready ? <p role="status" className="py-12 text-center">Loading demo marketplace…</p> : <>
        <p className="text-sm text-gray-600 mb-4">{products.length} products found</p>
        {products.length === 0 ? <div className="rounded-lg bg-white border p-12 text-center"><p className="text-gray-600">No products match your search.</p><Button variant="link" onClick={() => { setSearch(''); setCategory('all'); }}>Clear filters</Button></div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`product-${product.id}`}>
            <Image src={assetUrl(product.imageUrl)} alt={product.name} width={600} height={360} className="w-full h-48 object-cover" />
            <CardHeader><CardTitle className="text-lg">{product.name}</CardTitle><CardDescription>{product.description}</CardDescription><p className="text-sm text-gray-600">{FARMERS.find(f => f.id === product.farmerId)?.name ?? store.accounts.find(a => a.id === product.farmerId)?.name ?? 'Local farmer'}</p><p className="text-xs text-gray-500">{product.category} · {product.quantity} {product.unit} available</p></CardHeader>
            <CardContent className="space-y-4"><p className="text-2xl font-bold text-green-600">{formatPrice(product.price)}<span className="text-sm font-normal text-gray-600"> / {product.unit}</span></p><div className="flex flex-wrap gap-2"><FarmerProfile farmerId={product.farmerId} label="Contact Farmer" /><Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={product.quantity === 0 || (cart[product.id] ?? 0) >= product.quantity} onClick={() => { setCart(prev => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 })); setMessage(''); setError(''); }}>{product.quantity === 0 ? 'Sold out' : 'Add to Basket'}</Button></div></CardContent>
          </Card>)}
        </div>}
        <section className="bg-white border rounded-lg p-6 mt-8" aria-label="Shopping basket">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><ShoppingBasket className="h-6 w-6 text-green-600" />Your Demo Basket</h2>
          {message && <p role="status" className="bg-green-50 text-green-800 p-3 rounded-md mb-4">{message}</p>}
          {error && <p role="alert" className="bg-red-50 text-red-700 p-3 rounded-md mb-4">{error}</p>}
          {!cartItems.length ? <p className="text-gray-600">Add a product to get started.</p> : <>
            <ul className="divide-y">{cartItems.map(({ product: p, quantity }) => p && <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 py-3"><div><p className="font-medium">{p.name}</p><p className="text-sm text-gray-600">{quantity} {p.unit} · {formatPrice(p.price * quantity)}</p></div><div className="flex items-center gap-2"><Button variant="outline" size="sm" aria-label={`Decrease ${p.name}`} onClick={() => setCart(prev => { const next = { ...prev }; if (next[p.id] <= 1) delete next[p.id]; else next[p.id]--; return next; })}>−</Button><span>{quantity}</span><Button variant="outline" size="sm" aria-label={`Increase ${p.name}`} disabled={quantity >= p.quantity} onClick={() => setCart(prev => ({ ...prev, [p.id]: prev[p.id] + 1 }))}>+</Button><Button variant="ghost" size="sm" onClick={() => setCart(prev => { const next = { ...prev }; delete next[p.id]; return next; })}>Remove</Button></div></li>)}</ul>
            <div className="flex flex-wrap justify-between items-center gap-4 mt-4"><p className="text-xl font-bold">Total: {formatPrice(total)}</p>{user?.role === 'customer' ? <Button className="bg-green-600 hover:bg-green-700" onClick={checkout}>Place Demo Order</Button> : <p className="text-sm text-gray-600"><Link href="/login/" className="text-green-700 underline">Sign in as a customer</Link> to place a demo order.</p>}</div>
          </>}
        </section>
        {user?.role === 'customer' && <section className="mt-8"><h2 className="text-xl font-bold mb-4">My Demo Orders</h2>{orders.length === 0 ? <p className="text-gray-600">No demo orders yet.</p> : <div className="space-y-3">{orders.map(order => <Card key={order.id}><CardContent className="pt-6"><p className="font-semibold">Order {order.id.slice(0, 8)}</p><p className="text-xs text-gray-500 mb-2">{new Date(order.createdAt).toLocaleString('en-GB', { timeZone: 'Africa/Addis_Ababa' })}</p>{order.items.map(item => <p key={item.productId} className="text-sm">{item.name} · {item.quantity} {item.unit} · {formatPrice(item.price * item.quantity)}</p>)}<p className="font-semibold mt-2">Total: {formatPrice(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</p></CardContent></Card>)}</div>}</section>}
      </>}
    </div>
  </main>;
}
