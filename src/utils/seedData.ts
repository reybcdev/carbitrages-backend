import { mockVehicles, mockSearchSuggestions } from '../data/mockVehicles';

// In-memory storage for MVP testing
let vehicleDatabase = [...mockVehicles];
let searchSuggestionsDatabase = [...mockSearchSuggestions];

export interface SearchFilters {
  make?: string;
  model?: string;
  bodyType?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  fuelType?: string;
  transmission?: string;
  location?: string;
  radius?: number;
  sortBy?: 'price' | 'year' | 'mileage' | 'arbitrageScore';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const searchVehicles = (filters: SearchFilters = {}) => {
  let results = [...vehicleDatabase];

  // Apply filters
  if (filters.make) {
    results = results.filter(v => 
      v.make.toLowerCase().includes(filters.make!.toLowerCase())
    );
  }

  if (filters.model) {
    results = results.filter(v => 
      v.model.toLowerCase().includes(filters.model!.toLowerCase())
    );
  }

  if (filters.bodyType) {
    results = results.filter(v => v.bodyType === filters.bodyType);
  }

  if (filters.condition) {
    results = results.filter(v => v.condition === filters.condition);
  }

  if (filters.minPrice) {
    results = results.filter(v => v.price >= filters.minPrice!);
  }

  if (filters.maxPrice) {
    results = results.filter(v => v.price <= filters.maxPrice!);
  }

  if (filters.minYear) {
    results = results.filter(v => v.year >= filters.minYear!);
  }

  if (filters.maxYear) {
    results = results.filter(v => v.year <= filters.maxYear!);
  }

  if (filters.maxMileage) {
    results = results.filter(v => v.mileage <= filters.maxMileage!);
  }

  if (filters.fuelType) {
    results = results.filter(v => v.fuelType === filters.fuelType);
  }

  if (filters.transmission) {
    results = results.filter(v => v.transmission === filters.transmission);
  }

  // Apply sorting
  const sortBy = filters.sortBy || 'arbitrageScore';
  const sortOrder = filters.sortOrder || 'desc';

  results.sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'year':
        aValue = a.year;
        bValue = b.year;
        break;
      case 'mileage':
        aValue = a.mileage;
        bValue = b.mileage;
        break;
      case 'arbitrageScore':
      default:
        aValue = a.arbitrageScore;
        bValue = b.arbitrageScore;
        break;
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedResults = results.slice(startIndex, endIndex);

  return {
    vehicles: paginatedResults,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(results.length / limit),
      totalResults: results.length,
      hasNextPage: endIndex < results.length,
      hasPrevPage: page > 1,
    },
    filters: {
      makes: [...new Set(vehicleDatabase.map(v => v.make))].sort(),
      models: [...new Set(vehicleDatabase.map(v => v.model))].sort(),
      bodyTypes: [...new Set(vehicleDatabase.map(v => v.bodyType))].sort(),
      conditions: [...new Set(vehicleDatabase.map(v => v.condition))].sort(),
      fuelTypes: [...new Set(vehicleDatabase.map(v => v.fuelType))].sort(),
      transmissions: [...new Set(vehicleDatabase.map(v => v.transmission))].sort(),
      priceRange: {
        min: Math.min(...vehicleDatabase.map(v => v.price)),
        max: Math.max(...vehicleDatabase.map(v => v.price)),
      },
      yearRange: {
        min: Math.min(...vehicleDatabase.map(v => v.year)),
        max: Math.max(...vehicleDatabase.map(v => v.year)),
      },
    },
  };
};

export const getVehicleById = (id: string) => {
  return vehicleDatabase.find(v => v.id === id);
};

export const getSearchSuggestions = (query: string) => {
  if (!query || query.length < 2) return [];

  return searchSuggestionsDatabase
    .filter(suggestion => 
      suggestion.label.toLowerCase().includes(query.toLowerCase()) ||
      suggestion.value.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 8);
};

export const getFeaturedVehicles = (limit: number = 6) => {
  return vehicleDatabase
    .sort((a, b) => b.arbitrageScore - a.arbitrageScore)
    .slice(0, limit);
};

export const getPopularSearches = () => {
  return [
    { label: 'Toyota Camry', query: '?make=toyota&model=camry', count: 45 },
    { label: 'Honda Accord', query: '?make=honda&model=accord', count: 38 },
    { label: 'Ford F-150', query: '?make=ford&model=f-150', count: 42 },
    { label: 'Tesla Model 3', query: '?make=tesla&model=model 3', count: 28 },
    { label: 'SUVs', query: '?bodyType=suv', count: 156 },
    { label: 'Under $30k', query: '?maxPrice=30000', count: 234 },
    { label: 'Electric Cars', query: '?fuelType=electric', count: 67 },
    { label: 'Low Mileage', query: '?maxMileage=15000', count: 89 },
  ];
};
