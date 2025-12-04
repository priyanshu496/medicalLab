import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { db } from '@/db/index';
import { patients, patientTests } from '@/db/schema';
import { createPatientSchema } from '@/lib/validation_schemas';

// Generate unique patient ID
function generatePatientId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `PAT-${timestamp}-${random}`;
}

export const createPatient = createServerFn({ method: 'POST' })
  .inputValidator(createPatientSchema)
  .handler(async ({ data }) => {
    try {
      const { testIds, ...patientData } = data;

      // Generate patientId before insertion
      const patientId = generatePatientId();

      // Insert patient with patientId
      const result = await db
        .insert(patients)
        .values({
          patientId,
          fullName: patientData.fullName,
          age: patientData.age || 0,
          gender: patientData.gender || 'other',
          phoneNumber: patientData.phoneNumber || '',
          whatsappNumber: patientData.whatsappNumber || '',
          state: patientData.state || '',
          pincode: patientData.pincode || '',
          addressLine1: patientData.addressLine1 || '',
          medicalHistory: patientData.medicalHistory || null,
          allergies: patientData.allergies || null,
          patientConsent: patientData.patientConsent || false,
          referredBy: patientData.referredBy || null,
          insurancePolicyNumber: patientData.insurancePolicyNumber || null,
        })
        .returning();

      // Insert patient tests if provided
      if (testIds && testIds.length > 0) {
        const patientTestsData = testIds.map((testId: number) => ({
          patientId: result[0].id,
          testId,
          status: 'pending',
        }));
        await db.insert(patientTests).values(patientTestsData);
      }

      console.log('Patient created successfully:', result[0]);

      return { 
        success: true, 
        patient: result[0] as Record<string, any>,
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
