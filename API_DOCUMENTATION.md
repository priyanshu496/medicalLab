# API Documentation - Medical Lab Management System

## Overview
This document describes all new API endpoints created for the dashboard redesign and user role system.

---

## Authentication APIs

### `/api/users.ts`

#### 1. **loginUser** - User Authentication
**Purpose:** Authenticate user with credentials and return user session data

**Function:** `loginUser(data: { userId: string; password: string })`

**Request:**
```typescript
{
  userId: "master",           // Login username
  password: "master123"       // User password
}
```

**Response (Success):**
```typescript
{
  success: true,
  user: {
    id: 1,
    userId: "master",
    fullName: "Master Administrator",
    email: "admin@lab.com",
    role: "master",           // 'master', 'cashier', or 'lab_technician'
    roleId: 1,
    labInfo: { /* lab info object */ },
    permissions: []
  }
}
```

**Response (Failure):**
```typescript
{
  success: false,
  message: "Invalid credentials"
}
```

**Implementation:**
- Hashes input password using SHA256
- Compares with stored password
- Returns user data with lab info and role details
- Updates lastLogin timestamp

---

#### 2. **createUser** - Create New Employee
**Purpose:** Create a new employee/user account with role assignment

**Function:** `createUser(data: { userId: string; password: string; fullName: string; email?: string; phoneNumber?: string; roleId: number; labInfoId: number; permissions?: string[] })`

**Request:**
```typescript
{
  userId: "john.doe",
  password: "secure123",
  fullName: "John Doe",
  email: "john@lab.com",
  phoneNumber: "9876543210",
  roleId: 2,                  // ID of role (cashier, technician, etc.)
  labInfoId: 1,               // ID of lab
  permissions: []
}
```

**Response (Success):**
```typescript
{
  success: true,
  user: {
    id: 5,
    userId: "john.doe",
    fullName: "John Doe",
    email: "john@lab.com",
    phoneNumber: "9876543210",
    roleId: 2,
    labInfoId: 1,
    permissions: "[]",
    isActive: true,
    createdAt: timestamp
  }
}
```

**Error Handling:**
- Unique constraint on userId
- Validates role exists
- Validates lab exists

---

#### 3. **getAllUsers** - Fetch All Users
**Purpose:** Get list of all users for a specific lab

**Function:** `getAllUsers(data: { labInfoId: number })`

**Request:**
```typescript
{
  labInfoId: 1
}
```

**Response:**
```typescript
{
  users: [
    {
      id: 1,
      userId: "master",
      fullName: "Master Administrator",
      email: "admin@lab.com",
      role: {
        id: 1,
        roleName: "master",
        description: "..."
      },
      isActive: true,
      createdAt: timestamp
    },
    // ... more users
  ]
}
```

---

#### 4. **updateUser** - Modify User Details
**Purpose:** Update user information and permissions

**Function:** `updateUser(data: { id: number; fullName?: string; email?: string; phoneNumber?: string; roleId?: number; permissions?: string[]; isActive?: boolean })`

**Request:**
```typescript
{
  id: 5,
  fullName: "John Doe Updated",
  email: "john.new@lab.com",
  roleId: 3,
  isActive: true
}
```

**Response (Success):**
```typescript
{
  success: true,
  user: { /* updated user object */ }
}
```

---

#### 5. **deleteUser** - Remove User Account
**Purpose:** Delete a user account from the system

**Function:** `deleteUser(data: { id: number })`

**Request:**
```typescript
{
  id: 5
}
```

**Response:**
```typescript
{
  success: true
}
```

**Note:** This is a hard delete. Consider implementing soft delete for audit trails.

---

#### 6. **getAvailableRoles** - Fetch All Roles
**Purpose:** Get list of all available user roles

**Function:** `getAvailableRoles()`

**Response:**
```typescript
{
  roles: [
    {
      id: 1,
      roleName: "master",
      description: "Master Administrator with full system access"
    },
    {
      id: 2,
      roleName: "cashier",
      description: "Cashier for payment and billing management"
    },
    {
      id: 3,
      roleName: "lab_technician",
      description: "Lab technician for test entry and results"
    }
  ]
}
```

---

## Lab Information APIs

### `/api/lab-info.ts`

#### 1. **createLabInfo** - Create Lab Configuration
**Purpose:** Create initial lab information

**Function:** `createLabInfo(data: { labName: string; labLogo?: string; gstinNumber?: string; registrationNumber: string; policeStationName?: string; address?: string; phoneNumber?: string })`

**Request:**
```typescript
{
  labName: "NextGenLab Diagnostics",
  registrationNumber: "LAB/REG/2024/001",
  gstinNumber: "27AABCT1234H1Z0",
  policeStationName: "Central Police Station",
  address: "123 Hospital Road, City",
  phoneNumber: "+91-8765432100",
  labLogo: "base64_encoded_image_or_url"
}
```

