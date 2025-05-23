import mongoose, { Schema, Document, Types } from 'mongoose';

// Vendor interface
export interface IVendor extends Document {
  _id: Types.ObjectId;
  companyName: string;
  dbaName?: string;
  taxId: string;
  businessType: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  arContact?: {
    name: string;
    email: string;
  };
  authentication: {
    username?: string;
    password?: string;
  };
  status: 'active' | 'inactive' | 'pending';
  documents: Types.ObjectId[];
  onboardingRequests: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Document interface
export interface IVendorDocument extends Document {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  onboardingRequestId?: Types.ObjectId;
  documentType: 'w9' | 'insurance' | 'banking' | 'license' | 'certificate' | 'other';
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  status: 'uploaded' | 'verified' | 'rejected';
  metadata?: {
    description?: string;
    expirationDate?: Date;
    notes?: string;
  };
}

// Onboarding Request interface
export interface IOnboardingRequest extends Document {
  _id: Types.ObjectId;
  token: string;
  requesterCompany: string;
  requesterEmail: string;
  requestedFields: string[];
  vendorId?: Types.ObjectId;
  status: 'pending' | 'completed' | 'expired';
  currentStep: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Vendor schema
const VendorSchema = new Schema<IVendor>({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  dbaName: {
    type: String,
    trim: true,
    maxlength: [200, 'DBA name cannot exceed 200 characters']
  },
  taxId: {
    type: String,
    required: [true, 'Tax ID is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^\d{2}-\d{7}$/.test(v); // Format: XX-XXXXXXX
      },
      message: 'Tax ID must be in format XX-XXXXXXX'
    }
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: ['Corporation', 'LLC', 'Partnership', 'Sole Proprietorship', 'Non-Profit', 'Other']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      default: 'United States',
      trim: true
    }
  },
  primaryContact: {
    name: {
      type: String,
      required: [true, 'Primary contact name is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Primary contact title is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Primary contact email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address'
      }
    },
    phone: {
      type: String,
      required: [true, 'Primary contact phone is required'],
      trim: true
    }
  },
  arContact: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address'
      }
    }
  },
  authentication: {
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters']
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters']
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'VendorDocument'
  }],
  onboardingRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'OnboardingRequest'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Document schema
const VendorDocumentSchema = new Schema<IVendorDocument>({
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor ID is required']
  },
  onboardingRequestId: {
    type: Schema.Types.ObjectId,
    ref: 'OnboardingRequest'
  },
  documentType: {
    type: String,
    required: [true, 'Document type is required'],
    enum: ['w9', 'insurance', 'banking', 'license', 'certificate', 'other']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be greater than 0']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['uploaded', 'verified', 'rejected'],
    default: 'uploaded'
  },
  metadata: {
    description: String,
    expirationDate: Date,
    notes: String
  }
}, {
  timestamps: true
});

// Onboarding Request schema
const OnboardingRequestSchema = new Schema<IOnboardingRequest>({
  token: {
    type: String,
    required: [true, 'Token is required'],
    unique: true,
    trim: true
  },
  requesterCompany: {
    type: String,
    required: [true, 'Requester company is required'],
    trim: true
  },
  requesterEmail: {
    type: String,
    required: [true, 'Requester email is required'],
    trim: true,
    lowercase: true
  },
  requestedFields: [{
    type: String,
    required: true
  }],
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending'
  },
  currentStep: {
    type: Number,
    default: 1,
    min: 1
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required']
  }
}, {
  timestamps: true
});

// Indexes for performance
VendorSchema.index({ companyName: 1 });
VendorSchema.index({ 'primaryContact.email': 1 });
VendorSchema.index({ 'authentication.username': 1 });
VendorSchema.index({ taxId: 1 });
VendorSchema.index({ status: 1 });

VendorDocumentSchema.index({ vendorId: 1 });
VendorDocumentSchema.index({ documentType: 1 });
VendorDocumentSchema.index({ uploadedAt: -1 });

OnboardingRequestSchema.index({ token: 1 });
OnboardingRequestSchema.index({ status: 1 });
OnboardingRequestSchema.index({ expiresAt: 1 });

// Virtual for full company display name
VendorSchema.virtual('displayName').get(function() {
  return this.dbaName ? `${this.companyName} (DBA: ${this.dbaName})` : this.companyName;
});

// Export models
export const Vendor = mongoose.model<IVendor>('Vendor', VendorSchema);
export const VendorDocument = mongoose.model<IVendorDocument>('VendorDocument', VendorDocumentSchema);
export const OnboardingRequest = mongoose.model<IOnboardingRequest>('OnboardingRequest', OnboardingRequestSchema);