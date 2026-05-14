# Commands to Run the Project

## Complete Project Successfully Converted to TypeScript ✓

---

## Setup & Installation (Already Done ✓)

```bash
# Install dependencies (already completed)
npm install

# Install TypeScript and types (already completed)
npm install --save-dev typescript @types/express @types/node @types/bcrypt @types/jsonwebtoken @types/pg @types/cors ts-node
```

---

## Build the Project

```bash
npm run build
```

**What it does:**

- Compiles all TypeScript files in `src/` folder
- Creates JavaScript files in `dist/` folder
- Type checks the entire codebase
- Takes < 2 seconds to complete

**Expected output:**

```
> siptracker-backend@1.0.0 build
> tsc
```

**Result:** Exit code 0 (success), no errors

---

## Run the Project

### Option 1: Development Mode (with auto-reload)

```bash
npm run dev
```

**What it does:**

- Runs the server in development mode
- Uses ts-node to run TypeScript directly
- Automatically reloads on code changes
- Shows detailed logs

**Expected output:**

```
Server is running on port 3000
Connected to Supabase PostgreSQL
```

### Option 2: Production Mode

```bash
npm start
```

**What it does:**

- Runs the pre-compiled JavaScript from `dist/`
- Optimized for performance
- No TypeScript compilation needed

**Expected output:**

```
Server is running on port 3000
Connected to Supabase PostgreSQL
```

---

## Quick Command Reference

| Command         | Purpose                         | Mode        |
| --------------- | ------------------------------- | ----------- |
| `npm run build` | Compile TypeScript → JavaScript | Build       |
| `npm run dev`   | Run with auto-reload            | Development |
| `npm start`     | Run production build            | Production  |
| `npm test`      | Run tests (placeholder)         | Testing     |

---

## Testing the API

Once the server is running, test with curl:

```bash
# Health check - Get all AMCs (requires token)
curl -X GET http://localhost:3000/api/amcs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123","first_name":"John"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'
```

---

## Project Status

✓ **TypeScript Conversion**: Complete
✓ **Compilation**: No errors
✓ **Type Safety**: Enabled (strict mode)
✓ **Dependencies**: Installed
✓ **Build Process**: Working
✓ **Server**: Ready to start
✓ **Documentation**: Complete

---

## Environment Setup

Before running, ensure:

1. **Database Connection** - Update `.env` file:

   ```env
   DB_USER=your_username
   DB_HOST=localhost
   DB_NAME=your_database
   DB_PASSWORD=your_password
   DB_PORT=5432
   PORT=3000
   ```

2. **PostgreSQL Running** - Ensure database is accessible

3. **Database Tables Created** - Required tables should exist

---

## Troubleshooting

### "npm: command not found"

- Install Node.js from https://nodejs.org/

### "Database connection failed"

- Update `.env` with correct database credentials
- Ensure PostgreSQL is running

### "Port already in use"

- Change PORT in `.env` file to an available port

### "Cannot find module"

- Run `npm install` to reinstall dependencies

### "TypeScript compilation failed"

- Delete `node_modules` folder
- Run `npm install` again
- Run `npm run build`

---

## Project Files Location

```
SIPTRACKER-BACKEND/
├── src/                    ← TypeScript source code
├── dist/                   ← Compiled JavaScript
├── package.json            ← Project config
├── tsconfig.json          ← TypeScript config
├── .env                   ← Environment setup (update this!)
└── README.md              ← Full documentation
```

---

## Next Steps

1. Update `.env` with your database credentials
2. Run `npm run build` to compile
3. Run `npm run dev` to start server
4. Test API endpoints
5. Deploy to production!

---

**Status: READY TO RUN** ✓

All TypeScript has been compiled. Server is ready to start as soon as you run `npm run build` and `npm start` (or `npm run dev`).
