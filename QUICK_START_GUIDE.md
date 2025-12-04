# Quick Start Guide - Medical Lab Management System

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL database running
- pnpm package manager

### Installation & Setup

#### 1. Install Dependencies
```bash
pnpm install
```

#### 2. Database Setup

Run the Drizzle migrations to create new tables:

```bash
pnpm db:migrate
```

Or generate and push schema:
```bash
pnpm db:generate
pnpm db:push
```

#### 3. Insert Predefined Roles

Execute this SQL to add user roles:

```sql
INSERT INTO user_roles (role_name, description) VALUES
('master', 'Master Administrator with full system access'),
('cashier', 'Cashier for payment and billing management'),
('lab_technician', 'Lab technician for test entry and results');
```

#### 4. Create Initial Master User (Manual Entry)

Execute this SQL to create the master user:

```sql
INSERT INTO lab_info (lab_name, registration_number, created_at, updated_at) 
VALUES ('Your Lab Name', 'LAB/REG/2024/001', NOW(), NOW());

INSERT INTO users (user_id, password, full_name, role_id, lab_info_id, is_active, created_at, updated_at)
VALUES (
  'master',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',  -- Hash of 'master123'
  'Master Administrator',
  (SELECT id FROM user_roles WHERE role_name = 'master'),
  (SELECT id FROM lab_info LIMIT 1),
  true,
  NOW(),
  NOW()
);
```

**Note:** The password hash above is SHA256 of "master123". For production, use your own secure passwords.

#### 5. Start Development Server

```bash
pnpm dev
```

The application will run on `http://localhost:3000`

---

## 🔐 First Time Login

### Access the Login Page
Navigate to `http://localhost:3000/login`

### Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Master | master | master123 |
| Cashier | cashier | cashier123 |
| Technician | technician | tech123 |

### After Login
Each user will be redirected to their role-specific dashboard:
- Master → `/dashboard/master`
- Cashier → `/dashboard/cashier`
- Technician → `/dashboard/technician`

---

## 📋 Initial Configuration (First Time as Master)

### Step 1: Configure Lab Information
1. Go to Dashboard → Click "Lab Configuration"
2. Fill in lab details:
   - Lab Name
   - Registration Number
   - GSTIN Number (optional)
   - Police Station Name (optional)
   - Lab Logo (optional - upload image)
3. Click "Save Lab Information"

### Step 2: Create Additional Users
1. Go to Dashboard → Click "Employee Management"
2. Fill in employee details:
   - Full Name
   - Login ID (username)
   - Password
   - Select Role (Cashier or Lab Technician)
   - Email (optional)
   - Phone Number (optional)
3. Click "Add Employee"
4. The new employee can now log in with their credentials

### Step 3: Setup Doctors & Tests (Optional)
1. Go to Dashboard → Click "System Setup"
2. Add doctors, tests, and parameters as needed

---

## 👥 User Role Navigation

### Master Dashboard Path
```
Login Page
    ↓
/dashboard/master (Master Dashboard)
    ├── Lab Configuration (/lab-setup)
    ├── Employee Management (/employee-management)
    ├── System Setup (/setup)
    ├── Patient Registration (/register)
    ├── Test Entry (/)
    └── Test Results (/)
```

### Cashier Dashboard Path
```
Login Page
    ↓
/dashboard/cashier (Cashier Dashboard)
    ├── Search Bills
    ├── Pending Bills (shows payment due)
    └── Completed Payments (shows paid bills)
```

### Technician Dashboard Path
```
Login Page
    ↓
/dashboard/technician (Technician Dashboard)
    ├── Test Entry (/test-entry/:patientId)
    └── Test Results (/test-results)
        └── View Patient Report (/report/:patientId)
```

---

## 📊 Complete User Journey

### Patient Registration & Testing Flow

```
1. MASTER/RECEPTIONIST
   ├── Go to Dashboard → Patient Registration
   ├── Fill patient details
   ├── Select tests to assign
   ├── Generate patient ID
   └── Proceed to billing

2. CASHIER
   ├── Go to Cashier Dashboard
   ├── Search for patient bill
   ├── Process payment
   ├── Mark as paid
   └── Patient is now "Ready for Testing"

3. LAB TECHNICIAN
   ├── Go to Technician Dashboard
   ├── See "Patients Ready for Lab Testing"
   ├── Click "Start Testing"
   ├── On Test Entry Page:
   │   ├── Record test sample details
   │   ├── Enter test results for each parameter
   │   ├── Add clinical impressions
   │   └── Click "Save Results & Generate Report"
   ├── Report is generated automatically
   └── View/Print/Download report

4. REPORT GENERATION
   ├── Lab details auto-populated
   ├── Patient information included
   ├── All test results displayed
   ├── Clinical impressions shown
   ├── Ready for printing/emailing
   └── Saved for future reference
```

---

## 🔧 Key Features Overview

### Master Administrator
- ✅ Manage all lab configurations
- ✅ Create and manage employees
- ✅ Access all operational features
- ✅ System-wide analytics and reports
- ✅ View all transactions and data

### Cashier
- ✅ View patient bills
- ✅ Process payments
- ✅ Search bills by multiple criteria
- ✅ Track payment history
- ✅ Generate payment reports

### Lab Technician
- ✅ View assigned patients
- ✅ Record test samples
- ✅ Enter test results
- ✅ Add clinical interpretations
- ✅ Generate patient reports
- ✅ View test history

---

## 🔍 Troubleshooting

### "Invalid Credentials" on Login
- Check username and password spelling
- Ensure user was created in Employee Management
- Verify user's isActive flag is true in database

### "Payment Not Completed" Error
- Patient must be registered first
- Bill must be created and marked as paid
- Go to Cashier Dashboard to process payment

### "No Patients Available" on Technician Dashboard
- Check if patients have completed payments
- Verify bills are marked as isPaid = true
- Patient might not be assigned any tests

### Database Connection Error
- Verify PostgreSQL is running
- Check database connection string in environment
- Ensure database exists
- Run migrations: `pnpm db:migrate`

---

## 📱 Responsive Design

All dashboards are fully responsive:
- **Desktop:** Full 3-column or multi-column layouts
- **Tablet:** 2-column responsive grid
- **Mobile:** Single column, stacked cards

The card-based design ensures usability on all device sizes.

---

## 🔐 Security Reminders

1. **Change Demo Passwords** in production
2. **Use Strong Passwords** for all accounts
3. **Enable HTTPS** in production
4. **Regular Backups** of database
5. **Audit Logging** (recommended for production)
6. **Role-Based Access** enforced on all pages
7. **Session Timeout** (can be implemented)

---

## 📈 Performance Tips

1. Database indexing on frequently queried columns
2. Implement caching for test parameters
3. Pagination for large patient lists
4. Optimize report generation
5. Monitor database query performance

---

## 🆘 Support & Help

For detailed information, refer to:
- `SYSTEM_REDESIGN_SUMMARY.md` - Complete system documentation
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- Database schema in `src/db/schema.ts`
- API endpoints in `src/routes/api/`

---

## ✅ Checklist for Going Live

- [ ] Database migrations completed
- [ ] Master user created
- [ ] Lab information configured
- [ ] Employees added (Cashier, Technician)
- [ ] Demo passwords changed to production passwords
- [ ] HTTPS/SSL configured
- [ ] Database backups configured
- [ ] Error monitoring setup (Sentry, etc.)
- [ ] User documentation provided
- [ ] Staff training completed

---

**Ready to go?** Start with Step 1 of Initial Configuration and enjoy your new user-friendly lab management system! 🎉

For any issues, check the troubleshooting section or refer to the detailed documentation files.
