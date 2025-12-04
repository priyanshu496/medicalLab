import crypto from 'crypto';
import { db } from './index';
import { doctors, labInfo, testParameters, tests, userRoles, users } from './schema';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seed() {
  console.log('Seeding database...');

  // Seed user roles
  console.log('Seeding user roles...');
  const rolesData = await db
    .insert(userRoles)
    .values([
      {
        roleName: 'master',
        description: 'Administrator with full system access',
      },
      {
        roleName: 'cashier',
        description: 'Handles payments and billing operations',
      },
      {
        roleName: 'lab_technician',
        description: 'Manages test entry and test results',
      },
    ])
    .returning()
    .catch((err) => {
      console.log('Roles already exist or error:', err.message);
      return [];
    });

  console.log(`Seeded ${rolesData.length} user roles`);

  // Seed lab info
  console.log('Seeding lab info...');
  const labData = await db
    .insert(labInfo)
    .values([
      {
        labName: 'NextGenLab Medical Diagnostics',
        labLogo: null,
        gstinNumber: '27AABCT1234H1Z0',
        registrationNumber: 'REG-2024-001',
        policeStationName: 'Cyber Crime Police Station',
        address: '123 Medical Complex, Healthcare City',
        phoneNumber: '9876543210',
      },
    ])
    .returning()
    .catch((err) => {
      console.log('Lab info already exists or error:', err.message);
      return [];
    });

  console.log(`Seeded lab info`);

  // Get role IDs
  let masterRoleId = 1;
  let cashierRoleId = 2;
  let labTechRoleId = 3;
  let labInfoId = 1;

  // Try to get from database if seed failed
  if (rolesData.length > 0) {
    const masterRole = rolesData.find((r) => r.roleName === 'master');
    const cashierRole = rolesData.find((r) => r.roleName === 'cashier');
    const labTechRole = rolesData.find((r) => r.roleName === 'lab_technician');
    if (masterRole) masterRoleId = masterRole.id;
    if (cashierRole) cashierRoleId = cashierRole.id;
    if (labTechRole) labTechRoleId = labTechRole.id;
  }

  if (labData.length > 0) {
    labInfoId = labData[0].id;
  }

  // Seed default users
  console.log('Seeding default users...');
  await db
    .insert(users)
    .values([
      {
        userId: 'master',
        password: hashPassword('master123'),
        fullName: 'Master Administrator',
        email: 'master@nextgenlab.com',
        phoneNumber: '9876543210',
        roleId: masterRoleId,
        labInfoId: labInfoId,
        permissions: JSON.stringify(['all']),
        isActive: true,
      },
      {
        userId: 'cashier',
        password: hashPassword('cashier123'),
        fullName: 'John Cashier',
        email: 'cashier@nextgenlab.com',
        phoneNumber: '9876543211',
        roleId: cashierRoleId,
        labInfoId: labInfoId,
        permissions: JSON.stringify(['billing', 'payments']),
        isActive: true,
      },
      {
        userId: 'technician',
        password: hashPassword('tech123'),
        fullName: 'Sarah Technician',
        email: 'technician@nextgenlab.com',
        phoneNumber: '9876543212',
        roleId: labTechRoleId,
        labInfoId: labInfoId,
        permissions: JSON.stringify(['test_entry', 'test_results']),
        isActive: true,
      },
    ])
    .returning()
    .catch((err) => {
      console.log('Users already exist or error:', err.message);
    });

  console.log('Seeded default users (master, cashier, technician)');

  // Seed doctors
  const doctorRecords = await db
    .insert(doctors)
    .values([
      {
        name: 'Dr. Rajesh Kumar',
        doctorId: 'doc_rajesh_kumar',
        specialization: 'General Physician',
        contactNumber: '9876543210',
      },
      {
        name: 'Dr. Priya Sharma',
        doctorId: 'doc_priya_sharma',
        specialization: 'Cardiologist',
        contactNumber: '9876543211',
      },
      {
        name: 'Dr. Amit Patel',
        doctorId: 'doc_amit_patel',
        specialization: 'Pathologist',
        contactNumber: '9876543212',
      },
    ])
    .returning()
    .catch((err) => {
      console.log('Doctors already exist or error:', err.message);
      return [];
    });

  console.log(`Seeded ${doctorRecords.length} doctors`);

  // Seed tests
  const testRecords = await db
    .insert(tests)
    .values([
      {
        name: 'Complete Blood Count (CBC)',
        description: 'Comprehensive blood test',
        price: '500.00',
      },
      {
        name: 'Lipid Profile',
        description: 'Cholesterol and triglycerides test',
        price: '800.00',
      },
      {
        name: 'Blood Sugar (Fasting)',
        description: 'Fasting blood glucose test',
        price: '150.00',
      },
      {
        name: 'Liver Function Test (LFT)',
        description: 'Liver enzyme test',
        price: '700.00',
      },
      {
        name: 'Thyroid Profile',
        description: 'TSH, T3, T4 levels',
        price: '600.00',
      },
    ])
    .returning()
    .catch((err) => {
      console.log('Tests already exist or error:', err.message);
      return [];
    });

  console.log(`Seeded ${testRecords.length} tests`);

  // Seed test parameters for CBC
  const cbcTest = testRecords.find((t) => t.name.includes('CBC'));
  if (cbcTest) {
    await db
      .insert(testParameters)
      .values([
        {
          testId: cbcTest.id,
          parameterName: 'Hemoglobin',
          unit: 'g/dL',
          normalRange: 'M: 13.5-17.5, F: 12.0-15.5',
        },
        {
          testId: cbcTest.id,
          parameterName: 'RBC Count',
          unit: 'million/µL',
          normalRange: 'M: 4.5-5.5, F: 4.0-5.0',
        },
        {
          testId: cbcTest.id,
          parameterName: 'WBC Count',
          unit: 'cells/µL',
          normalRange: '4,000-11,000',
        },
        {
          testId: cbcTest.id,
          parameterName: 'Platelet Count',
          unit: 'cells/µL',
          normalRange: '150,000-450,000',
        },
      ])
      .catch((err) => {
        console.log('Test parameters already exist or error:', err.message);
      });
  }

  // Seed test parameters for Lipid Profile
  const lipidTest = testRecords.find((t) => t.name.includes('Lipid'));
  if (lipidTest) {
    await db
      .insert(testParameters)
      .values([
        {
          testId: lipidTest.id,
          parameterName: 'Total Cholesterol',
          unit: 'mg/dL',
          normalRange: '< 200',
        },
        {
          testId: lipidTest.id,
          parameterName: 'LDL Cholesterol',
          unit: 'mg/dL',
          normalRange: '< 100',
        },
        {
          testId: lipidTest.id,
          parameterName: 'HDL Cholesterol',
          unit: 'mg/dL',
          normalRange: '> 40',
        },
        {
          testId: lipidTest.id,
          parameterName: 'Triglycerides',
          unit: 'mg/dL',
          normalRange: '< 150',
        },
      ])
      .catch((err) => {
        console.log('Test parameters already exist or error:', err.message);
      });
  }

  // Seed test parameters for Blood Sugar
  const sugarTest = testRecords.find((t) => t.name.includes('Blood Sugar'));
  if (sugarTest) {
    await db
      .insert(testParameters)
      .values([
        {
          testId: sugarTest.id,
          parameterName: 'Fasting Blood Glucose',
          unit: 'mg/dL',
          normalRange: '70-100',
        },
      ])
      .catch((err) => {
        console.log('Test parameters already exist or error:', err.message);
      });
  }

  // Seed test parameters for LFT
  const lftTest = testRecords.find((t) => t.name.includes('Liver'));
  if (lftTest) {
    await db
      .insert(testParameters)
      .values([
        {
          testId: lftTest.id,
          parameterName: 'SGOT (AST)',
          unit: 'U/L',
          normalRange: '< 40',
        },
        {
          testId: lftTest.id,
          parameterName: 'SGPT (ALT)',
          unit: 'U/L',
          normalRange: '< 41',
        },
        {
          testId: lftTest.id,
          parameterName: 'Total Bilirubin',
          unit: 'mg/dL',
          normalRange: '0.3-1.2',
        },
        {
          testId: lftTest.id,
          parameterName: 'Alkaline Phosphatase',
          unit: 'U/L',
          normalRange: '44-147',
        },
      ])
      .catch((err) => {
        console.log('Test parameters already exist or error:', err.message);
      });
  }

  // Seed test parameters for Thyroid
  const thyroidTest = testRecords.find((t) => t.name.includes('Thyroid'));
  if (thyroidTest) {
    await db
      .insert(testParameters)
      .values([
        {
          testId: thyroidTest.id,
          parameterName: 'TSH',
          unit: 'mIU/L',
          normalRange: '0.4-4.0',
        },
        {
          testId: thyroidTest.id,
          parameterName: 'T3',
          unit: 'ng/dL',
          normalRange: '80-200',
        },
        {
          testId: thyroidTest.id,
          parameterName: 'T4',
          unit: 'µg/dL',
          normalRange: '4.5-12.0',
        },
      ])
      .catch((err) => {
        console.log('Test parameters already exist or error:', err.message);
      });
  }

  console.log('Database seeded successfully!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});