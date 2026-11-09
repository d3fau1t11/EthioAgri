import Link from 'next/link';
import { Sprout, Users, ShoppingCart, TrendingUp, ArrowRight } from 'lucide-react';

export default function Home() {
  return <main className="bg-gradient-to-br from-green-50 to-yellow-50 min-h-screen">
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <span className="inline-block rounded-full bg-green-100 text-green-800 px-4 py-2 text-sm mb-6">From our farms to your table</span>
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Connecting Ethiopian<span className="text-green-600 block">Farmers & Customers</span></h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">Fresh produce, fair prices, and a closer connection to the people who grow your food. Explore our demo marketplace.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/products/" className="rounded-md bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg inline-flex items-center justify-center gap-2">Browse Products <ArrowRight className="h-5 w-5" /></Link>
        <Link href="/login/" className="rounded-md border border-green-600 text-green-800 bg-white hover:bg-green-50 px-8 py-3 text-lg">Try a Demo Account</Link>
      </div>
      <p className="mt-5 text-sm text-gray-600">New here? <Link href="/signup/" className="underline text-green-700">Create a local demo account</Link></p>
    </section>
    <section className="max-w-5xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl border border-green-100 p-8">
        <Sprout className="h-10 w-10 text-green-600 mb-4" /><h2 className="text-2xl font-bold mb-6">For Farmers</h2>
        <div className="flex gap-3 mb-5"><ShoppingCart className="h-6 w-6 text-green-600 shrink-0" /><div><h3 className="font-semibold">Your farm, your marketplace</h3><p className="text-gray-600">Add products, manage prices, and keep stock up to date.</p></div></div>
        <div className="flex gap-3"><TrendingUp className="h-6 w-6 text-green-600 shrink-0" /><div><h3 className="font-semibold">See your sales</h3><p className="text-gray-600">Track demo orders and explore your farm dashboard.</p></div></div>
      </div>
      <div className="bg-white rounded-xl border border-green-100 p-8">
        <Users className="h-10 w-10 text-green-600 mb-4" /><h2 className="text-2xl font-bold mb-6">For Customers</h2>
        <div className="flex gap-3 mb-5"><Sprout className="h-6 w-6 text-green-600 shrink-0" /><div><h3 className="font-semibold">Fresh, local produce</h3><p className="text-gray-600">Find vegetables, grains, coffee, and legumes from local farms.</p></div></div>
        <div className="flex gap-3"><Users className="h-6 w-6 text-green-600 shrink-0" /><div><h3 className="font-semibold">Meet the growers</h3><p className="text-gray-600">Read farmers’ stories and build a sample shopping basket.</p></div></div>
      </div>
    </section>
    <footer className="text-center text-sm text-gray-600 pb-8">Growing a better connection. Made for Ethiopian agriculture.</footer>
  </main>;
}
