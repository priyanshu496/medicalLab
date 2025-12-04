import * as fs from 'node:fs';
import * as path from 'node:path';
import { createServerFn } from '@tanstack/react-start';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { db } from '@/db/index';
import { bills, doctors, patients, patientTests, testParameters, testResults, tests } from '@/db/schema';

const downloadFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
});

const deleteFileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
});

const cleanupExportsSchema = z.object({
  daysOld: z.number().positive().optional().default(7),
});

export const exportPatientsToExcel = createServerFn({ method: 'POST' })
  .handler(async () => {
    try {
      const allPatients = await db
        .select({
          patientId: patients.patientId,
          fullName: patients.fullName,
          age: patients.age,
          gender: patients.gender,
          phoneNumber: patients.phoneNumber,
          address: patients.addressLine1,
          state: patients.state,
          pincode: patients.pincode,
          medicalHistory: patients.medicalHistory,
          allergies: patients.allergies,
          insurancePolicyNumber: patients.insurancePolicyNumber,
          createdAt: patients.createdAt,
        })
        .from(patients);

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(allPatients);
      
      worksheet['!cols'] = [
        { wch: 15 }, { wch: 25 }, { wch: 8 }, { wch: 10 },
        { wch: 15 }, { wch: 30 }, { wch: 15 }, { wch: 10 },
        { wch: 30 }, { wch: 30 }, { wch: 20 }, { wch: 20 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');

      const exportsDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `patients_${timestamp}.xlsx`;
      const filepath = path.join(exportsDir, filename);

      XLSX.writeFile(workbook, filepath);

      return {
        success: true,
        message: `Exported ${allPatients.length} patients successfully`,
        filepath: filepath,
        filename: filename
      };
    } catch (error) {
      console.error('Error exporting patients:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to export patients');
    }
  });

export const exportTestsToExcel = createServerFn({ method: 'POST' })
  .handler(async () => {
    try {
      const allTests = await db
        .select({
          testName: tests.name,
          description: tests.description,
          price: tests.price,
          createdAt: tests.createdAt,
        })
        .from(tests);

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(allTests);
      
      worksheet['!cols'] = [
        { wch: 30 }, { wch: 50 }, { wch: 12 }, { wch: 20 }
      ];
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tests');

      const exportsDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `tests_${timestamp}.xlsx`;
      const filepath = path.join(exportsDir, filename);

      XLSX.writeFile(workbook, filepath);

      return {
        success: true,
        message: `Exported ${allTests.length} tests successfully`,
        filepath: filepath,
        filename: filename
      };
    } catch (error) {
      console.error('Error exporting tests:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to export tests');
    }
  });

export const exportLabReportToExcel = createServerFn({ method: 'POST' })
  .handler(async () => {
    try {
      const patientsData = await db.select().from(patients);
      const testsData = await db.select().from(tests);
      const billsData = await db.select().from(bills);
      const doctorsData = await db.select().from(doctors);
      const parametersData = await db.select().from(testParameters);
      const patientTestsData = await db.select().from(patientTests);
      const resultsData = await db.select().from(testResults);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(patientsData),
        'Patients'
      );
      
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(testsData),
        'Tests'
      );
      
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(parametersData),
        'Test Parameters'
      );
      
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(billsData),
        'Bills'
      );
      
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(doctorsData),
        'Doctors'
      );

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(patientTestsData),
        'Patient Tests'
      );

      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(resultsData),
        'Test Results'
      );

      const exportsDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `complete_lab_report_${timestamp}.xlsx`;
      const filepath = path.join(exportsDir, filename);

      XLSX.writeFile(workbook, filepath);

      return {
        success: true,
        message: 'Complete lab report exported successfully',
        filepath: filepath,
        filename: filename,
        stats: {
          patients: patientsData.length,
          tests: testsData.length,
          bills: billsData.length,
          doctors: doctorsData.length
        }
      };
    } catch (error) {
      console.error('Error exporting lab report:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to export lab report');
    }
  });

export const downloadExportedFile = createServerFn({ method: 'POST' })
  .inputValidator(downloadFileSchema)
  .handler(async ({ data }) => {
    try {
      const filepath = path.join(process.cwd(), 'exports', data.filename);
      
      if (!fs.existsSync(filepath)) {
        throw new Error('File not found');
      }

      const fileBuffer = fs.readFileSync(filepath);
      const base64 = fileBuffer.toString('base64');

      return {
        success: true,
        data: base64,
        filename: data.filename,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to download file');
    }
  });

export const listExportedFiles = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const exportsDir = path.join(process.cwd(), 'exports');
      
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
        return { success: true, files: [] };
      }

      const files = fs.readdirSync(exportsDir)
        .filter(filename => filename.endsWith('.xlsx'))
        .map(filename => {
          const filepath = path.join(exportsDir, filename);
          const stats = fs.statSync(filepath);
          
          return {
            filename,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          };
        });

      return {
        success: true,
        files: files.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        )
      };
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to list files');
    }
  });

export const cleanupOldExports = createServerFn({ method: 'POST' })
  .inputValidator(cleanupExportsSchema)
  .handler(async ({ data }) => {
    try {
      const exportsDir = path.join(process.cwd(), 'exports');
      const daysToKeep = data.daysOld || 7;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      if (!fs.existsSync(exportsDir)) {
        return { success: true, deletedCount: 0 };
      }

      const files = fs.readdirSync(exportsDir);
      let deletedCount = 0;

      for (const filename of files) {
        const filepath = path.join(exportsDir, filename);
        const stats = fs.statSync(filepath);
        
        if (stats.birthtime < cutoffDate) {
          fs.unlinkSync(filepath);
          deletedCount++;
        }
      }

      return {
        success: true,
        deletedCount,
        message: `Deleted ${deletedCount} old file(s)`
      };
    } catch (error) {
      console.error('Error cleaning up exports:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to cleanup exports');
    }
  });

export const deleteExportedFile = createServerFn({ method: 'POST' })
  .inputValidator(deleteFileSchema)
  .handler(async ({ data }) => {
    try {
      const filepath = path.join(process.cwd(), 'exports', data.filename);
      
      if (!fs.existsSync(filepath)) {
        throw new Error('File not found');
      }

      fs.unlinkSync(filepath);

      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete file');
    }
  });