# SL3 - Modern Web Application

SL3 is a modern web application built with Next.js for the frontend and NestJS for the backend, featuring a robust authentication system, user profiles, and a responsive design.

## 🚀 Features

- 🔐 Secure Authentication System
- 👤 User Profiles with Avatar Support
- 🌓 Dark/Light Mode
- 🌍 Internationalization Support
- 📱 Responsive Design
- 🔄 Real-time State Management with Zustand
- 🎨 Modern UI with Tailwind CSS
- 🛡️ Role-based Access Control

## 🛠️ Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Zod (Validation)
- Shadcn/ui Components

### Backend
- NestJS
- MongoDB
- JWT Authentication
- Swagger API Documentation

## 🏗️ Prerequisites

Before you begin, ensure you have installed:
- Docker and Docker Compose
- Node.js (v18+ for local development)
- pnpm (package manager)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SL3
   ```

2. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your_jwt_secret_here
   MONGODB_URI=mongodb://mongo:27017/sl3
   ```

3. **Start the Application**

   Using Docker (recommended):
   ```bash
   docker-compose up
   ```

   The application will be available at:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - MongoDB: mongodb://localhost:27017

## 💻 Development

### Using Docker (Recommended)

The project is configured with Docker Compose for easy development:

```bash
# Start all services in development mode
docker-compose up

# Rebuild containers after dependencies change
docker-compose up --build

# Stop all services
docker-compose down

# Remove volumes (if you need to clean the database)
docker-compose down -v
```

### Local Development

If you prefer to run the services locally:

1. **Frontend Setup**
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pnpm install
   pnpm start:dev
   ```

3. **Database Setup**
   Make sure MongoDB is running locally or update the connection string in your environment variables.

## 📁 Project Structure

```
SL3/
├── frontend/                # Next.js frontend application
│   ├── app/                # App router pages
│   ├── components/         # Reusable components
│   ├── contexts/           # Context providers
│   ├── lib/               # Utilities and helpers
│   └── types/             # TypeScript type definitions
│
├── backend/                # NestJS backend application
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # Users module
│   │   └── main.ts        # Application entry point
│   └── test/              # Test files
│
└── docker-compose.yml      # Docker compose configuration
```

## 🔒 Authentication

The application uses JWT-based authentication:
1. Tokens are stored in both localStorage and HTTP-only cookies
2. Protected routes are handled by middleware
3. Automatic token refresh mechanism
4. Secure logout process

## 🧪 Testing

```bash
# Frontend tests
cd frontend
pnpm test

# Backend tests
cd backend
pnpm test
```

## 📚 API Documentation

Once the backend is running, you can access the Swagger API documentation at:
```
http://localhost:3001/api/docs
```

## 🚀 Deployment

### Production Build

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up --build
```

### Environment Variables

Make sure to set the following environment variables in production:
- `JWT_SECRET`: Secret key for JWT tokens
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Set to 'production'

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
