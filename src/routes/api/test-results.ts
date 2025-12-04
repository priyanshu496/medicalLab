import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { db } from '@/db/index';
import { patientTests, testResults } from '@/db/schema';
import { submitTestResultsSchema } from '@/lib/validation_schemas';

export const submitTestResults = createServerFn({ method: 'POST' })
  .inputValidator(submitTestResultsSchema)
  .handler(async ({ data }) => {
    try {
      const { results, patientTestIds, impressions } = data;

      // Insert test results
      if (results && results.length > 0) {
        await db.insert(testResults).values(results);
      }

      // Update patient test status to completed
      if (patientTestIds && patientTestIds.length > 0) {
        for (const id of patientTestIds) {
          await db
            .update(patientTests)
            .set({ status: 'completed' })
            .where(eq(patientTests.id, id));
        }
      }

      // Update impressions if provided
      if (impressions && impressions.length > 0) {
        for (const imp of impressions) {
          await db
            .update(patientTests)
            .set({ reportImpression: imp.impression })
            .where(eq(patientTests.id, imp.patientTestId));
        }
      }

      console.log('Test results submitted successfully');

      return { 
        success: true,
        message: 'Test results submitted successfully'
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to submit test results');
    }
  });