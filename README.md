# Conclave - Crack JEE Practice App

An accessibility-first JEE practice application with custom JWT authentication, built with Expo React Native, NestJS, and PostgreSQL.

## Architecture

- **Client**: Expo React Native with Expo Router
- **Server**: NestJS API with Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Custom JWT with bcrypt password hashing

## Project Structure

```
conclave/
├── apps/
│   ├── client/          # Expo React Native app
│   └── server/          # NestJS API
└── packages/
    └── db/              # Prisma schema and migrations
```

## Setup Instructions

### 1. Environment Variables

#### Client (Expo)

Create `apps/client/.env`:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

#### Server (NestJS)

Create `apps/server/.env`:

```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/conclave?schema=public
PORT=3000
```

### 2. Database Setup

```bash
# Install dependencies
npm install

# Run Prisma migrations
cd packages/db
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 3. Development

Start both apps in parallel:

```bash
# From root
npm run dev
```

Or start individually:

```bash
# Server
cd apps/server
npm run dev

# Client (new terminal)
cd apps/client
npm run dev
```

## Authentication Flow

### Unauthenticated User
1. User opens app → redirected to `/sign-in`
2. User signs up/signs in with email and password
3. Server validates credentials and issues JWT tokens
4. Tokens stored in Expo SecureStore

### Authenticated User (No Profile)
1. User redirected to `/onboarding`
2. User fills profile data (name, username, school, grade, stream)
3. Profile created via `POST /user-profile` (userId extracted from JWT)
4. User redirected to main app

### Authenticated User (Has Profile)
1. User accesses main app directly
2. API requests include JWT access token in Authorization header
3. Server verifies token via JwtAuthGuard
4. userId extracted and used for profile operations

## API Endpoints

### Auth Endpoints
- `POST /auth/signup` - Register new user (email, password)
- `POST /auth/login` - Login and get JWT tokens
- `POST /auth/refresh` - Refresh access token using refresh token

### Public Endpoints
- `GET /user-profile/check-username/:username` - Check username availability

### Protected Endpoints (Requires JWT Token)
- `GET /user-profile/me` - Get authenticated user's profile
- `POST /user-profile` - Create user profile (userId from token)
- `PATCH /user-profile/me` - Update user profile

## Security Model

- **Never trust userId from client**: The server extracts userId from the verified JWT token
- **Token verification**: All protected routes use JwtAuthGuard
- **Password hashing**: bcrypt with salt rounds of 10
- **Session persistence**: Expo SecureStore for token caching
- **Token expiration**: Access tokens expire in 15 minutes, refresh tokens in 7 days
- **CORS**: Enabled for development

## Database Models

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  profile   UserProfile?
}

model UserProfile {
  id        String   @id @default(uuid())
  userId    String   @unique
  name      String
  userName  String   @unique
  birthday  DateTime?
  school    String
  grade     String
  stream    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Testing the Flow

### New User
1. Sign up → authenticated → no profile → onboarding → create profile → home screen

### Existing User
1. Sign in → authenticated → GET /user-profile/me → profile found → home screen

### Unauthorized
1. No JWT token → protected API returns 401 → redirect to sign-in

### Username Uniqueness
1. Two users cannot create the same username (validated server-side)

## Build

```bash
npm run build
```

## Type Check

```bash
npm run check-types
```
