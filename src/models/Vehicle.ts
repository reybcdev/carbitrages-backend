import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicle extends Document {
  make: string;
  model: string;
  year: number;
  price: number;
  originalPrice?: number;
  mileage: number;
  condition: 'new' | 'used' | 'certified';
  bodyType: string;
  fuelType: string;
  transmission: string;
  drivetrain: string;
  exteriorColor: string;
  interiorColor: string;
  engine: string;
  vin: string;
  images: string[];
  description: string;
  features: string[];
  location: {
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  dealer: {
    id: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    email: string;
    address: string;
    rating: number;
    verified: boolean;
  };
  arbitrageScore?: number;
  marketValue?: number;
  savings?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>({
  make: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1,
    index: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    index: true,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  mileage: {
    type: Number,
    required: true,
    min: 0,
    index: true,
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'used', 'certified'],
    index: true,
  },
  bodyType: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  fuelType: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  transmission: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  drivetrain: {
    type: String,
    required: true,
    trim: true,
  },
  exteriorColor: {
    type: String,
    required: true,
    trim: true,
  },
  interiorColor: {
    type: String,
    required: true,
    trim: true,
  },
  engine: {
    type: String,
    required: true,
    trim: true,
  },
  vin: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: /^[A-HJ-NPR-Z0-9]{17}$/,
  },
  images: [{
    type: String,
    required: true,
  }],
  description: {
    type: String,
    required: true,
    trim: true,
  },
  features: [{
    type: String,
    trim: true,
  }],
  location: {
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
  },
  dealer: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  arbitrageScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  marketValue: {
    type: Number,
    min: 0,
  },
  savings: {
    type: Number,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for search optimization
VehicleSchema.index({ make: 1, model: 1 });
VehicleSchema.index({ price: 1, year: -1 });
VehicleSchema.index({ 'location.state': 1, 'location.city': 1 });
VehicleSchema.index({ condition: 1, bodyType: 1 });
VehicleSchema.index({ arbitrageScore: -1 });
VehicleSchema.index({ createdAt: -1 });

// Text search index
VehicleSchema.index({
  make: 'text',
  model: 'text',
  description: 'text',
  'location.city': 'text',
  'location.state': 'text',
});

// Geospatial index for location-based searches
VehicleSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

// Virtual for calculating savings percentage
VehicleSchema.virtual('savingsPercentage').get(function() {
  if (!this.originalPrice || !this.savings) return 0;
  return Math.round((this.savings / this.originalPrice) * 100);
});

// Virtual for full location string
VehicleSchema.virtual('fullLocation').get(function() {
  return `${this.location.city}, ${this.location.state} ${this.location.zipCode}`;
});

// Pre-save middleware to calculate savings
VehicleSchema.pre('save', function(next) {
  if (this.originalPrice && this.price && this.originalPrice > this.price) {
    this.savings = this.originalPrice - this.price;
  }
  next();
});

// Static method to get filter options
VehicleSchema.statics.getFilterOptions = async function() {
  const [makes, bodyTypes, fuelTypes, transmissions, priceRange, yearRange] = await Promise.all([
    this.distinct('make'),
    this.distinct('bodyType'),
    this.distinct('fuelType'),
    this.distinct('transmission'),
    this.aggregate([
      { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }
    ]),
    this.aggregate([
      { $group: { _id: null, min: { $min: '$year' }, max: { $max: '$year' } } }
    ]),
  ]);

  return {
    makes: makes.sort().map(make => ({ value: make.toLowerCase(), label: make, count: 0 })),
    bodyTypes: bodyTypes.sort().map(type => ({ value: type.toLowerCase(), label: type, count: 0 })),
    fuelTypes: fuelTypes.sort().map(type => ({ value: type.toLowerCase(), label: type, count: 0 })),
    transmissions: transmissions.sort().map(type => ({ value: type.toLowerCase(), label: type, count: 0 })),
    priceRange: priceRange[0] || { min: 0, max: 100000 },
    yearRange: yearRange[0] || { min: 2000, max: new Date().getFullYear() },
  };
};

// Instance method to get similar vehicles
VehicleSchema.methods.getSimilarVehicles = async function(limit = 6) {
  return this.constructor.find({
    _id: { $ne: this._id },
    make: this.make,
    $or: [
      { model: this.model },
      { bodyType: this.bodyType },
    ],
    price: {
      $gte: this.price * 0.8,
      $lte: this.price * 1.2,
    },
    isActive: true,
  })
  .sort({ arbitrageScore: -1, createdAt: -1 })
  .limit(limit);
};

export default mongoose.model<IVehicle>('Vehicle', VehicleSchema);
