import { createServerFn } from '@tanstack/react-start';
import { and, eq, gte, like, lt, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/index';
import { bills, patients, patientTests, tests } from '@/db/schema';
import { billIdSchema, createBillSchema, updateBillPaymentSchema } from '@/lib/validation_schemas';

export const createBill = createServerFn({ method: 'POST' })
  .inputValidator(createBillSchema)
  .handler(async ({ data }) => {
    try {
      const { patientId, discount, isPaid } = data;

      // Check if bill already exists
      const existingBill = await db
        .select()
        .from(bills)
        .where(eq(bills.patientId, patientId))
        .limit(1);

      if (existingBill.length > 0) {
        throw new Error('Bill already exists for this patient');
      }

      // Get patient tests with test prices
      const patientTestsData = await db
        .select({
          testPrice: tests.price,
        })
        .from(patientTests)
        .innerJoin(tests, eq(patientTests.testId, tests.id))
        .where(eq(patientTests.patientId, patientId));

      // Calculate total
      const totalAmount = patientTestsData.reduce(
        (sum, test) => sum + Number(test.testPrice),
        0
      );
      const finalAmount = totalAmount - Number(discount);

      // Generate invoice number
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      
      // Get count of bills today to generate unique invoice
      const todayStart = new Date(year, today.getMonth(), today.getDate());
      const todayEnd = new Date(year, today.getMonth(), today.getDate() + 1);
      
      // FIX: Use date range instead of exact equality
      const todayBills = await db
        .select()
        .from(bills)
        .where(
          and(
            gte(bills.createdAt, todayStart),
            lt(bills.createdAt, todayEnd)
          )
        );

      const invoiceSeq = String(todayBills.length + 1).padStart(4, '0');
      const invoiceNumber = `INV-${year}${month}${day}-${invoiceSeq}`;

      // Create bill
      const newBill = await db
        .insert(bills)
        .values({
          invoiceNumber,
          patientId,
          totalAmount: totalAmount.toString(),
          discount: discount.toString(),
          finalAmount: finalAmount.toString(),
          isPaid: isPaid || false,
        })
        .returning();

      // Update patient tests status to billed
      await db
        .update(patientTests)
        .set({ status: 'billed' })
        .where(eq(patientTests.patientId, patientId));

      return { 
        success: true, 
        bill: newBill[0] 
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create bill');
    }
  });

export const updateBillPayment = createServerFn({ method: 'POST' })
  .inputValidator(updateBillPaymentSchema)
  .handler(async ({ data }) => {
    try {
      const { id, isPaid } = data;

      const updatedBill = await db
        .update(bills)
        .set({ isPaid })
        .where(eq(bills.id, id))
        .returning();

      return { 
        success: true, 
        bill: updatedBill[0] 
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update bill payment status');
    }
  });

export const getBill = createServerFn({ method: 'POST' })
  .inputValidator(billIdSchema)
  .handler(async ({ data }) => {
    try {
      const { id } = data;

      const billData = await db
        .select({
          bill: bills,
          patient: patients,
        })
        .from(bills)
        .innerJoin(patients, eq(bills.patientId, patients.id))
        .where(eq(bills.id, id))
        .limit(1);

      if (billData.length === 0) {
        throw new Error('Bill not found');
      }

      return { 
        success: true, 
        bill: billData[0].bill,
        patient: billData[0].patient
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch bill');
    }
  });

// Search bills by invoice number, patient ID, or patient name
export const searchBills = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ query: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
      const { query } = data;

      const results = await db
        .select({
          bill: bills,
          patient: patients,
        })
        .from(bills)
        .innerJoin(patients, eq(bills.patientId, patients.id))
        .where(
          or(
            like(bills.invoiceNumber, `%${query}%`),
            like(patients.patientId, `%${query}%`),
            like(patients.fullName, `%${query}%`)
          )
        )
        .limit(20);

      return {
        success: true,
        results: results.map(r => ({
          ...r.bill,
          patientName: r.patient.fullName,
          patientId: r.patient.patientId,
          // FIX: Add the numeric database ID
          patientDbId: r.patient.id,
        }))
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search bills');
    }
  });