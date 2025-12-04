import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/index';
import { patients, patientTests } from '@/db/schema';

const createPatientSchema = z.object({
  patientId: z.string().optional(),
  fullName: z.string(),
  age: z.number(),
  gender: z.string(),
  phoneNumber: z.string(),
  addressLine1: z.string(),
  state: z.string(),
  pincode: z.string(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
  referredBy: z.number().optional(),
  insurancePolicyNumber: z.string().optional(),
  patientConsent: z.boolean(),
  testIds: z.array(z.number()).optional(),
});

export const createPatient = createServerFn({ method: 'POST' })
  .inputValidator(createPatientSchema)
  .handler(async ({ data }) => {
    try {
      const { testIds, ...patientData } = data;

      // Insert patient
      const result = await db
        .insert(patients)
        .values({
          ...patientData,
          patientId: '',
          medicalHistory: patientData.medicalHistory || null,
          allergies: patientData.allergies || null,
          insurancePolicyNumber: patientData.insurancePolicyNumber || null,
        })
        .returning();
      
      const generatedSerialId = result[0].id;
      const patientId = `PATNO-${generatedSerialId.toString().padStart(6, '0')}`;

      const updated = await db
        .update(patients)
        .set({ patientId })
        .where(eq(patients.id, generatedSerialId))
        .returning();

      // Insert patient tests if provided
      if (testIds && testIds.length > 0) {
        const patientTestsData = testIds.map((testId: number) => ({
          patientId: updated[0].id,
          testId,
          status: 'pending',
        }));
        await db.insert(patientTests).values(patientTestsData);
      }

      console.log('Database insert successful:', updated[0]);

      return { 
        success: true, 
        patient: updated[0],
        testIds: testIds || [] 
      };
    } catch (error) {
      console.error('Database error:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to create patient');
    }
  });