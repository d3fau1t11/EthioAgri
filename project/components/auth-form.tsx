'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDemo } from '@/components/demo-provider';
import { DEMO_ACCOUNTS, DEMO_PASSWORD, Role } from '@/lib/demo-data';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { login, signup, ready, user, reset } = useDemo();
  const router = useRouter();
  const [role, setRole] = useState<Role>('customer');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function signIn(identifier: string, password: string) {
    setBusy(true); setError('');
    try {
      const account = await login(identifier, password);
      router.push(account.role === 'farmer' ? '/dashboard/' : '/products/');
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (mode === 'login') return signIn(String(data.get('email')), String(data.get('password')));
    setBusy(true); setError('');
    try {
      const account = await signup(String(data.get('name')), String(data.get('email')), String(data.get('phone')), String(data.get('password')), role);
      router.push(account.role === 'farmer' ? '/dashboard/' : '/products/');
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 px-4 py-12">
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <Sprout className="h-12 w-12 text-green-600 mx-auto mb-2" />
        <CardTitle className="text-2xl">{mode === 'login' ? 'Welcome Back' : 'Join EthioAgri'}</CardTitle>
        <CardDescription>{mode === 'login' ? 'Sign in to your demo account' : 'Create an account for this browser’s demo'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {user && <p className="text-sm text-green-800">Currently signed in as {user.name}. Signing in again switches accounts.</p>}
        {error && <p role="alert" className="rounded-md bg-red-50 text-red-700 p-3 text-sm">{error}</p>}
        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && <>
            <fieldset><legend className="text-sm font-medium mb-2">I am a</legend><div className="flex gap-6">{(['customer', 'farmer'] as const).map(value => <label key={value} className="flex gap-2 items-center"><input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} />{value === 'farmer' ? 'Farmer' : 'Customer'}</label>)}</div></fieldset>
            <div><Label htmlFor="name">Full name</Label><Input id="name" name="name" autoComplete="name" required maxLength={80} className="mt-2" /></div>
            <div><Label htmlFor="phone">Phone number</Label><Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+2519XXXXXXXX" required className="mt-2" /></div>
          </>}
          <div><Label htmlFor="email">{mode === 'login' ? 'Email or Phone' : 'Email'}</Label><Input id="email" name="email" type={mode === 'login' ? 'text' : 'email'} autoComplete="username" required placeholder="your@email.com" className="mt-2" /></div>
          <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'signup' ? 8 : undefined} required className="mt-2" /></div>
          {mode === 'signup' && <p className="text-xs text-gray-600">Use sample details and a demo-only password. Accounts live in this browser; they are not real marketplace accounts.</p>}
          <Button disabled={!ready || busy} className="w-full bg-green-600 hover:bg-green-700" type="submit">{busy ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Demo Account'}</Button>
        </form>
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
          <h2 className="font-semibold">Try a demo account</h2>
          <p className="text-sm text-gray-700">Password for both: <code className="font-semibold">{DEMO_PASSWORD}</code></p>
          {DEMO_ACCOUNTS.map(account => <div key={account.id} className="border-t border-green-200 pt-3">
            <p className="font-medium capitalize">{account.role}</p><p className="text-sm break-all mb-2">{account.email}</p>
            <Button variant="outline" className="w-full" disabled={!ready || busy} onClick={() => signIn(account.email, DEMO_PASSWORD)}>Try {account.role} demo</Button>
          </div>)}
        </div>
        <p className="text-center text-sm">{mode === 'login' ? 'New here?' : 'Already have an account?'} <Link className="text-green-700 underline" href={mode === 'login' ? '/signup/' : '/login/'}>{mode === 'login' ? 'Sign up' : 'Sign in'}</Link></p>
        <details className="text-sm text-gray-600"><summary className="cursor-pointer">Reset demo data</summary><p className="my-2">This removes local accounts, listings, and orders and restores sample data.</p><Button variant="outline" disabled={!ready || busy} onClick={() => { try { reset(); setError(''); } catch (e) { setError((e as Error).message); } }}>Reset this browser’s demo</Button></details>
      </CardContent>
    </Card>
  </main>;
}
