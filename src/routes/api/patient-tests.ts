import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/index';
import { patientTests, testParameters, tests } from '@/db/schema';

const getPatientTestsSchema = z.object({
  patientId: z.number(),
});

export const getPatientTests = createServerFn({ method: 'POST' })
  .inputValidator(getPatientTestsSchema)
  .handler(async ({ data }) => {
    try {
      const { patientId } = data;

      const result = await db
        .select({
          patientTestId: patientTests.id,
          testId: tests.id,
          testName: tests.name,
          status: patientTests.status,
        })
        .from(patientTests)
        .innerJoin(tests, eq(patientTests.testId, tests.id))
        .where(eq(patientTests.patientId, patientId));

      // Get parameters for each test
      const testsWithParams = await Promise.all(
        result.map(async (test) => {
          const params = await db
            .select()
            .from(testParameters)
            .where(eq(testParameters.testId, test.testId));
          return { ...test, parameters: params };
        })
      );

      return { 
        success: true, 
        tests: testsWithParams 
      };
    } catch (error) {
      console.error('Database error:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch patient tests');
    }
  });