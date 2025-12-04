import { relations } from 'drizzle-orm';
import { boolean, decimal, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Lab Information table
export const labInfo = pgTable('lab_info', {
  id: serial('id').primaryKey(),
  labName: text('lab_name').notNull(),
  labLogo: text('lab_logo'), // URL or base64 of logo
  gstinNumber: text('gstin_number'),
  registrationNumber: text('registration_number').notNull(),
  policeStationName: text('police_station_name'),
  address: text('address'),
  phoneNumber: text('phone_number'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Roles - master, cashier, lab_technician
export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  roleName: text('role_name').notNull().unique(), // 'master', 'cashier', 'lab_technician'
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().unique(), // username or login ID
  password: text('password').notNull(), // hashed password
  fullName: text('full_name').notNull(),
  email: text('email'),
  phoneNumber: text('phone_number'),
  roleId: integer('role_id').references(() => userRoles.id).notNull(),
  labInfoId: integer('lab_info_id').references(() => labInfo.id).notNull(),
  permissions: text('permissions').default('[]'), // JSON array of permissions
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Doctors table
export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  doctorId: text('doctor_id').notNull().unique(),
  name: text('name').notNull(),
  specialization: text('specialization'),
  contactNumber: text('contact_number'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tests table
export const tests = pgTable('tests', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Test parameters table
export const testParameters = pgTable('test_parameters', {
  id: serial('id').primaryKey(),
  testId: integer('test_id').references(() => tests.id).notNull(),
  parameterName: text('parameter_name').notNull(),
  unit: text('unit'),
  normalRange: text('normal_range'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Patients table
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  patientId: text('patient_id').notNull().unique(),
  fullName: text('full_name').notNull(),
  age: integer('age'),
  gender: text('gender'),
  phoneNumber: text('phone_number').notNull(),
  addressLine1: text('address_line_1').notNull(),
  state: text('state').notNull(),
  pincode: text('pincode').notNull(),
  medicalHistory: text('medical_history'),
  allergies: text('allergies'),
  insurancePolicyNumber: text('insurance_policy_number'),
  referredBy: integer('referred_by').references(() => doctors.id),
  patientConsent: boolean('patient_consent').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Patient tests table (junction table)
export const patientTests = pgTable('patient_tests', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  testId: integer('test_id').references(() => tests.id).notNull(),
  status: text('status').default('pending'), // pending, in_progress, completed, billed
  testEntryDate: timestamp('test_entry_date'), // When test was entered
  testResultDate: timestamp('test_result_date'), // When results were added
  reportImpression: text('report_impression'), // Medical impressions/remarks for the test
  createdAt: timestamp('created_at').defaultNow(),
});

// Test results table
export const testResults = pgTable('test_results', {
  id: serial('id').primaryKey(),
  patientTestId: integer('patient_test_id').references(() => patientTests.id).notNull(),
  parameterId: integer('parameter_id').references(() => testParameters.id).notNull(),
  value: text('value').notNull(),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Bills table
export const bills = pgTable('bills', {
  id: serial('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(), // NEW: Invoice number
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  finalAmount: decimal('final_amount', { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean('is_paid').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const labInfoRelations = relations(labInfo, ({ many }) => ({
  users: many(users),
}));

export const userRolesRelations = relations(userRoles, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(userRoles, {
    fields: [users.roleId],
    references: [userRoles.id],
  }),
  labInfo: one(labInfo, {
    fields: [users.labInfoId],
    references: [labInfo.id],
  }),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
  patients: many(patients),
}));

export const testsRelations = relations(tests, ({ many }) => ({
  parameters: many(testParameters),
  patientTests: many(patientTests),
}));

export const testParametersRelations = relations(testParameters, ({ one, many }) => ({
  test: one(tests, {
    fields: [testParameters.testId],
    references: [tests.id],
  }),
  results: many(testResults),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  referringDoctor: one(doctors, {
    fields: [patients.referredBy],
    references: [doctors.id],
  }),
  patientTests: many(patientTests),
  bills: many(bills),
}));

export const patientTestsRelations = relations(patientTests, ({ one, many }) => ({
  patient: one(patients, {
    fields: [patientTests.patientId],
    references: [patients.id],
  }),
  test: one(tests, {
    fields: [patientTests.testId],
    references: [tests.id],
  }),
  results: many(testResults),
}));

export const testResultsRelations = relations(testResults, ({ one }) => ({
  patientTest: one(patientTests, {
    fields: [testResults.patientTestId],
    references: [patientTests.id],
  }),
  parameter: one(testParameters, {
    fields: [testResults.parameterId],
    references: [testParameters.id],
  }),
}));

export const billsRelations = relations(bills, ({ one }) => ({
  patient: one(patients, {
    fields: [bills.patientId],
    references: [patients.id],
  }),
}));