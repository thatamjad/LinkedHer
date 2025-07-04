# Linker - Women's Professional Networking Platform

Linker is a professional networking platform designed exclusively for women, featuring a secure verification system to ensure a safe and supportive community.

## Project Structure

This project follows the MERN stack architecture:

- **Frontend**: React application with Material UI and styled components
- **Backend**: Node.js with Express API server
- **Database**: MongoDB with Mongoose ORM

## Features Implemented (Phase 1, Weeks 1-5)

- User authentication with JWT and refresh tokens
- 7-day verification window with countdown display
- Multiple verification methods:
  - LinkedIn verification
  - Professional email verification
  - Government ID verification
- Verification status tracking and scoring
- User profile management
- Responsive UI with women-centric design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

### Configuration

1. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_refresh_token_secret_here
   JWT_EXPIRY=1h
   JWT_REFRESH_EXPIRY=7d
   CLIENT_URL=http://localhost:3000
   VERIFICATION_WINDOW_DAYS=7
   ```

2. The frontend `.env` file should contain:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Access the application at `http://localhost:3000`

## License

This project is licensed under the ISC License.

## Acknowledgments

- Phase-wise plan based on the Linker project requirements 