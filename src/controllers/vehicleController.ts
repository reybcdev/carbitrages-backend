import { Request, Response } from 'express';

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}
import Vehicle, { IVehicle } from '../models/Vehicle';
import { logger } from '../utils/logger';

interface SearchQuery {
  query?: string;
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  condition?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  city?: string;
  state?: string;
  radius?: number;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export const searchVehicles = async (req: Request, res: Response) => {
  try {
    const {
      query,
      make,
      model,
      yearMin,
      yearMax,
      priceMin,
      priceMax,
      mileageMax,
      condition,
      bodyType,
      fuelType,
      transmission,
      city,
      state,
      radius,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = req.query as SearchQuery;

    // Build search filters
    const filters: any = { isActive: true };

    // Text search
    if (query) {
      filters.$text = { $search: query };
    }

    // Make filter (can be comma-separated)
    if (make) {
      const makes = make.split(',').map(m => new RegExp(m.trim(), 'i'));
      filters.make = { $in: makes };
    }

    // Model filter (can be comma-separated)
    if (model) {
      const models = model.split(',').map(m => new RegExp(m.trim(), 'i'));
      filters.model = { $in: models };
    }

    // Year range
    if (yearMin || yearMax) {
      filters.year = {};
      if (yearMin) filters.year.$gte = parseInt(yearMin.toString());
      if (yearMax) filters.year.$lte = parseInt(yearMax.toString());
    }

    // Price range
    if (priceMin || priceMax) {
      filters.price = {};
      if (priceMin) filters.price.$gte = parseInt(priceMin.toString());
      if (priceMax) filters.price.$lte = parseInt(priceMax.toString());
    }

    // Mileage filter
    if (mileageMax) {
      filters.mileage = { $lte: parseInt(mileageMax.toString()) };
    }

    // Condition filter (can be comma-separated)
    if (condition) {
      const conditions = condition.split(',').map(c => c.trim());
      filters.condition = { $in: conditions };
    }

    // Body type filter (can be comma-separated)
    if (bodyType) {
      const bodyTypes = bodyType.split(',').map(bt => new RegExp(bt.trim(), 'i'));
      filters.bodyType = { $in: bodyTypes };
    }

    // Fuel type filter (can be comma-separated)
    if (fuelType) {
      const fuelTypes = fuelType.split(',').map(ft => new RegExp(ft.trim(), 'i'));
      filters.fuelType = { $in: fuelTypes };
    }

    // Transmission filter (can be comma-separated)
    if (transmission) {
      const transmissions = transmission.split(',').map(t => new RegExp(t.trim(), 'i'));
      filters.transmission = { $in: transmissions };
    }

    // Location filters
    if (city) {
      filters['location.city'] = new RegExp(city, 'i');
    }
    if (state) {
      filters['location.state'] = new RegExp(state, 'i');
    }

    // Build sort object
    const sortOptions: any = {};
    switch (sortBy) {
      case 'price':
        sortOptions.price = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'year':
        sortOptions.year = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'mileage':
        sortOptions.mileage = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'arbitrage':
        sortOptions.arbitrageScore = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
    }

    // Add secondary sort by creation date
    if (sortBy !== 'createdAt') {
      sortOptions.createdAt = -1;
    }

    // Calculate pagination
    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;

    // Execute search with pagination
    const [vehicles, total] = await Promise.all([
      Vehicle.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Vehicle.countDocuments(filters),
    ]);

    // Get filter options for the current search
    const filterOptions = await getSearchFilterOptions(filters);

    const response = {
      vehicles,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      filters: filterOptions,
    };

    res.json(response);
  } catch (error) {
    logger.error('Error searching vehicles:', error);
    res.status(500).json({ message: 'Failed to search vehicles' });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findOne({ _id: id, isActive: true }).lean();

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    logger.error('Error fetching vehicle:', error);
    res.status(500).json({ message: 'Failed to fetch vehicle' });
  }
};

export const getSimilarVehicles = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 6;

    const vehicle = await Vehicle.findOne({ _id: id, isActive: true });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const similarVehicles = await vehicle.getSimilarVehicles(limit);

    res.json(similarVehicles);
  } catch (error) {
    logger.error('Error fetching similar vehicles:', error);
    res.status(500).json({ message: 'Failed to fetch similar vehicles' });
  }
};

