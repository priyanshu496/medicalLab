import { createServerFn } from '@tanstack/react-start';
import { db } from '@/db/index';
import { tests } from '@/db/schema';
import { createTestSchema } from '@/lib/validation_schemas';

// Get all tests
export const getAllTests = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const allTests = await db.select().from(tests);
      
      return { 
        success: true, 
        tests: allTests 
      };
    } catch (error) {
      console.error('Database error:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch tests');
    }
  });



// Create new test
export const createTest = createServerFn({ method: 'POST' })
  .inputValidator(createTestSchema)
  .handler(async ({ data }) => {
    try {
      const newTest = await db
        .insert(tests)
        .values(data)
        .returning();

      console.log('New test created:', newTest[0]);
      
      return { 
        success: true, 
        test: newTest[0] 
      };
    } catch (error) {
      console.error('Database error:', error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw new Error(error instanceof Error ? error.message : 'Failed to create test');
    }
  });