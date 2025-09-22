# PostgreSQL Database Setup for n8n Project

## Prerequisites
1. PostgreSQL installed and running on your system
2. Node.js and npm/pnpm installed

## Database Setup

### 1. Create PostgreSQL Database
```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE n8n_db;
CREATE USER n8n_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE n8n_db TO n8n_user;
```

### 2. Environment Variables
Create a `.env` file in the `n8n/apps/server/` directory with the following content:

```env
# Database
DATABASE_URL="postgresql://n8n_user:your_password@localhost:5432/n8n_db?schema=public"
DIRECT_DATABASE_URL="postgresql://n8n_user:your_password@localhost:5432/n8n_db?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3000
NODE_ENV=development
```

**Important:** Replace `your_password` with your actual PostgreSQL password and `your-super-secret-jwt-key-change-this-in-production` with a secure random string.

### 3. Install Dependencies
```bash
cd n8n/apps/server
npm install
```

### 4. Generate Prisma Client
```bash
cd n8n/apps/prisma
npx prisma generate
```

### 5. Run Database Migrations
```bash
cd n8n/apps/prisma
npx prisma db push
```

### 6. Start the Server
```bash
cd n8n/apps/server
npm run dev
```

## What Was Fixed

1. **Added Prisma Dependencies**: Added `@prisma/client`, `bcrypt`, and `jsonwebtoken` to the server package.json
2. **Updated Auth Controller**: Modified `authcontroller.ts` to use PostgreSQL database instead of in-memory array
3. **Database Integration**: Both signup and signin now properly interact with the PostgreSQL database through Prisma
4. **Error Handling**: Added proper error handling for database operations

## Testing

Once the server is running, you can test the authentication endpoints:

- **Signup**: `POST http://localhost:3000/api/auth/signup`
- **Signin**: `POST http://localhost:3000/api/auth/signin`

Both endpoints expect JSON with `email` and `password` fields.

## Troubleshooting

1. **Database Connection Issues**: Ensure PostgreSQL is running and the connection string is correct
2. **Prisma Client Issues**: Run `npx prisma generate` in the prisma directory
3. **Migration Issues**: Run `npx prisma db push` to sync the schema with the database
4. **Port Conflicts**: Make sure port 3000 is available or change the PORT in .env
