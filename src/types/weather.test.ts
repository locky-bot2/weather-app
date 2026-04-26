import { describe, it, expect } from 'vitest';
import type { HourlyData, WeatherResponse } from './weather';

describe('HourlyData interface', () => {
  it('accepts valid hourly data', () => {
    const data: HourlyData = {
      time: ['2026-04-26T08:00', '2026-04-26T09:00'],
      temperature_2m: [20, 21],
      apparent_temperature: [18, 19],
      precipitation_probability: [0, 10],
      weather_code: [0, 1],
      wind_speed_10m: [10, 12],
      relative_humidity_2m: [50, 55],
    };
    expect(data.time.length).toBe(2);
  });
});

describe('WeatherResponse with hourly', () => {
  it('accepts response with optional hourly', () => {
    const response: WeatherResponse = {
      current: {
        temperature_2m: 20,
        relative_humidity_2m: 50,
        apparent_temperature: 18,
        weather_code: 0,
        wind_speed_10m: 10,
      },
      daily: {
        time: ['2026-04-26'],
        weather_code: [0],
        temperature_2m_max: [22],
        temperature_2m_min: [12],
      },
      hourly: {
        time: ['2026-04-26T08:00'],
        temperature_2m: [20],
        apparent_temperature: [18],
        precipitation_probability: [0],
        weather_code: [0],
        wind_speed_10m: [10],
        relative_humidity_2m: [50],
      },
    };
    expect(response.hourly).toBeDefined();
  });

  it('accepts response without hourly', () => {
    const response: WeatherResponse = {
      current: {
        temperature_2m: 20,
        relative_humidity_2m: 50,
        apparent_temperature: 18,
        weather_code: 0,
        wind_speed_10m: 10,
      },
      daily: {
        time: ['2026-04-26'],
        weather_code: [0],
        temperature_2m_max: [22],
        temperature_2m_min: [12],
      },
    };
    expect(response.hourly).toBeUndefined();
  });
});
