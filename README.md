# TechTalke

TechTalke is a real-time chat application built with modern web technologies, featuring user authentication, messaging, and admin capabilities.

## Features

- Real-time messaging using Socket.IO
- User authentication and authorization
- Admin dashboard with user management
- Profile customization
- Message history and management
- Responsive design with modern UI

## Tech Stack

### Client
- React.js 18
- Vite
- Socket.IO Client
- Tailwind CSS
- Radix UI Components
- Zustand (State Management)
- Axios
- React Router DOM

### Server
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT Authentication
- Cloudinary (Image Upload)
- Multer

## Getting Started

### Prerequisites

- Node.js (LTS version)
- npm or yarn
- MongoDB instance

### Installation

1. Clone the repository
```sh
git clone https://github.com/kethn-tech/TechTalke.git
cd TechTalke
```

2. Install Client Dependencies
```sh
cd Client
npm i vite --save-dev
npm install
```

3. Install Server Dependencies
```sh
cd Server
npm install
```

### Environment Setup

1. Client Configuration (.env)
```env
VITE_APP_SERVER_URL=http://localhost:4000
```

2. Server Configuration (.env)
```env
PORT=4000
DATABASE_URL=YOUR DB URL Local/Atlas
JWT_KEY=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=YOUR_CLOUDINARY_NAME
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_SECRET
```

## Running the Application

1. Start the Server
```sh
cd Server
npm run dev
```

2. Start the Client
```sh
cd Client
npm run dev
```

The client will be available at `http://localhost:5173` and the server at `http://localhost:4000`

## Project Structure

### Client Directory
```
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application pages/routes
│   ├── context/        # React context providers
│   ├── store/          # Zustand state management
│   ├── lib/            # Utility functions and helpers
│   ├── assets/         # Static assets (images, icons)
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles
├── public/             # Static files served directly
├── dist/               # Production build output
├── .env                # Environment variables
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Project dependencies and scripts
```

### Server Directory
```
├── config/             # Configuration files
│   ├── cloudinary.js   # Cloudinary setup
│   └── database.js     # Database connection
├── controllers/        # Request handlers
│   ├── AdminController.js
│   ├── AuthController.js
│   ├── ContactController.js
│   ├── messageController.js
│   └── profileController.js
├── middlewares/        # Custom middleware functions
│   ├── AuthMiddleware.js
│   └── upload.js
├── models/             # Database models
│   ├── MessageModel.js
│   └── UserModel.js
├── routes/             # API route definitions
│   ├── AuthRoute.js
│   ├── ContactRoutes.js
│   ├── adminRoutes.js
│   ├── messageRoutes.js
│   └── profileRoute.js
├── uploads/            # File upload directory
├── socket.js           # Socket.IO configuration
├── server.js           # Main server entry point
└── .env                # Environment variables
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/logout` - User logout

### Admin Routes
- GET `/api/admin/dashboard-stats` - Get dashboard statistics
- GET `/api/admin/users` - Get all users
- PUT `/api/admin/users/update-role` - Update user role
- DELETE `/api/admin/users/:userId` - Delete user

### Messages
- GET `/api/messages` - Get user messages
- POST `/api/messages` - Send new message
- DELETE `/api/messages/:messageId` - Delete message

### Profile
- GET `/api/profile` - Get user profile
- PUT `/api/profile` - Update profile
- POST `/api/profile/upload` - Upload profile image

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## KASTUDIO
## KETHAN R AYATTI