export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json([]);
    }

    const query = q.trim();
    const regex = new RegExp(query, 'i');

    // Get suggestions from different fields
    const [makeResults, modelResults, locationResults] = await Promise.all([
      // Make suggestions
      Vehicle.aggregate([
        { $match: { make: regex, isActive: true } },
        { $group: { _id: '$make', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      // Model suggestions
      Vehicle.aggregate([
        { $match: { model: regex, isActive: true } },
        { $group: { _id: { make: '$make', model: '$model' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      // Location suggestions
      Vehicle.aggregate([
        { 
          $match: { 
            $or: [
              { 'location.city': regex },
              { 'location.state': regex }
            ],
            isActive: true 
          } 
        },
        { $group: { _id: { city: '$location.city', state: '$location.state' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const suggestions = [
      ...makeResults.map(item => ({
        type: 'make',
        value: item._id,
        label: item._id,
        count: item.count,
      })),
      ...modelResults.map(item => ({
        type: 'model',
        value: item._id.model,
        label: `${item._id.make} ${item._id.model}`,
        count: item.count,
      })),
      ...locationResults.map(item => ({
        type: 'location',
        value: `${item._id.city}, ${item._id.state}`,
        label: `${item._id.city}, ${item._id.state}`,
        count: item.count,
      })),
    ];

    // Sort by relevance and count
    suggestions.sort((a, b) => {
      const aRelevance = a.label.toLowerCase().indexOf(query.toLowerCase());
      const bRelevance = b.label.toLowerCase().indexOf(query.toLowerCase());
      
      if (aRelevance !== bRelevance) {
        return aRelevance - bRelevance;
      }
      
      return (b.count || 0) - (a.count || 0);
    });

    res.json(suggestions.slice(0, 8));
  } catch (error) {
    logger.error('Error fetching search suggestions:', error);
    res.status(500).json({ message: 'Failed to fetch suggestions' });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // This would typically involve a UserFavorites model
    // For now, we'll return a mock response
    const isFavorite = Math.random() > 0.5; // Mock toggle

    res.json({ isFavorite });
  } catch (error) {
    logger.error('Error toggling favorite:', error);
    res.status(500).json({ message: 'Failed to toggle favorite' });
  }
};

export const getFavoriteVehicles = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // This would typically query a UserFavorites model
    // For now, return empty array
    res.json([]);
  } catch (error) {
    logger.error('Error fetching favorite vehicles:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
};

export const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const options = await (Vehicle as any).getFilterOptions();
    res.json(options);
  } catch (error) {
    logger.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Failed to fetch filter options' });
  }
};

// Helper function to get filter options for current search
async function getSearchFilterOptions(baseFilters: any) {
  try {
    const [makes, models, bodyTypes, fuelTypes, transmissions] = await Promise.all([
      Vehicle.aggregate([
        { $match: baseFilters },
        { $group: { _id: '$make', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Vehicle.aggregate([
        { $match: baseFilters },
        { $group: { _id: '$model', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Vehicle.aggregate([
        { $match: baseFilters },
        { $group: { _id: '$bodyType', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Vehicle.aggregate([
        { $match: baseFilters },
        { $group: { _id: '$fuelType', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Vehicle.aggregate([
        { $match: baseFilters },
        { $group: { _id: '$transmission', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      makes: makes.map(item => ({ value: item._id.toLowerCase(), label: item._id, count: item.count })),
      models: models.map(item => ({ value: item._id.toLowerCase(), label: item._id, count: item.count })),
      bodyTypes: bodyTypes.map(item => ({ value: item._id.toLowerCase(), label: item._id, count: item.count })),
      fuelTypes: fuelTypes.map(item => ({ value: item._id.toLowerCase(), label: item._id, count: item.count })),
      transmissions: transmissions.map(item => ({ value: item._id.toLowerCase(), label: item._id, count: item.count })),
      priceRange: { min: 0, max: 100000 },
      yearRange: { min: 2000, max: new Date().getFullYear() },
    };
  } catch (error) {
    logger.error('Error getting search filter options:', error);
    return {
      makes: [],
      models: [],
      bodyTypes: [],
      fuelTypes: [],
      transmissions: [],
      priceRange: { min: 0, max: 100000 },
      yearRange: { min: 2000, max: new Date().getFullYear() },
    };
  }
}
