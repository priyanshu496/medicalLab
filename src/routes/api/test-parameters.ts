import { createServerFn } from '@tanstack/react-start';
import { db } from '@/db/index';
import { testParameters } from '@/db/schema';
import { createTestParameterSchema } from '@/lib/validation_schemas';



export const createTestParameter = createServerFn({ method: 'POST' })
  .inputValidator(createTestParameterSchema)
  .handler(async ({ data }) => {
    try {
      const newParameter = await db
        .insert(testParameters)
        .values(data)
        .returning();

      console.log('New test parameter created:', newParameter[0]);
      
      return { 
        success: true, 
        parameter: newParameter[0] 
      };
    } catch (error) {
      console.error('Database error:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to create test parameter');
    }
  });