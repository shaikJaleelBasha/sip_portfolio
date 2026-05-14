# Quick Start Guide

## Project: SIP Tracker & Portfolio Valuation Backend

### Status: ✓ Ready to Run

---

## Prerequisites

Before running the project, ensure you have:

- **Node.js** v16 or higher installed
- **PostgreSQL** database running and accessible
- Database connection details (host, username, password, database name)

---

## Step 1: Install Dependencies

All dependencies are already installed, but if needed:

```bash
cd SIPTRACKER-BACKEND
npm install
```

---

## Step 2: Configure Environment

Edit the `.env` file with your database credentials:

```env
PORT=3000
DB_USER=your_postgres_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_password
DB_PORT=5432
```

---

## Step 3: Build the Project

Compile TypeScript to JavaScript:

```bash
npm run build
```

**Output**: JavaScript files in `dist/` folder
**Expected**: No errors, build completes instantly

---

## Step 4: Run the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Expected Output

```
Server is running on port 3000
Connected to Supabase PostgreSQL
```

---

## Testing the API

Once the server is running, test it with curl:

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "9876543210",
    "dob": "1990-01-01",
    "pan_number": "ABCDE1234F",
    "aadhaar_number": "123456789012",
    "address": "123 Main St"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get All AMCs (requires token)

```bash
curl -X GET http://localhost:3000/api/amcs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Project Structure

```
SIPTRACKER-BACKEND/
├── src/                 # TypeScript source code
├── dist/               # Compiled JavaScript (generated)
├── node_modules/       # Dependencies (already installed)
├── package.json        # Project configuration
├── tsconfig.json       # TypeScript configuration
├── .env               # Environment variables
└── README.md          # Full documentation
```

---

## Available Scripts

```bash
npm run build      # Compile TypeScript → JavaScript
npm run start      # Run production server
npm run dev        # Run development server (with reload)
npm test          # Run tests (placeholder)
```

---

## Code Quality

✓ **Type Safe**: Full TypeScript coverage
✓ **Well Structured**: Clear separation of concerns
✓ **Simple Code**: Easy to understand and review
✓ **Error Handling**: Comprehensive error responses
✓ **No Complexity**: Straightforward patterns

---

## Database Requirements

The project uses PostgreSQL. Create the following tables:

- `users` - User authentication
- `investors` - Investor profiles
- `portfolios` - Investor portfolios
- `mutual_funds` - Fund information
- `fund_nav_history` - NAV history
- `amcs` - Asset Management Companies
- `sips` - SIP records
- `sip_installments` - SIP installments
- `investment_transactions` - Transaction records

(Database setup scripts should be provided separately)

---

## Troubleshooting

### Issue: "Cannot find module 'pg'"

**Solution**: Run `npm install`

### Issue: "Connection to database failed"

**Solution**: Check `.env` file - verify database credentials and ensure PostgreSQL is running

### Issue: "TypeScript compilation failed"

**Solution**: Run `npm install` to ensure all dependencies are present

### Issue: Port already in use

**Solution**: Change PORT in `.env` file or kill process using the port

---

## API Documentation

Full API documentation is available in `README.md`

---

## Support

For issues or questions, check:

1. `.env` configuration
2. Database connection
3. Build output (npm run build)
4. Server logs (npm run dev shows detailed logs)

---

**Ready to deploy!** ✓
