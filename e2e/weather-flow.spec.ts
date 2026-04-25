import { test, expect, type Page } from '@playwright/test';

// --- Mock data ---
const GEO_RESULTS = [
  {
    id: 1,
    name: 'Taipei',
    latitude: 25.0330,
    longitude: 121.5654,
    country: 'Taiwan',
    admin1: 'Taipei City',
  },
];

const WEATHER_RESPONSE = {
  current: {
    temperature_2m: 28,
    relative_humidity_2m: 70,
    apparent_temperature: 31,
    weather_code: 0,
    wind_speed_10m: 12,
  },
  daily: {
    time: ['2026-04-25', '2026-04-26', '2026-04-27', '2026-04-28', '2026-04-29'],
    weather_code: [0, 1, 3, 61, 2],
    temperature_2m_max: [30, 29, 27, 24, 28],
    temperature_2m_min: [22, 21, 20, 19, 21],
  },
};

const OVERPASS_RESPONSE = {
  elements: [
    {
      id: 101,
      lat: 25.035,
      lon: 121.568,
      tags: { name: 'Taipei 101', amenity: 'restaurant', cuisine: 'chinese', opening_hours: 'Mo-Su 11:00-21:00', website: 'https://example.com' },
    },
    {
      id: 102,
      lat: 25.04,
      lon: 121.57,
      tags: { name: 'Night Market', tourism: 'attraction', 'addr:street': 'Raohe St' },
    },
  ],
};

// Helper to set up all route mocks
async function mockAPIs(page: Page, overrides?: { geocoding?: any; weather?: any; overpass?: any; geocodingStatus?: number }) {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: overrides?.geocodingStatus ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(overrides?.geocoding ?? { results: GEO_RESULTS }),
    })
  );
  await page.route('**/api.open-meteo.com/v1/forecast**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(overrides?.weather ?? WEATHER_RESPONSE),
    })
  );
  await page.route('**/overpass-api.de/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(overrides?.overpass ?? OVERPASS_RESPONSE),
    })
  );
}

test.describe('Weather App E2E', () => {
  test('full search → weather → venues flow', async ({ page }) => {
    await mockAPIs(page);
    await page.goto('/');

    // App loads with search prompt
    await expect(page.getByText('Search for a city to begin')).toBeVisible();

    // Type in search
    const input = page.getByPlaceholder('Search any city...');
    await input.fill('Taipei');

    // Wait for dropdown and click result
    await expect(page.getByText('Taipei', { exact: false }).first()).toBeVisible();
    await page.getByRole('button', { name: /Taipei/ }).click();

    // Weather displays
    await expect(page.locator('text=28°C').first()).toBeVisible();
    await expect(page.getByText('Clear')).toBeVisible();

    // Forecast displays
    await expect(page.getByText('5-Day Forecast')).toBeVisible();
    await expect(page.getByText('Today')).toBeVisible();

    // Venues display
    await expect(page.getByText('Places to visit')).toBeVisible();
    await expect(page.getByText('Taipei 101')).toBeVisible();
  });

  test('error state when weather API fails', async ({ page }) => {
    await mockAPIs(page, { weather: { error: 'fail' }, geocodingStatus: 200 });
    // Override weather to return HTTP error
    await page.route('**/api.open-meteo.com/v1/forecast**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
    );

    await page.goto('/');
    await page.getByPlaceholder('Search any city...').fill('Taipei');
    await page.getByRole('button', { name: /Taipei/ }).click();

    await expect(page.getByText(/Failed to fetch/i)).toBeVisible({ timeout: 10000 });
  });

  test('error state when geocoding fails', async ({ page }) => {
    await mockAPIs(page, { geocodingStatus: 500 });

    await page.goto('/');
    await page.getByPlaceholder('Search any city...').fill('Nowhere');

    // No dropdown should appear; eventually the input just stays empty
    await page.waitForTimeout(1000);
    await expect(page.getByRole('button', { name: /Nowhere/ })).not.toBeVisible();
  });

  test('venue card click opens Google Maps', async ({ page, context }) => {
    await mockAPIs(page);
    await page.goto('/');
    await page.getByPlaceholder('Search any city...').fill('Taipei');
    await page.getByRole('button', { name: /Taipei/ }).click();
    await expect(page.getByText('Taipei 101')).toBeVisible();

    // Click venue card — it opens a new tab to Google Maps
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByText('Taipei 101').click(),
    ]);
    await expect(newPage).toHaveURL(/google\.com\/maps/);
    await newPage.close();
  });

  test('accessibility: search input has accessible placeholder', async ({ page }) => {
    await mockAPIs(page);
    await page.goto('/');

    const input = page.getByPlaceholder('Search any city...');
    await expect(input).toBeVisible();
    // Heading exists
    await expect(page.getByRole('heading', { name: /Atmosphère/i })).toBeVisible();
  });

  test('loading spinner appears during search', async ({ page }) => {
    // Delay the geocoding response
    await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: GEO_RESULTS }) });
    });
    await page.route('**/api.open-meteo.com/v1/forecast**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(WEATHER_RESPONSE) })
    );
    await page.route('**/overpass-api.de/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(OVERPASS_RESPONSE) })
    );

    await page.goto('/');
    await page.getByPlaceholder('Search any city...').fill('Taipei');

    // Spinner should be visible in the search bar
    await expect(page.locator('.animate-spin').first()).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Mobile viewport', () => {
  test('app renders correctly on mobile', async ({ page }) => {
    await mockAPIs(page);
    await page.goto('/');

    // Header visible
    await expect(page.getByText('Atmosphère')).toBeVisible();

    // Search bar visible and usable
    const input = page.getByPlaceholder('Search any city...');
    await expect(input).toBeVisible();
    await input.fill('Taipei');
    await page.getByRole('button', { name: /Taipei/ }).click();

    // Weather card renders
    await expect(page.locator('text=28').first()).toBeVisible();
  });
});
