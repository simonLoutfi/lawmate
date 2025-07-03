# LawMate Backend

Backend server for the LawMate application, built with Node.js, Express, and MongoDB.

## Features

- User authentication (JWT)
- User roles (User, Lawyer, Mokhtar)
- Document management
- Subscription handling
- File uploads for verification documents
- RESTful API

## Prerequisites

- Node.js (v14 or later)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```
4. Create an `uploads` directory in the root folder for file uploads

## Running the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Profile
- `GET /api/profile` - Get user profile (requires authentication)
- `POST /api/upload-documents` - Upload verification documents (for lawyers/mokhtars)

### Subscriptions
- `POST /api/subscription` - Update subscription plan

### Documents
- `GET /api/documents` - Get all user's documents
- `POST /api/documents` - Create a new document
- `PUT /api/documents/:id` - Update a document
- `DELETE /api/documents/:id` - Delete a document

## License

This project is licensed under the MIT License.
