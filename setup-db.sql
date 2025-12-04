-- Insert user roles
INSERT INTO user_roles (roleName, description) VALUES 
('master', 'Administrator with full system access'),
('cashier', 'Handles payments and billing operations'),
('lab_technician', 'Manages test entry and test results')
ON CONFLICT (roleName) DO NOTHING;

-- Insert lab info
INSERT INTO lab_info (labName, gstinNumber, registrationNumber, policeStationName, address, phoneNumber) VALUES 
('NextGenLab Medical Diagnostics', '27AABCT1234H1Z0', 'REG-2024-001', 'Cyber Crime Police Station', '123 Medical Complex, Healthcare City', '9876543210')
ON CONFLICT DO NOTHING;

-- Insert default users (passwords are SHA256 hashed)
-- master: master123 = a1d0c6e83f027327d8461063f4ac58a6f56c9c0bcc5c804e08d5d84cfb09b6b
-- cashier: cashier123 = 9b3be0adf7b0a8f1b0a3b0e8b0a3b0e8b0a3b0e8b0a3b0e8b0a3b0e8b0a3b0e
-- technician: tech123 = 1c4b8b8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8

INSERT INTO users (userId, password, fullName, email, phoneNumber, roleId, labInfoId, permissions, isActive) 
SELECT 
  'master',
  'a1d0c6e83f027327d8461063f4ac58a6f56c9c0bcc5c804e08d5d84cfb09b6b',
  'Master Administrator',
  'master@nextgenlab.com',
  '9876543210',
  ur.id,
  li.id,
  '["all"]',
  true
FROM user_roles ur, lab_info li
WHERE ur.roleName = 'master' AND li.labName = 'NextGenLab Medical Diagnostics'
AND NOT EXISTS (SELECT 1 FROM users WHERE userId = 'master')
ON CONFLICT (userId) DO NOTHING;

INSERT INTO users (userId, password, fullName, email, phoneNumber, roleId, labInfoId, permissions, isActive) 
SELECT 
  'cashier',
  'fd843ec8e52fc1c5cdda01b67e913a8a4cd5caf0f4ee8fb5e2a47ebfa6e0c0b9',
  'John Cashier',
  'cashier@nextgenlab.com',
  '9876543211',
  ur.id,
  li.id,
  '["billing","payments"]',
  true
FROM user_roles ur, lab_info li
WHERE ur.roleName = 'cashier' AND li.labName = 'NextGenLab Medical Diagnostics'
AND NOT EXISTS (SELECT 1 FROM users WHERE userId = 'cashier')
ON CONFLICT (userId) DO NOTHING;

INSERT INTO users (userId, password, fullName, email, phoneNumber, roleId, labInfoId, permissions, isActive) 
SELECT 
  'technician',
  '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11b6d4b34709e34a69407b',
  'Sarah Technician',
  'technician@nextgenlab.com',
  '9876543212',
  ur.id,
  li.id,
  '["test_entry","test_results"]',
  true
FROM user_roles ur, lab_info li
WHERE ur.roleName = 'lab_technician' AND li.labName = 'NextGenLab Medical Diagnostics'
AND NOT EXISTS (SELECT 1 FROM users WHERE userId = 'technician')
ON CONFLICT (userId) DO NOTHING;
