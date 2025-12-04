import { createServerFn } from '@tanstack/react-start';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db/index';
import { bills, patients, patientTests } from '@/db/schema';

export const getAllPatientsWithBills = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const patientsData = await db
        .select({
          id: patients.id,
          patientId: patients.patientId,
          fullName: patients.fullName,
          age: patients.age,
          gender: patients.gender,
          phoneNumber: patients.phoneNumber,
          addressLine1: patients.addressLine1,
          state: patients.state,
          pincode: patients.pincode,
          createdAt: patients.createdAt,
          billId: bills.id,
          billTotalAmount: bills.totalAmount,
          billDiscount: bills.discount,
          billFinalAmount: bills.finalAmount,
          billIsPaid: bills.isPaid,
          billCreatedAt: bills.createdAt,
        })
        .from(patients)
        .leftJoin(bills, eq(patients.id, bills.patientId));

      // Get test counts for each patient
      const patientsWithTestCounts = await Promise.all(
        patientsData.map(async (patient) => {
          const testCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(patientTests)
            .where(eq(patientTests.patientId, patient.id));

          return {
            id: patient.id,
            patientId: patient.patientId,
            fullName: patient.fullName,
            age: patient.age,
            gender: patient.gender,
            phoneNumber: patient.phoneNumber,
            addressLine1: patient.addressLine1,
            state: patient.state,
            pincode: patient.pincode,
            createdAt: patient.createdAt,
            testCount: Number(testCount[0]?.count || 0),
            bill: patient.billId ? {
              id: patient.billId,
              totalAmount: patient.billTotalAmount,
              discount: patient.billDiscount,
              finalAmount: patient.billFinalAmount,
              isPaid: patient.billIsPaid,
              createdAt: patient.billCreatedAt,
            } : null,
          };
        })
      );

      return { 
        success: true, 
        patients: patientsWithTestCounts 
      };
    } catch (error) {
      console.error('Database error:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch patients');
    }
  });