import { z } from 'zod';

// Doctor Schemas
export const createDoctorSchema = z.object({
  name: z.string().min(1, 'Doctor name is required'),
  specialization: z.string().optional(),
  contactNumber: z.string().optional(),
});

export const doctorIdSchema = z.object({
  id: z.number().positive('Doctor ID must be a positive number'),
});

// Test Schemas
export const createTestSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
});

export const testIdSchema = z.object({
  id: z.number().positive('Test ID must be a positive number'),
});

// Test Parameter Schemas
export const createTestParameterSchema = z.object({
  testId: z.number().positive('Test ID must be a positive number'),
  parameterName: z.string().min(1, 'Parameter name is required'),
  unit: z.string().optional(),
  normalRange: z.string().optional(),
});

export const getTestParametersSchema = z.object({
  testId: z.number().positive('Test ID must be a positive number'),
});

// Patient Schemas
export const createPatientSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  age: z.number().min(0, 'Age must be a positive number').optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  addressLine1: z.string().min(1, 'Address is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits').max(6),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  referredBy: z.number().positive('Doctor ID must be a positive number').optional(),
  insurancePolicyNumber: z.string().optional(),
  patientConsent: z.boolean().refine(val => val === true, {
    message: 'Patient consent is required',
  }),
  testIds: z.array(z.number().positive()).min(1, 'At least one test must be selected'),
});

export const patientIdSchema = z.object({
  id: z.number().positive('Patient ID must be a positive number'),
});

export const patientIdNumberSchema = z.object({
  patientId: z.number().positive('Patient ID must be a positive number'),
});

// Patient Test Schemas
export const getPatientTestsSchema = z.object({
  patientId: z.number().positive('Patient ID must be a positive number'),
});

export const createPatientTestSchema = z.object({
  patientId: z.number().positive('Patient ID must be a positive number'),
  testId: z.number().positive('Test ID must be a positive number'),
  status: z.enum(['pending', 'completed', 'billed']).default('pending'),
  reportImpression: z.string().optional(), // NEW: Report impression field
});

export const updatePatientTestStatusSchema = z.object({
  id: z.number().positive('Patient test ID must be a positive number'),
  status: z.enum(['pending', 'completed', 'billed']),
  reportImpression: z.string().optional(), // NEW: Report impression field
});

// Test Result Schemas
export const testResultSchema = z.object({
  patientTestId: z.number().positive('Patient test ID must be a positive number'),
  parameterId: z.number().positive('Parameter ID must be a positive number'),
  value: z.string().min(1, 'Result value is required'),
  remarks: z.string().optional(),
});

// NEW: Test Impression Schema
export const testImpressionSchema = z.object({
  patientTestId: z.number().positive('Patient test ID must be a positive number'),
  impression: z.string().min(1, 'Impression cannot be empty'),
});

export const submitTestResultsSchema = z.object({
  results: z.array(testResultSchema).min(1, 'At least one test result is required'),
  patientTestIds: z.array(z.number().positive()).min(1, 'At least one patient test ID is required'),
  impressions: z.array(testImpressionSchema).optional(), // NEW: Optional impressions array
});

// Bill Schemas
export const createBillSchema = z.object({
  patientId: z.number().positive('Patient ID must be a positive number'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  isPaid: z.boolean().optional().default(false),
});

export const updateBillPaymentSchema = z.object({
  id: z.number().positive('Bill ID must be a positive number'),
  isPaid: z.boolean(),
});

export const billIdSchema = z.object({
  id: z.number().positive('Bill ID must be a positive number'),
});

// NEW: Search Bill Schema
export const searchBillsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
});

// Report Schema
export const getReportSchema = z.object({
  patientId: z.number().positive('Patient ID must be a positive number'),
});

// Search/Query Schemas
export const searchPatientsSchema = z.object({
  query: z.string().optional(),
  limit: z.number().positive().default(10),
  offset: z.number().min(0).default(0),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// NEW: File/Export Schemas
export const deleteFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
});

export const downloadFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
});

export const cleanupExportsSchema = z.object({
  daysOld: z.number().positive().default(7),
});

// Type exports
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type CreateTestInput = z.infer<typeof createTestSchema>;
export type CreateTestParameterInput = z.infer<typeof createTestParameterSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type TestResultInput = z.infer<typeof testResultSchema>;
export type TestImpressionInput = z.infer<typeof testImpressionSchema>; // NEW
export type SubmitTestResultsInput = z.infer<typeof submitTestResultsSchema>;
export type CreateBillInput = z.infer<typeof createBillSchema>;
export type GetReportInput = z.infer<typeof getReportSchema>;
export type SearchBillsInput = z.infer<typeof searchBillsSchema>; // NEW