'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Account, createDemoStore, DEMO_PASSWORD, DemoStore, Product, productSchema, Role, storeSchema } from '@/lib/demo-data';

const STORAGE_KEY = 'ethioagri-demo-v1';
type DemoContextType = {
  store: DemoStore; user: Account | null; ready: boolean; notice: string;
  login: (identifier: string, password: string) => Promise<Account>;
  signup: (name: string, email: string, phone: string, password: string, role: Role) => Promise<Account>;
  logout: () => void; reset: () => void;
  saveProduct: (product: Product) => void; removeProduct: (id: string) => void;
  placeOrder: (items: { productId: string; quantity: number }[]) => string;
};
const DemoContext = createContext<DemoContextType | null>(null);
const normalizePhone = (phone: string) => phone.replace(/[\s()-]/g, '').replace(/^0(?=\d{9}$)/, '+251').replace(/^251/, '+251');
async function hashPassword(password: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<DemoStore>(createDemoStore);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setStore(storeSchema.parse(JSON.parse(saved)));
    } catch {
      setNotice('Saved demo data could not be loaded. Starting with fresh sample data.');
    } finally { setReady(true); }
  }, []);
  const user = store.accounts.find(account => account.id === store.sessionId) ?? null;
  function commit(next: DemoStore) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch { throw new Error('Allow browser storage to save your demo activity.'); }
    setStore(next);
  }
  async function login(identifier: string, password: string) {
    const account = store.accounts.find(a => a.email.toLowerCase() === identifier.trim().toLowerCase() || normalizePhone(a.phone) === normalizePhone(identifier.trim()));
    const valid = account && (account.passwordHash ? account.passwordHash === await hashPassword(password) : password === DEMO_PASSWORD);
    if (!valid || !account) throw new Error('Email / phone or password is incorrect. Try one of the demo accounts below.');
    commit({ ...store, sessionId: account.id });
    return account;
  }
  async function signup(name: string, email: string, phone: string, password: string, role: Role) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = normalizePhone(phone.trim());
    if (!name.trim()) throw new Error('Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error('Please enter a valid email.');
    if (!/^\+251[79]\d{8}$/.test(cleanPhone)) throw new Error('Enter an Ethiopian mobile number, for example +2519XXXXXXXX.');
    if (password.length < 8) throw new Error('Use a password with at least 8 characters.');
    if (store.accounts.some(a => a.email.toLowerCase() === cleanEmail || normalizePhone(a.phone) === cleanPhone)) throw new Error('An account already uses that email or phone. Please sign in.');
    const account: Account = { id: crypto.randomUUID(), name: name.trim(), email: cleanEmail, phone: cleanPhone, role, passwordHash: await hashPassword(password) };
    commit({ ...store, accounts: [...store.accounts, account], sessionId: account.id });
    return account;
  }
  function saveProduct(product: Product) {
    if (user?.role !== 'farmer' || product.farmerId !== user.id) throw new Error('Sign in as the farmer who owns this listing.');
    const existing = store.products.find(p => p.id === product.id);
    if (existing && existing.farmerId !== user.id) throw new Error('You can only edit your own products.');
    const valid = productSchema.parse(product);
    commit({ ...store, products: existing ? store.products.map(p => p.id === valid.id ? valid : p) : [...store.products, valid] });
  }
  function removeProduct(id: string) {
    if (user?.role !== 'farmer' || store.products.find(p => p.id === id)?.farmerId !== user.id) throw new Error('You can only remove your own products.');
    commit({ ...store, products: store.products.filter(p => p.id !== id) });
  }
  function placeOrder(cart: { productId: string; quantity: number }[]) {
    if (user?.role !== 'customer') throw new Error('Sign in as a customer to place a demo order.');
    if (!cart.length) throw new Error('Your basket is empty.');
    if (new Set(cart.map(item => item.productId)).size !== cart.length) throw new Error('Please combine duplicate basket items.');
    const items = cart.map(item => {
      const product = store.products.find(p => p.id === item.productId);
      if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > product.quantity) throw new Error('A product is no longer available in that quantity. Update your basket.');
      return { ...item, name: product.name, farmerId: product.farmerId, price: product.price, unit: product.unit };
    });
    const order = { id: crypto.randomUUID(), customerId: user.id, createdAt: new Date().toISOString(), items };
    commit({ ...store, orders: [order, ...store.orders], products: store.products.map(p => ({ ...p, quantity: p.quantity - (items.find(i => i.productId === p.id)?.quantity ?? 0) })) });
    return order.id;
  }
  return <DemoContext.Provider value={{ store, user, ready, notice, login, signup, saveProduct, removeProduct, placeOrder,
    logout: () => commit({ ...store, sessionId: null }), reset: () => { commit(createDemoStore()); setNotice(''); },
  }}>{children}</DemoContext.Provider>;
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('DemoProvider is missing.');
  return context;
}
