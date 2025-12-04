import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { labInfo } from '@/db/schema';

const createLabInfoSchema = z.object({
  labName: z.string(),
  labLogo: z.string().optional(),
  gstinNumber: z.string().optional(),
  registrationNumber: z.string(),
  policeStationName: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
});

const getLabInfoSchema = z.object({
  id: z.number(),
});

const updateLabInfoSchema = z.object({
  id: z.number(),
  labName: z.string().optional(),
  labLogo: z.string().optional(),
  gstinNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  policeStationName: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
});

// Create lab info (setup)
export const createLabInfo = createServerFn({ method: 'POST' })
  .inputValidator(createLabInfoSchema)
  .handler(async ({ data }) => {
    try {
      const result = await db.insert(labInfo).values({
        labName: data.labName,
        labLogo: data.labLogo,
        gstinNumber: data.gstinNumber,
        registrationNumber: data.registrationNumber,
        policeStationName: data.policeStationName,
        address: data.address,
        phoneNumber: data.phoneNumber,
      }).returning();

      return { success: true, labInfo: result[0] };
    } catch (error) {
      console.error('Error creating lab info:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create lab info');
    }
  });

// Get lab info by ID
export const getLabInfo = createServerFn({ method: 'GET' })
  .inputValidator(getLabInfoSchema)
  .handler(async ({ data }) => {
    try {
      const result = await db.query.labInfo.findFirst({
        where: eq(labInfo.id, data.id),
      });

      if (!result) {
        return { success: false, message: 'Lab info not found' };
      }

      return { success: true, labInfo: result };
    } catch (error) {
      console.error('Error fetching lab info:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch lab info');
    }
  });

// Get first lab info (main lab)
export const getMainLabInfo = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const result = await db.query.labInfo.findFirst();

    if (!result) {
      return { success: false, message: 'Lab info not found' };
    }

    return { success: true, labInfo: result };
  } catch (error) {
    console.error('Error fetching lab info:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch lab info');
  }
});

// Update lab info
export const updateLabInfo = createServerFn({ method: 'POST' })
  .inputValidator(updateLabInfoSchema)
  .handler(async ({ data }) => {
    try {
      const updateData: any = {};
      if (data.labName) updateData.labName = data.labName;
      if (data.labLogo) updateData.labLogo = data.labLogo;
      if (data.gstinNumber) updateData.gstinNumber = data.gstinNumber;
      if (data.registrationNumber) updateData.registrationNumber = data.registrationNumber;
      if (data.policeStationName) updateData.policeStationName = data.policeStationName;
      if (data.address) updateData.address = data.address;
      if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
      updateData.updatedAt = new Date();

      const result = await db.update(labInfo)
        .set(updateData)
        .where(eq(labInfo.id, data.id))
        .returning();

      return { success: true, labInfo: result[0] };
    } catch (error) {
      console.error('Error updating lab info:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update lab info');
    }
  });
