import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { db } from '@/db/index';
import { doctors } from '@/db/schema';
import { createDoctorSchema } from '@/lib/validation_schemas';

// Get all doctors
export const getAllDoctors = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const allDoctors = await db.select().from(doctors);
      return { 
        success: true, 
        doctors: allDoctors 
      };
    } catch (error) {
      console.error('Database error:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch doctors');
    }
  });


// Create new doctor
export const createDoctor = createServerFn({ method: 'POST' })
  .inputValidator(createDoctorSchema)
  .handler(async ({ data }) => {
    try {
      const newDoctorResult = await db
        .insert(doctors)
        .values({
          doctorId: '',
          name: data.name,
          contactNumber: data.contactNumber,
        })
        .returning();
      
      const doctorSerialId = newDoctorResult[0].id;
      const doctorId = `DOCNO-${doctorSerialId.toString().padStart(7, '0')}`;
      
      const updatedDoctor = await db
        .update(doctors)
        .set({ doctorId })
        .where(eq(doctors.id, doctorSerialId))
        .returning();

      console.log('New doctor created:', updatedDoctor[0]);
      
      return { 
        success: true, 
        doctor: updatedDoctor[0] 
      };
    } catch (error) {
      console.error('Database error:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to create doctor');
    }
  });