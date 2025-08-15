import { searchVehicles, getVehicleById, getSearchSuggestions, getFeaturedVehicles, getPopularSearches } from '../utils/seedData';

// Test vehicle search functionality
console.log('🚗 Testing Vehicle Search & Discovery Mock Data\n');

// Test 1: Basic search without filters
console.log('1. Basic search (no filters):');
const basicSearch = searchVehicles();
console.log(`   Found ${basicSearch.vehicles.length} vehicles`);
console.log(`   Total results: ${basicSearch.pagination.totalResults}`);
console.log(`   First vehicle: ${basicSearch.vehicles[0]?.make} ${basicSearch.vehicles[0]?.model}\n`);

// Test 2: Search by make
console.log('2. Search by make (Toyota):');
const toyotaSearch = searchVehicles({ make: 'toyota' });
console.log(`   Found ${toyotaSearch.vehicles.length} Toyota vehicles`);
toyotaSearch.vehicles.forEach(v => console.log(`   - ${v.year} ${v.make} ${v.model} - $${v.price.toLocaleString()}`));
console.log('');

// Test 3: Search by body type
console.log('3. Search by body type (SUV):');
const suvSearch = searchVehicles({ bodyType: 'suv' });
console.log(`   Found ${suvSearch.vehicles.length} SUVs`);
suvSearch.vehicles.forEach(v => console.log(`   - ${v.year} ${v.make} ${v.model} - $${v.price.toLocaleString()}`));
console.log('');

// Test 4: Price range filter
console.log('4. Search by price range ($25k - $35k):');
const priceSearch = searchVehicles({ minPrice: 25000, maxPrice: 35000 });
console.log(`   Found ${priceSearch.vehicles.length} vehicles in price range`);
priceSearch.vehicles.forEach(v => console.log(`   - ${v.year} ${v.make} ${v.model} - $${v.price.toLocaleString()}`));
console.log('');

// Test 5: Electric vehicles
console.log('5. Search electric vehicles:');
const electricSearch = searchVehicles({ fuelType: 'electric' });
console.log(`   Found ${electricSearch.vehicles.length} electric vehicles`);
electricSearch.vehicles.forEach(v => console.log(`   - ${v.year} ${v.make} ${v.model} - $${v.price.toLocaleString()}`));
console.log('');

// Test 6: Sort by price (ascending)
console.log('6. Sort by price (lowest first):');
const priceSorted = searchVehicles({ sortBy: 'price', sortOrder: 'asc', limit: 3 });
console.log(`   Top 3 cheapest vehicles:`);
priceSorted.vehicles.forEach(v => console.log(`   - ${v.year} ${v.make} ${v.model} - $${v.price.toLocaleString()}`));
console.log('');

// Test 7: Get vehicle by ID
console.log('7. Get specific vehicle by ID:');
const specificVehicle = getVehicleById('1');
if (specificVehicle) {
  console.log(`   Vehicle: ${specificVehicle.year} ${specificVehicle.make} ${specificVehicle.model}`);
  console.log(`   Price: $${specificVehicle.price.toLocaleString()}`);
  console.log(`   Arbitrage Score: ${specificVehicle.arbitrageScore}`);
  console.log(`   Savings: $${specificVehicle.savings.toLocaleString()}`);
}
console.log('');

// Test 8: Search suggestions
console.log('8. Search suggestions for "toy":');
const suggestions = getSearchSuggestions('toy');
suggestions.forEach(s => console.log(`   - ${s.label} (${s.count} results)`));
console.log('');

// Test 9: Featured vehicles
console.log('9. Featured vehicles (top arbitrage scores):');
const featured = getFeaturedVehicles(3);
featured.forEach(v => console.log(`   - ${v.year} ${v.make} ${v.model} - Score: ${v.arbitrageScore}`));
console.log('');

// Test 10: Popular searches
console.log('10. Popular searches:');
const popular = getPopularSearches();
popular.forEach(p => console.log(`   - ${p.label} (${p.count} results)`));
console.log('');

// Test 11: Available filter options
console.log('11. Available filter options:');
const filterOptions = searchVehicles().filters;
console.log(`   Makes: ${filterOptions.makes.join(', ')}`);
console.log(`   Body Types: ${filterOptions.bodyTypes.join(', ')}`);
console.log(`   Fuel Types: ${filterOptions.fuelTypes.join(', ')}`);
console.log(`   Price Range: $${filterOptions.priceRange.min.toLocaleString()} - $${filterOptions.priceRange.max.toLocaleString()}`);
console.log(`   Year Range: ${filterOptions.yearRange.min} - ${filterOptions.yearRange.max}`);
console.log('');

console.log('✅ Mock data testing completed successfully!');
