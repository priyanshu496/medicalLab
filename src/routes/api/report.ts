import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { db } from '@/db/index';
import { bills, doctors, patients, patientTests, testParameters, testResults, tests } from '@/db/schema';
import { getReportSchema } from '@/lib/validation_schemas';

export const getPatientReport = createServerFn({ method: 'POST' })
  .inputValidator(getReportSchema)
  .handler(async ({ data }) => {
    try {
      const { patientId } = data;

      // Get patient info with doctor
      const patientData = await db
        .select({
          patient: patients,
          doctor: doctors,
        })
        .from(patients)
        .leftJoin(doctors, eq(patients.referredBy, doctors.id))
        .where(eq(patients.id, patientId));

      // Get patient tests with impressions
      const patientTestsData = await db
        .select({
          patientTestId: patientTests.id,
          testId: patientTests.testId,
          testName: tests.name,
          testPrice: tests.price,
          reportImpression: patientTests.reportImpression,
        })
        .from(patientTests)
        .innerJoin(tests, eq(patientTests.testId, tests.id))
        .where(eq(patientTests.patientId, patientId));

      // For each patient test, get its parameters and results separately
      const testsWithResults = await Promise.all(
        patientTestsData.map(async (patientTest) => {
          // Get all parameters for this test
          const params = await db
            .select({
              parameterId: testParameters.id,
              parameterName: testParameters.parameterName,
              unit: testParameters.unit,
              normalRange: testParameters.normalRange,
            })
            .from(testParameters)
            .where(eq(testParameters.testId, patientTest.testId));

          // Get results for this patient test
          const results = await db
            .select({
              parameterId: testResults.parameterId,
              resultValue: testResults.value,
              resultRemarks: testResults.remarks,
            })
            .from(testResults)
            .where(eq(testResults.patientTestId, patientTest.patientTestId));

          // Combine parameters with their results
          const parametersWithResults = params.map(param => {
            const result = results.find(r => r.parameterId === param.parameterId);
            return {
              patientTestId: patientTest.patientTestId,
              testName: patientTest.testName,
              testPrice: patientTest.testPrice,
              reportImpression: patientTest.reportImpression,
              parameterId: param.parameterId,
              parameterName: param.parameterName,
              unit: param.unit,
              normalRange: param.normalRange,
              resultValue: result?.resultValue || null,
              resultRemarks: result?.resultRemarks || null,
            };
          });

          return parametersWithResults;
        })
      );

      // Flatten the array
      const testsData = testsWithResults.flat();

      // Get bill
      const billData = await db
        .select()
        .from(bills)
        .where(eq(bills.patientId, patientId))
        .limit(1);

      return {
        success: true,
        patient: patientData[0] || null,
        tests: testsData,
        bill: billData[0] || null,
      };
    } catch (error) {
      console.error('Database error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch patient report');
    }
  });