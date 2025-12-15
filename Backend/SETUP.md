# Backend Setup Instructions

## Prerequisites

### 1. Install Node.js Dependencies

```bash
cd Backend
npm install
```

### 2. Set up MongoDB Database

Choose one of the following options:

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/atlas
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Get your connection string from "Connect" > "Connect your application"
5. Update `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/restaurant-lms?retryWrites=true&w=majority
   ```

#### Option B: Local MongoDB
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Use default connection string in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/restaurant-lms
   ```

#### Option C: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Seed the Database

After setting up MongoDB, run the seed script to populate with sample data:

```bash
npm run seed
```

This will create:
- Admin user: `admin@restaurant.com` / `admin123`
- Instructor user: `maria@restaurant.com` / `password123`
- Sample courses with chapters and videos

### 4. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Testing the API

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Login as Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "admin123"
  }'
```

### 3. Get Courses (use token from login response)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/courses
```

## Frontend Integration

1. Start the backend server
2. Update frontend API base URL if needed (currently set to `http://localhost:5000/api`)
3. Start the frontend:
   ```bash
   cd ../Frontend
   npm run dev
   ```
4. Login with the seeded credentials

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (check service status)
- Verify connection string in `.env`
- For Atlas: Check IP whitelist and network access
- For local: Ensure MongoDB service is started

### Port Already in Use
- Change PORT in `.env`
- Kill process: `npx kill-port 5000`

### JWT Issues
- Clear localStorage in browser
- Check JWT_SECRET is set
- Tokens expire after 7 days

### CORS Issues
- Check FRONTEND_URL in `.env` matches your frontend URL

## API Documentation

See `README.md` for complete API documentation with all endpoints, request/response formats, and authentication details.