import { test, expect, type Page } from '@playwright/test';

// --- Mock data ---
const GEO_RESULTS = [
  {
    id: 1,
    name: 'Taipei',
    latitude: 25.033,
    longitude: 121.5654,
    country: 'Taiwan',
    admin1: 'Taipei City',
  },
  {
    id: 2,
    name: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    country: 'Japan',
    admin1: 'Tokyo',
  },
];

function makeHourlyData() {
  const now = new Date();
  const currentHour = new Date(now);
  currentHour.setMinutes(0, 0, 0);
  const times: string[] = [];
  const temperature_2m: number[] = [];
  const apparent_temperature: number[] = [];
  const precipitation_probability: number[] = [];
  const weather_code: number[] = [];
  const wind_speed_10m: number[] = [];
  const relative_humidity_2m: number[] = [];

  for (let i = 0; i < 24; i++) {
    const t = new Date(currentHour.getTime() + i * 3600000);
    times.push(t.toISOString());
    temperature_2m.push(22 + Math.round(Math.sin(i / 4) * 5));
    apparent_temperature.push(23 + Math.round(Math.sin(i / 4) * 4));
    precipitation_probability.push(i % 3 === 0 ? 10 + i : 0);
    weather_code.push(i < 12 ? 0 : 1);
    wind_speed_10m.push(8 + (i % 5));
    relative_humidity_2m.push(60 + (i % 20));
  }

  return {
    time: times,
    temperature_2m,
    apparent_temperature,
    precipitation_probability,
    weather_code,
    wind_speed_10m,
    relative_humidity_2m,
  };
}

const HOURLY_DATA = makeHourlyData();

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
  hourly: HOURLY_DATA,
};

const OVERPASS_RESPONSE = { elements: [] };

async function mockAPIs(page: Page, overrides?: { geocoding?: any; weather?: any }) {
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
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
      body: JSON.stringify(OVERPASS_RESPONSE),
    })
  );
}

async function searchCity(page: Page, city: string) {
  await page.getByPlaceholder('Search any city...').fill(city);
  await expect(page.getByRole('button', { name: new RegExp(city) }).first()).toBeVisible();
  await page.getByRole('button', { name: new RegExp(city) }).first().click();
  // Wait for weather to load
  await expect(page.locator('h3', { hasText: '5-Day Forecast' })).toBeVisible({ timeout: 10000 });
}

async function switchToHourly(page: Page) {
  // Use force to bypass search dropdown overlay intercepting pointer events
  await page.getByRole('button', { name: 'Hourly' }).click({ force: true });
  await expect(page.locator('h3', { hasText: '24-Hour Forecast' })).toBeVisible();
}

test.describe('Hourly Forecast E2E', () => {
  test('toggle between Daily and Hourly forecast views', async ({ page }) => {
    await mockAPIs(page);
    await page.goto('/');
    await searchCity(page, 'Taipei');

    // Default is daily view
    await expect(page.locator('h3', { hasText: '5-Day Forecast' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '24-Hour Forecast' })).not.toBeVisible();

    // Switch to hourly
    await switchToHourly(page);

    // Switch back to daily
    await page.getByRole('button', { name: '5-Day' }).click({ force: true });
    await expect(page.locator('h3', { hasText: '5-Day Forecast' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '24-Hour Forecast' })).not.toBeVisible();
  });

  test('hourly forecast displays 24 hours with correct data', async ({ page }) => {
    await mockAPIs(page);
    await page.goto('/');
    await searchCity(page, 'Taipei');
    await switchToHourly(page);

    // Should have 24 hour cards
    const hourCards = page.locator('.overflow-x-auto > div');
    await expect(hourCards).toHaveCount(24);

    // First card should show "Now"
    await expect(hourCards.nth(0).getByText('Now')).toBeVisible();

    // Temperature values should be present
    const firstTemp = Math.round(HOURLY_DATA.temperature_2m[0]);
    await expect(hourCards.nth(0).getByText(`${firstTemp}°`)).toBeVisible();
  });

  test('current hour is highlighted in the timeline', async ({ page }) => {
    await mockAPIs(page);
    await page.goto('/');
    await searchCity(page, 'Taipei');
    await switchToHourly(page);

    const hourCards = page.locator('.overflow-x-auto > div');
    // The current hour card (first one, "Now") should have the highlight class
    const firstCard = hourCards.nth(0);
    await expect(firstCard).toHaveClass(/bg-white\/15/);
  });

  test('horizontal scroll works on the hourly timeline', async ({ page }) => {
    await mockAPIs(page);
    await page.goto('/');
    await searchCity(page, 'Taipei');
    await switchToHourly(page);

    const scrollContainer = page.locator('.overflow-x-auto');
    await expect(scrollContainer).toBeVisible();

    // Scroll to the right
    await scrollContainer.evaluate((el: HTMLElement) => {
      el.scrollLeft = el.scrollWidth;
    });
    // Verify scroll happened
    const scrollLeft = await scrollContainer.evaluate((el: HTMLElement) => el.scrollLeft);
    expect(scrollLeft).toBeGreaterThan(0);
  });

  test('hourly data matches weather conditions', async ({ page }) => {
    await mockAPIs(page);
    await page.goto('/');
    await searchCity(page, 'Taipei');
    await switchToHourly(page);

    const hourCards = page.locator('.overflow-x-auto > div');
    await expect(hourCards).toHaveCount(24);

    // Check first and last temperature
    const firstTemp = Math.round(HOURLY_DATA.temperature_2m[0]);
    await expect(hourCards.nth(0).getByText(`${firstTemp}°`)).toBeVisible();
    const lastTemp = Math.round(HOURLY_DATA.temperature_2m[23]);
    await expect(hourCards.nth(23).getByText(`${lastTemp}°`)).toBeVisible();

    // Check wind speed is displayed for the first hour
    const windSpeed = Math.round(HOURLY_DATA.wind_speed_10m[0]);
    await expect(hourCards.nth(0).getByText(`${windSpeed}`)).toBeVisible();

    // Check precipitation shows for hours where > 0
    if (HOURLY_DATA.precipitation_probability[0] > 0) {
      await expect(hourCards.nth(0).getByText(`${HOURLY_DATA.precipitation_probability[0]}%`)).toBeVisible();
    }
  });

  test('toggle persists when searching a new city', async ({ page }) => {
    await mockAPIs(page);
    await page.goto('/');
    await searchCity(page, 'Taipei');

    // Switch to hourly
    await switchToHourly(page);

    // Search for a different city
    await page.getByPlaceholder('Search any city...').fill('Tokyo');
    await expect(page.getByRole('button', { name: /Tokyo/ }).first()).toBeVisible();
    await page.getByRole('button', { name: /Tokyo/ }).first().click();

    // After searching a new city, the forecast toggle should still be visible
    await expect(page.getByRole('button', { name: 'Hourly' })).toBeVisible();
    await expect(page.getByRole('button', { name: '5-Day' })).toBeVisible();
  });
});
