import { createServerFn } from '@tanstack/react-start';
import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { users } from '@/db/schema';

// Hash password function
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const createUserSchema = z.object({
  userId: z.string(),
  password: z.string(),
  fullName: z.string(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  roleId: z.number(),
  labInfoId: z.number(),
  permissions: z.array(z.string()).optional(),
});

const loginUserSchema = z.object({
  userId: z.string(),
  password: z.string(),
});

const getAllUsersSchema = z.object({
  labInfoId: z.number(),
});

const updateUserSchema = z.object({
  id: z.number(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  roleId: z.number().optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const deleteUserSchema = z.object({
  id: z.number(),
});

// Create user
export const createUser = createServerFn({ method: 'POST' })
  .inputValidator(createUserSchema)
  .handler(async ({ data }) => {
    try {
      const hashedPassword = hashPassword(data.password);
      
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.userId, data.userId),
      });

      if (existingUser) {
        throw new Error(`User with login ID "${data.userId}" already exists`);
      }
      
      const result = await db.insert(users).values({
        userId: data.userId,
        password: hashedPassword,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        roleId: data.roleId,
        labInfoId: data.labInfoId,
        permissions: JSON.stringify(data.permissions || []),
        isActive: true,
      }).returning();

      return { success: true, user: result[0] };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create user');
    }
  });

// Login user
export const loginUser = createServerFn({ method: 'POST' })
  .inputValidator(loginUserSchema)
  .handler(async ({ data }) => {
    try {
      const hashedPassword = hashPassword(data.password);
      
      const result = await db.query.users.findFirst({
        where: and(
          eq(users.userId, data.userId),
          eq(users.password, hashedPassword),
          eq(users.isActive, true)
        ),
        with: {
          role: true,
          labInfo: true,
        },
      });

      if (!result) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Update last login
      await db.update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, result.id));

      return {
        success: true,
        user: {
          id: result.id,
          userId: result.userId,
          fullName: result.fullName,
          email: result.email,
          role: result.role.roleName,
          roleId: result.roleId,
          labInfo: result.labInfo,
          permissions: result.permissions ? JSON.parse(result.permissions) : [],
        },
      };
    } catch (error) {
      console.error('Error logging in:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  });

// Get all users
export const getAllUsers = createServerFn({ method: 'POST' })
  .inputValidator(getAllUsersSchema)
  .handler(async ({ data }) => {
    try {
      const result = await db.query.users.findMany({
        where: eq(users.labInfoId, data.labInfoId),
        with: {
          role: true,
        },
      });

      return { users: result };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch users');
    }
  });

// Update user
export const updateUser = createServerFn({ method: 'POST' })
  .inputValidator(updateUserSchema)
  .handler(async ({ data }) => {
    try {
      const updateData: any = {};
      if (data.fullName) updateData.fullName = data.fullName;
      if (data.email) updateData.email = data.email;
      if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
      if (data.roleId) updateData.roleId = data.roleId;
      if (data.permissions) updateData.permissions = JSON.stringify(data.permissions);
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      updateData.updatedAt = new Date();

      const result = await db.update(users)
        .set(updateData)
        .where(eq(users.id, data.id))
        .returning();

      return { success: true, user: result[0] };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update user');
    }
  });

// Delete user
export const deleteUser = createServerFn({ method: 'POST' })
  .inputValidator(deleteUserSchema)
  .handler(async ({ data }) => {
    try {
      await db.delete(users).where(eq(users.id, data.id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  });

// Get available roles
export const getAvailableRoles = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const result = await db.query.userRoles.findMany();
    return { roles: result };
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch roles');
  }
});
