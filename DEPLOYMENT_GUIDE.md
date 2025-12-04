# Medical Lab Management - Deployment Guide

## For Distributing to Another System

### **Method 1: Using the Setup & Run Script (Recommended for First-Time Setup)**

1. **Prerequisites on target system:**
   - Windows OS
   - Internet connection (for downloading packages)

2. **Steps to deploy:**
   - Copy the entire project folder to the target system
   - Double-click `setup-and-run.vbs`
   - The script will:
     - Check for Node.js (install if missing)
     - Check for pnpm (install if missing)
     - Install all project dependencies
     - Build the project
     - Start the development server

### **Method 2: Using the Quick Run Script (For Already Configured Systems)**

1. **Prerequisites:**
   - Node.js installed
   - pnpm installed globally
   - Project dependencies already installed

2. **Steps to deploy:**
   - Copy the project folder to the target system
   - Double-click `run-dev.vbs`
   - Development server starts on port 3000

---

## Manual Steps (If VBS Scripts Don't Work)

1. Open Command Prompt and navigate to the project folder:
   ```cmd
   cd /d "C:\path\to\medical-lab-management"
   ```

2. Install Node.js if not already installed:
   - Download from https://nodejs.org/

3. Install pnpm globally:
   ```cmd
   npm install -g pnpm
   ```

4. Install project dependencies:
   ```cmd
   pnpm install
   ```

5. Build the project:
   ```cmd
   pnpm build
   ```

6. Start the development server:
   ```cmd
   pnpm dev
   ```

7. Access the application:
   - Open browser and go to `http://localhost:3000`

---

## Database Setup (Important)

If your application requires PostgreSQL database:

1. Ensure PostgreSQL is running on the target system
2. Update database connection string in your `.env` file (if it exists)
3. Run database migrations:
   ```cmd
   pnpm db:migrate
   ```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `pnpm: command not found` | Install pnpm: `npm install -g pnpm` |
| `node: command not found` | Install Node.js from nodejs.org |
| Port 3000 already in use | Modify port in vite.config.ts or specify different port |
| Permission denied | Run Command Prompt as Administrator |
| Module not found errors | Delete `node_modules` and `.pnpm-store`, then run `pnpm install` again |

---

## File Structure for Distribution

```
medical-lab-management/
├── setup-and-run.vbs          ← Run this first on new system
├── run-dev.vbs                ← Run this after setup
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── vite.config.ts
├── src/                       ← Your source code
├── public/                    ← Static assets
├── drizzle/                   ← Database migrations
└── [other project files...]
```

---

## Tips

- **For production deployment:** Use `pnpm build` to create optimized production build
- **For multiple systems:** Create a `.env` file for environment-specific configurations
- **Auto-start on boot:** Create a Windows Task Scheduler task to run the VBS script at startup