**Response:**
```typescript
{
  success: true,
  labInfo: {
    id: 1,
    labName: "NextGenLab Diagnostics",
    registrationNumber: "LAB/REG/2024/001",
    gstinNumber: "27AABCT1234H1Z0",
    policeStationName: "Central Police Station",
    address: "123 Hospital Road, City",
    phoneNumber: "+91-8765432100",
    labLogo: "...",
    createdAt: timestamp,
    updatedAt: timestamp
  }
}
```

---

#### 2. **getLabInfo** - Get Lab by ID
**Purpose:** Retrieve specific lab information

**Function:** `getLabInfo(data: { id: number })`

**Request:**
```typescript
{
  id: 1
}
```

**Response:**
```typescript
{
  success: true,
  labInfo: { /* lab info object */ }
}
```

---

#### 3. **getMainLabInfo** - Get Primary Lab
**Purpose:** Get the first/main lab (typically used for single-lab setup)

**Function:** `getMainLabInfo()`

**Response:**
```typescript
{
  success: true,
  labInfo: { /* lab info object */ }
}
```

**Error Response:**
```typescript
{
  success: false,
  message: "Lab info not found"
}
```

---

#### 4. **updateLabInfo** - Modify Lab Details
**Purpose:** Update lab configuration

**Function:** `updateLabInfo(data: { id: number; labName?: string; labLogo?: string; gstinNumber?: string; registrationNumber?: string; policeStationName?: string; address?: string; phoneNumber?: string })`

**Request:**
```typescript
{
  id: 1,
  labName: "NextGenLab - New Location",
  gstinNumber: "27AABCT1234H1Z0",
  policeStationName: "West Police Station"
}
```

**Response:**
```typescript
{
  success: true,
  labInfo: { /* updated lab info */ }
}
```

---

## Usage Examples

### Example 1: Complete Login Flow

```typescript
// 1. User submits login form
const response = await loginUser({
  data: {
    userId: "cashier",
    password: "cashier123"
  }
});

// 2. Store user data in localStorage
if (response.success) {
  localStorage.setItem('currentUser', JSON.stringify(response.user));
  
  // 3. Redirect based on role
  if (response.user.role === 'master') {
    navigate({ to: '/dashboard/master' });
  } else if (response.user.role === 'cashier') {
    navigate({ to: '/dashboard/cashier' });
  }
}
```

### Example 2: Create New Employee

```typescript
// Get current lab info from localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Create new employee
const response = await createUser({
  data: {
    userId: "new.tech",
    password: "secure123password",
    fullName: "New Lab Technician",
    email: "tech@lab.com",
    phoneNumber: "9876543210",
    roleId: 3,                    // lab_technician role
    labInfoId: currentUser.labInfo.id
  }
});

if (response.success) {
  console.log('Employee created:', response.user);
}
```

### Example 3: Update Lab Configuration

```typescript
const response = await updateLabInfo({
  data: {
    id: 1,
    labLogo: "base64_encoded_image_data",
    policeStationName: "New Police Station Name"
  }
});
```

---

## Error Handling

### Common Error Scenarios

**1. Invalid Credentials**
```typescript
{
  success: false,
  message: "Invalid credentials"
}
```

**2. User Not Found**
```typescript
{
  success: false,
  message: "User not found"
}
```

**3. Duplicate Username**
```typescript
{
  error: "Unique constraint failed on userId"
}
```

**4. Database Error**
```typescript
{
  error: "Failed to create user"
}
```

---

## Database Constraints

### users table
- `userId` - UNIQUE constraint
- `roleId` - Foreign key to user_roles
- `labInfoId` - Foreign key to lab_info

### lab_info table
- `labName` - NOT NULL
- `registrationNumber` - NOT NULL

### user_roles table
- `roleName` - UNIQUE constraint

---

## Security Considerations

1. **Password Hashing**
   - All passwords are hashed using SHA256
   - Hashing happens server-side
   - Never transmit plain passwords in response

2. **Authorization**
   - Check user role before allowing operations
   - Master user can manage all resources
   - Other roles restricted to their dashboards

3. **Session Management**
   - Store user data in localStorage
   - Clear on logout
   - Check if user is logged in before accessing routes

4. **Input Validation**
   - All inputs validated using Zod schemas
   - Email format validation
   - Required fields enforcement

---

## Performance Tips

1. **Batch Operations**
   - Load users once and cache
   - Avoid repeated getAllUsers calls

2. **Query Optimization**
   - Use labInfoId filter to reduce database load
   - Index frequently searched columns

3. **Caching**
   - Cache user roles (rarely change)
   - Cache lab info (single per lab)

---

## Future Enhancements

1. Add permission-based API access control
2. Implement JWT tokens instead of localStorage
3. Add rate limiting to prevent abuse
4. Implement audit logging for all operations
5. Add password reset functionality
6. Two-factor authentication support
7. API key generation for third-party integrations

---

## Testing the APIs

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"master","password":"master123"}'
```

**Get Available Roles:**
```bash
curl http://localhost:3000/api/roles
```

---

**Last Updated:** December 2025
**API Version:** 1.0
**Status:** Production Ready
