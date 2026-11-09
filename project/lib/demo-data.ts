import { z } from 'zod';

export const roleSchema = z.enum(['farmer', 'customer']);
export type Role = z.infer<typeof roleSchema>;
export const accountSchema = z.object({
  id: z.string(), name: z.string(), email: z.string().email(), phone: z.string(),
  role: roleSchema, passwordHash: z.string().optional(),
});
export type Account = z.infer<typeof accountSchema>;
export const productSchema = z.object({
  id: z.string(), name: z.string().min(1), description: z.string(),
  price: z.number().positive().finite(), quantity: z.number().int().nonnegative(),
  category: z.string(), farmerId: z.string(), imageUrl: z.string(), unit: z.string(),
});
export type Product = z.infer<typeof productSchema>;
export const orderSchema = z.object({
  id: z.string(), customerId: z.string(), createdAt: z.string(),
  items: z.array(z.object({ productId: z.string(), name: z.string(), farmerId: z.string(), price: z.number(), quantity: z.number().int().positive(), unit: z.string() })),
});
export const storeSchema = z.object({
  version: z.literal(1), accounts: z.array(accountSchema), products: z.array(productSchema),
  orders: z.array(orderSchema), sessionId: z.string().nullable(),
});
export type DemoStore = z.infer<typeof storeSchema>;
export const DEMO_PASSWORD = 'Demo123!';
export const DEMO_ACCOUNTS: Account[] = [
  { id: 'farmer-ahmed', name: 'Ahmed Hassan', email: 'farmer@ethioagri.demo', phone: '+251900000001', role: 'farmer' },
  { id: 'customer-sara', name: 'Sara Bekele', email: 'customer@ethioagri.demo', phone: '+251900000002', role: 'customer' },
];
export const FARMERS = [
  { id: 'farmer-ahmed', name: 'Ahmed Hassan', location: 'Addis Ababa', speciality: 'Organic vegetables', story: 'Growing seasonal vegetables with sustainable farming practices outside Addis Ababa.', rating: 4.8, email: 'farmer@ethioagri.demo' },
  { id: 'farmer-fatima', name: 'Fatima Ali', location: 'Jimma', speciality: 'Coffee & leafy greens', story: 'A family farm celebrating the rich coffee-growing traditions of Jimma.', rating: 4.9, email: 'fatima@ethioagri.demo' },
  { id: 'farmer-dawit', name: 'Dawit Tadesse', location: 'Bahir Dar', speciality: 'Teff & legumes', story: 'Sharing locally grown grains and pulses from the fertile fields around Lake Tana.', rating: 4.7, email: 'dawit@ethioagri.demo' },
];
export const CATEGORIES = ['Vegetables', 'Grains', 'Coffee', 'Legumes'];
export const SEED_PRODUCTS: Product[] = [
  { id: 'tomatoes', name: 'Organic Tomatoes', description: 'Fresh, ripe tomatoes harvested on our family farm.', price: 65, quantity: 120, category: 'Vegetables', farmerId: 'farmer-ahmed', imageUrl: '/images/products/tomatoes.svg', unit: 'kg' },
  { id: 'carrots', name: 'Fresh Carrots', description: 'Crunchy carrots for cooking, salads, and fresh juice.', price: 50, quantity: 80, category: 'Vegetables', farmerId: 'farmer-ahmed', imageUrl: '/images/products/carrots.svg', unit: 'kg' },
  { id: 'teff', name: 'White Teff', description: 'Quality Ethiopian teff, perfect for homemade injera.', price: 180, quantity: 200, category: 'Grains', farmerId: 'farmer-dawit', imageUrl: '/images/products/teff.jpg', unit: 'kg' },
  { id: 'coffee', name: 'Jimma Coffee Beans', description: 'Aromatic beans from the highlands of Jimma.', price: 650, quantity: 50, category: 'Coffee', farmerId: 'farmer-fatima', imageUrl: '/images/products/coffee.svg', unit: 'kg' },
  { id: 'greens', name: 'Fresh Leafy Greens', description: 'Seasonal greens picked fresh and ready for your kitchen.', price: 35, quantity: 75, category: 'Vegetables', farmerId: 'farmer-fatima', imageUrl: '/images/products/greens.svg', unit: 'bunch' },
  { id: 'beans', name: 'Red Kidney Beans', description: 'Locally grown beans, a nourishing pantry staple.', price: 110, quantity: 100, category: 'Legumes', farmerId: 'farmer-dawit', imageUrl: '/images/products/beans.svg', unit: 'kg' },
];
export function createDemoStore(): DemoStore {
  return { version: 1, accounts: structuredClone(DEMO_ACCOUNTS), products: structuredClone(SEED_PRODUCTS), orders: [], sessionId: null };
}
export function assetUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
}
export function formatPrice(price: number) {
  return `${new Intl.NumberFormat('en-ET', { maximumFractionDigits: 2 }).format(price)} ETB`;
}
