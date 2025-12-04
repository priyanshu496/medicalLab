import { Pool } from 'pg';
import crypto from 'crypto';

const connectionString = 'postgresql://postgres:123456789@localhost:5432/lab_database2';

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

async function setupDatabase() {
  const pool = new Pool({ connectionString });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();

    console.log('Setting up user roles...');
    await client.query(`
      INSERT INTO user_roles (roleName, description) VALUES 
      ('master', 'Administrator with full system access'),
      ('cashier', 'Handles payments and billing operations'),
      ('lab_technician', 'Manages test entry and test results')
      ON CONFLICT (roleName) DO NOTHING
    `);

    console.log('Setting up lab info...');
    await client.query(`
      INSERT INTO lab_info (labName, gstinNumber, registrationNumber, policeStationName, address, phoneNumber) VALUES 
      ('NextGenLab Medical Diagnostics', '27AABCT1234H1Z0', 'REG-2024-001', 'Cyber Crime Police Station', '123 Medical Complex, Healthcare City', '9876543210')
      ON CONFLICT DO NOTHING
    `);

    console.log('Setting up default users...');

    const masterPassword = hashPassword('master123');
    const cashierPassword = hashPassword('cashier123');
    const technicianPassword = hashPassword('tech123');

    console.log('Creating master user...');
    await client.query(
      `
      INSERT INTO users (userId, password, fullName, email, phoneNumber, roleId, labInfoId, permissions, isActive) 
      SELECT 
        $1, $2, $3, $4, $5, ur.id, li.id, $6, true
      FROM user_roles ur, lab_info li
      WHERE ur.roleName = 'master' AND li.labName = 'NextGenLab Medical Diagnostics'
      ON CONFLICT (userId) DO NOTHING
      `,
      ['master', masterPassword, 'Master Administrator', 'master@nextgenlab.com', '9876543210', JSON.stringify(['all'])]
    );

    console.log('Creating cashier user...');
    await client.query(
      `
      INSERT INTO users (userId, password, fullName, email, phoneNumber, roleId, labInfoId, permissions, isActive) 
      SELECT 
        $1, $2, $3, $4, $5, ur.id, li.id, $6, true
      FROM user_roles ur, lab_info li
      WHERE ur.roleName = 'cashier' AND li.labName = 'NextGenLab Medical Diagnostics'
      ON CONFLICT (userId) DO NOTHING
      `,
      ['cashier', cashierPassword, 'John Cashier', 'cashier@nextgenlab.com', '9876543211', JSON.stringify(['billing', 'payments'])]
    );

    console.log('Creating technician user...');
    await client.query(
      `
      INSERT INTO users (userId, password, fullName, email, phoneNumber, roleId, labInfoId, permissions, isActive) 
      SELECT 
        $1, $2, $3, $4, $5, ur.id, li.id, $6, true
      FROM user_roles ur, lab_info li
      WHERE ur.roleName = 'lab_technician' AND li.labName = 'NextGenLab Medical Diagnostics'
      ON CONFLICT (userId) DO NOTHING
      `,
      ['technician', technicianPassword, 'Sarah Technician', 'technician@nextgenlab.com', '9876543212', JSON.stringify(['test_entry', 'test_results'])]
    );

    client.release();
    console.log('✅ Database setup completed successfully!');
    console.log('\nDefault users created:');
    console.log('- master / master123');
    console.log('- cashier / cashier123');
    console.log('- technician / tech123');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

setupDatabase();
