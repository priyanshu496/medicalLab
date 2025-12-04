import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { db } from '@/db/index';
import { testParameters } from '@/db/schema';
import { getTestParametersSchema } from '@/lib/validation_schemas';

export const getTestParametersByTestId = createServerFn({ method: 'POST' })
  .inputValidator(getTestParametersSchema)
  .handler(async ({ data }) => {
    try {
      const { testId } = data;

      const parameters = await db
        .select()
        .from(testParameters)
        .where(eq(testParameters.testId, testId));

      console.log('Fetched test parameters for test ID:', testId);
      
      return { 
        success: true, 
        parameters 
      };
    } catch (error) {
      console.error('Database error:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch test parameters');
    }
  });