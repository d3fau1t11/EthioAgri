import { expect, test, Page } from '@playwright/test';

const errors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const issues: string[] = [];
  errors.set(page, issues);
  page.on('pageerror', error => issues.push(error.message));
  page.on('response', response => { if (response.status() >= 400) issues.push(`${response.status()} ${response.url()}`); });
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

async function demoLogin(page: Page, role: 'farmer' | 'customer') {
  await page.goto('login/');
  await page.getByRole('button', { name: `Try ${role} demo` }).click();
  await expect(page).toHaveURL(new RegExp(role === 'farmer' ? '/dashboard/$' : '/products/$'));
}

test('invalid credentials, phone login, refresh, logout, and farmer guard', async ({ page }) => {
  await page.goto('login/');
  await page.getByLabel('Email or Phone').fill('farmer@ethioagri.demo');
  await page.getByLabel('Password', { exact: true }).fill('incorrect');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('incorrect');
  await page.getByLabel('Email or Phone').fill('+251900000001');
  await page.getByLabel('Password', { exact: true }).fill('Demo123!');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'My Farm Dashboard' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'My Farm Dashboard' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.goto('dashboard/');
  await expect(page.getByRole('link', { name: 'Sign in as a farmer' })).toBeVisible();
  await demoLogin(page, 'customer');
  await page.goto('dashboard/');
  await expect(page.getByRole('link', { name: 'Sign in as a farmer' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Product' })).toHaveCount(0);
});

test('farmer listings and customer orders persist across account switches', async ({ page }) => {
  await demoLogin(page, 'farmer');
  await expect(page.getByRole('heading', { name: 'White Teff', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Add Product', exact: true }).click();
  await page.getByLabel('Product name').fill('Demo Peppers');
  await page.getByLabel('Description', { exact: true }).fill('Fresh green peppers from the demo farm.');
  await page.getByLabel('Price (ETB)').fill('80');
  await page.getByLabel('Available quantity').fill('3');
  await page.getByRole('button', { name: 'Save Product' }).click();
  const listing = page.getByTestId('farm-product').filter({ has: page.getByRole('heading', { name: 'Demo Peppers', exact: true }) });
  await listing.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByLabel('Price (ETB)').fill('90');
  await page.getByLabel('Available quantity').fill('2');
  await page.getByRole('button', { name: 'Save Product' }).click();
  await page.reload();
  await expect(listing).toContainText('90 ETB');
  await expect(listing).toContainText('2 kg available');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await demoLogin(page, 'customer');
  await page.getByLabel('Search products or farmers').fill('Demo Peppers');
  const product = page.locator('[data-testid^="product-"]').filter({ has: page.getByRole('heading', { name: 'Demo Peppers', exact: true }) });
  await product.getByRole('button', { name: 'Add to Basket' }).click();
  await page.getByRole('button', { name: 'Increase Demo Peppers' }).click();
  await expect(page.getByRole('button', { name: 'Increase Demo Peppers' })).toBeDisabled();
  await page.getByRole('button', { name: 'Place Demo Order' }).click();
  await expect(page.getByRole('status')).toContainText('placed');
  await expect(product.getByRole('button', { name: 'Sold out' })).toBeDisabled();
  await page.reload();
  await expect(page.getByText('Demo Peppers · 2 kg · 180 ETB', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await demoLogin(page, 'farmer');
  await expect(page.getByText('Demo Peppers · 2 kg · 180 ETB', { exact: true })).toBeVisible();
  await expect(page.getByText('180 ETB', { exact: true })).toBeVisible();
  await listing.getByRole('button', { name: 'Remove', exact: true }).click();
  await page.getByRole('button', { name: 'Remove Product', exact: true }).click();
  await expect(listing).toHaveCount(0);
  await expect(page.getByText('Demo Peppers · 2 kg · 180 ETB', { exact: true })).toBeVisible();
});

test('search, categories, empty states, local images, and farmer profiles', async ({ page }) => {
  await page.goto('products/');
  await expect(page.locator('[data-testid^="product-"]')).toHaveCount(6);
  await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  await page.getByLabel('Category', { exact: true }).selectOption('Coffee');
  await expect(page.getByRole('heading', { name: 'Jimma Coffee Beans' })).toBeVisible();
  await expect(page.locator('[data-testid^="product-"]')).toHaveCount(1);
  await page.getByLabel('Search products or farmers').fill('no-match');
  await expect(page.getByText('No products match your search.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByTestId('product-tomatoes').getByRole('button', { name: 'Contact Farmer' }).click();
  await expect(page.getByRole('dialog')).toContainText('Ahmed Hassan');
  await expect(page.getByRole('dialog')).toContainText('farmer@ethioagri.demo');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('link', { name: 'Farmers', exact: true }).click();
  await page.getByRole('button', { name: 'View Profile' }).first().click();
  await expect(page.getByRole('dialog')).toContainText('Available products');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
});

test('local signup validates phone, persists credentials, and rejects duplicate accounts', async ({ page }) => {
  await page.goto('signup/');
  await page.getByLabel('Full name').fill('Demo Grower');
  await page.getByLabel('Farmer', { exact: true }).check();
  await page.getByLabel('Phone number').fill('123');
  await page.getByLabel('Email', { exact: true }).fill('grower@example.test');
  await page.getByLabel('Password', { exact: true }).fill('LocalDemo123!');
  await page.getByRole('button', { name: 'Create Demo Account', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('Ethiopian mobile');
  await page.getByLabel('Phone number').fill('+251911111111');
  await page.getByRole('button', { name: 'Create Demo Account', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'My Farm Dashboard' })).toBeVisible();
  await expect(page.getByText('You have no listings yet.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.goto('login/');
  await page.getByLabel('Email or Phone').fill('grower@example.test');
  await page.getByLabel('Password', { exact: true }).fill('LocalDemo123!');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'My Farm Dashboard' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.goto('signup/');
  await page.getByLabel('Full name').fill('Another Grower');
  await page.getByLabel('Phone number').fill('+251922222222');
  await page.getByLabel('Email', { exact: true }).fill('GROWER@example.test');
  await page.getByLabel('Password', { exact: true }).fill('LocalDemo123!');
  await page.getByRole('button', { name: 'Create Demo Account', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('already uses');
});

test('demo reset restores seed listings and signs out', async ({ page }) => {
  await demoLogin(page, 'customer');
  await page.getByTestId('product-tomatoes').getByRole('button', { name: 'Add to Basket' }).click();
  await page.getByRole('button', { name: 'Place Demo Order' }).click();
  await page.goto('login/');
  await page.getByText('Reset demo data', { exact: true }).click();
  await page.getByRole('button', { name: 'Reset this browser’s demo' }).click();
  await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
  await demoLogin(page, 'customer');
  await expect(page.getByText('No demo orders yet.', { exact: true })).toBeVisible();
  await expect(page.getByTestId('product-tomatoes')).toContainText('120 kg available');
});

