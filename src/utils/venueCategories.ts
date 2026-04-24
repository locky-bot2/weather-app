export interface CategorySuggestion {
  categoryIds: string;
  emoji: string;
  label: string;
}

export function getVenueCategories(weatherCode: number): CategorySuggestion {
  // Clear/Sunny (0-3): Outdoor dining, Parks, Beach, Rooftop bars
  if (weatherCode >= 0 && weatherCode <= 3) {
    return {
      categoryIds: '13068,16032,16003,13017',
      emoji: '☀️',
      label: 'sunny',
    };
  }

  // Rain (51-67, 80-82): Museums, Cafés, Shopping malls, Libraries
  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82)
  ) {
    return {
      categoryIds: '10027,13034,17069,12086',
      emoji: '🌧️',
      label: 'rainy',
    };
  }

  // Snow (71-77, 85-86): Ski resorts, Hot springs, Indoor entertainment
  if (
    (weatherCode >= 71 && weatherCode <= 77) ||
    weatherCode === 85 ||
    weatherCode === 86
  ) {
    return {
      categoryIds: '18017,10055,10014',
      emoji: '🌨️',
      label: 'snowy',
    };
  }

  // Fog (45-48): Cafés, Bookstores, Indoor markets
  if (weatherCode >= 45 && weatherCode <= 48) {
    return {
      categoryIds: '13034,12086,17069',
      emoji: '🌫️',
      label: 'foggy',
    };
  }

  // Thunderstorm (95-99): Indoor dining, Cinemas, Museums
  if (weatherCode >= 95 && weatherCode <= 99) {
    return {
      categoryIds: '13065,13029,10027',
      emoji: '⛈️',
      label: 'stormy',
    };
  }

  // Default fallback
  return {
    categoryIds: '13068,16032,13034',
    emoji: '🌤️',
    label: 'fair',
  };
}
