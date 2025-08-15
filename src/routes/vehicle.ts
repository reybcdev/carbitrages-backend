import express from 'express';
import { query, param } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import {
  searchVehicles,
  getVehicleById,
  getSimilarVehicles,
  getSearchSuggestions,
  toggleFavorite,
  getFavoriteVehicles,
  getFilterOptions,
} from '../controllers/vehicleController';

const router = express.Router();

// Search vehicles with filters
router.get('/search', [
  query('query').optional().isString().trim().isLength({ min: 1, max: 100 }),
  query('make').optional().isString().trim(),
  query('model').optional().isString().trim(),
  query('yearMin').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  query('yearMax').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
  query('priceMin').optional().isInt({ min: 0 }),
  query('priceMax').optional().isInt({ min: 0 }),
  query('mileageMax').optional().isInt({ min: 0 }),
  query('condition').optional().isString().trim(),
  query('bodyType').optional().isString().trim(),
  query('fuelType').optional().isString().trim(),
  query('transmission').optional().isString().trim(),
  query('city').optional().isString().trim(),
  query('state').optional().isString().trim(),
  query('radius').optional().isInt({ min: 1, max: 500 }),
  query('sortBy').optional().isIn(['price', 'year', 'mileage', 'arbitrage', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest,
], searchVehicles);

// Get search suggestions
router.get('/suggestions', [
  query('q').isString().trim().isLength({ min: 2, max: 50 }),
  validateRequest,
], getSearchSuggestions);

// Get filter options
router.get('/filters', getFilterOptions);

// Get vehicle by ID
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
  validateRequest,
], getVehicleById);

// Get similar vehicles
router.get('/:id/similar', [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validateRequest,
], getSimilarVehicles);

// Toggle favorite (requires authentication)
router.post('/:id/favorite', [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
  validateRequest,
], authenticate, toggleFavorite);

// Get user's favorite vehicles (requires authentication)
router.get('/user/favorites', authenticate, getFavoriteVehicles);

export default router;
