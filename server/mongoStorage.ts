import { Vendor, VendorDocument, OnboardingRequest, type IVendor, type IVendorDocument, type IOnboardingRequest } from './models';
import { Types } from 'mongoose';

export class MongoStorage {
  // Vendor operations
  async createVendor(vendorData: {
    companyName: string;
    dbaName?: string;
    taxId: string;
    businessType: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    primaryContactName: string;
    primaryContactTitle: string;
    primaryContactEmail: string;
    primaryContactPhone: string;
    arContactName?: string;
    arContactEmail?: string;
    username?: string;
    password?: string;
  }): Promise<IVendor> {
    const vendor = new Vendor({
      companyName: vendorData.companyName,
      dbaName: vendorData.dbaName,
      taxId: vendorData.taxId,
      businessType: vendorData.businessType,
      address: {
        street: vendorData.street,
        city: vendorData.city,
        state: vendorData.state,
        postalCode: vendorData.postalCode,
        country: vendorData.country
      },
      primaryContact: {
        name: vendorData.primaryContactName,
        title: vendorData.primaryContactTitle,
        email: vendorData.primaryContactEmail,
        phone: vendorData.primaryContactPhone
      },
      arContact: vendorData.arContactName ? {
        name: vendorData.arContactName,
        email: vendorData.arContactEmail
      } : undefined,
      authentication: {
        username: vendorData.username,
        password: vendorData.password
      }
    });

    return await vendor.save();
  }

  async getVendorById(id: string): Promise<IVendor | null> {
    return await Vendor.findById(id).populate('documents').exec();
  }

  async getVendorByUsername(username: string): Promise<IVendor | null> {
    return await Vendor.findOne({ 'authentication.username': username }).exec();
  }

  async updateVendor(id: string, updates: Partial<IVendor>): Promise<IVendor | null> {
    return await Vendor.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async getAllVendors(): Promise<IVendor[]> {
    return await Vendor.find().populate('documents').exec();
  }

  // Document operations
  async createDocument(documentData: {
    vendorId: string;
    onboardingRequestId?: string;
    documentType: string;
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  }): Promise<IVendorDocument> {
    const document = new VendorDocument({
      vendorId: new Types.ObjectId(documentData.vendorId),
      onboardingRequestId: documentData.onboardingRequestId ? new Types.ObjectId(documentData.onboardingRequestId) : undefined,
      documentType: documentData.documentType,
      fileName: documentData.fileName,
      originalName: documentData.originalName,
      filePath: documentData.filePath,
      fileSize: documentData.fileSize,
      mimeType: documentData.mimeType
    });

    const savedDocument = await document.save();

    // Add document reference to vendor
    await Vendor.findByIdAndUpdate(
      documentData.vendorId,
      { $push: { documents: savedDocument._id } }
    );

    return savedDocument;
  }

  async getDocumentsByVendor(vendorId: string): Promise<IVendorDocument[]> {
    return await VendorDocument.find({ vendorId: new Types.ObjectId(vendorId) }).exec();
  }

  async getDocumentsByRequest(requestId: string): Promise<IVendorDocument[]> {
    return await VendorDocument.find({ onboardingRequestId: new Types.ObjectId(requestId) }).exec();
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    const document = await VendorDocument.findById(documentId);
    if (!document) return false;

    // Remove document reference from vendor
    await Vendor.findByIdAndUpdate(
      document.vendorId,
      { $pull: { documents: document._id } }
    );

    await VendorDocument.findByIdAndDelete(documentId);
    return true;
  }

  // Onboarding Request operations
  async createOnboardingRequest(requestData: {
    token: string;
    requesterCompany: string;
    requesterEmail: string;
    requestedFields: string[];
    expiresAt: Date;
  }): Promise<IOnboardingRequest> {
    const request = new OnboardingRequest({
      token: requestData.token,
      requesterCompany: requestData.requesterCompany,
      requesterEmail: requestData.requesterEmail,
      requestedFields: requestData.requestedFields,
      expiresAt: requestData.expiresAt
    });

    return await request.save();
  }

  async getOnboardingRequestByToken(token: string): Promise<IOnboardingRequest | null> {
    return await OnboardingRequest.findOne({ token }).populate('vendorId').exec();
  }

  async updateOnboardingRequest(id: string, updates: Partial<IOnboardingRequest>): Promise<IOnboardingRequest | null> {
    return await OnboardingRequest.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async linkVendorToRequest(requestId: string, vendorId: string): Promise<IOnboardingRequest | null> {
    return await OnboardingRequest.findByIdAndUpdate(
      requestId,
      { 
        vendorId: new Types.ObjectId(vendorId),
        currentStep: 2
      },
      { new: true }
    ).exec();
  }

  // Search operations
  async searchVendors(query: string): Promise<IVendor[]> {
    const searchRegex = new RegExp(query, 'i');
    return await Vendor.find({
      $or: [
        { companyName: searchRegex },
        { dbaName: searchRegex },
        { 'primaryContact.name': searchRegex },
        { 'primaryContact.email': searchRegex }
      ]
    }).exec();
  }

  async getVendorStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    inactive: number;
  }> {
    const [total, active, pending, inactive] = await Promise.all([
      Vendor.countDocuments(),
      Vendor.countDocuments({ status: 'active' }),
      Vendor.countDocuments({ status: 'pending' }),
      Vendor.countDocuments({ status: 'inactive' })
    ]);

    return { total, active, pending, inactive };
  }
}

export const mongoStorage = new MongoStorage();