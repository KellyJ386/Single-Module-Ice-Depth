# IceDepth Pro - Professional Ice Rink Monitoring SAAS

A comprehensive full-stack SAAS platform for monitoring and analyzing ice depth measurements across multiple ice rink configurations.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Overview

IceDepth Pro is a modern, professional-grade SAAS application designed for ice rink facilities to track and analyze ice thickness measurements. The platform provides real-time monitoring, historical tracking, visual analytics, and automated reporting capabilities.

## ✨ Key Features

### Frontend Features
- **🏒 Three Rink Templates**: Olympic (60m × 30m), NHL (200ft × 85ft), Studio (40m × 20m)
- **📍 Numbered Measurement Points**: Snaking pattern (1 to last point) for systematic tracking
- **🎨 Color-Coded Status Indicators**:
  - 🔴 Red: <1" (too thin)
  - 🟢 Green: 1"-1.75" (good)
  - 🟡 Yellow: 1.76"-2" (acceptable)
  - 🔴 Red: 2.01"-5" (too thick)
- **📏 Dual Unit Display**: Inches and centimeters with auto-conversion
- **📝 Notes Field**: Add observations and comments for each measurement
- **📊 Interactive SVG Diagrams**: Click-to-measure interface
- **📈 Analytics Dashboard**: Visual charts and statistics
- **📄 PDF Export**: Professional measurement reports
- **🔐 User Authentication**: Secure login and signup system
- **💾 Data Persistence**: Backend API with database storage
- **📱 Responsive Design**: Works on desktop, tablet, and mobile

### Backend Features
- **🔒 JWT Authentication**: Secure token-based authentication
- **📊 RESTful API**: Complete CRUD operations
- **💾 SQLite Database**: Easy deployment and management
- **📈 Analytics Engine**: Real-time statistics and calculations
- **📜 History Tracking**: Complete audit trail of measurements
- **🔍 Input Validation**: Express-validator for data integrity
- **🚀 Fast Performance**: Optimized queries with proper indexing

## 🏗️ Project Structure

```
Single-Module-Ice-Depth/
├── icedepth-pro-project/          # Frontend React Application
│   ├── src/
│   │   ├── components/
│   │   │   └── HistoryAnalytics.jsx  # Analytics dashboard
│   │   ├── App.jsx                   # Main app with all components
│   │   ├── api.js                    # API service layer
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                        # Node.js/Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js              # Authentication routes
│   │   │   └── measurements.js      # Measurement routes
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT middleware
│   │   ├── database.js              # SQLite setup
│   │   └── server.js                # Express server
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/KellyJ386/Single-Module-Ice-Depth.git
cd Single-Module-Ice-Depth
```

2. **Set up Backend**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start backend server
npm run dev
```

Backend will run at `http://localhost:5000`

3. **Set up Frontend** (in a new terminal)
```bash
cd icedepth-pro-project
npm install

# Start development server
npm run dev
```

Frontend will run at `http://localhost:3000`

## 📖 Usage Guide

### 1. User Registration & Login
- Navigate to the application
- Create an account with email and password
- Or use demo credentials (if configured)

### 2. Recording Measurements
- Select a rink template from the dashboard
- Click on any numbered red circle measurement point
- Enter ice depth in inches
- Add optional notes for observations
- View real-time color coding and cm conversion
- Click "Save" to store the measurement

### 3. Viewing Analytics
- Navigate to History & Analytics from the rink editor
- View statistics: total measurements, average depth, min/max
- Analyze status distribution pie chart
- Review recent measurements trend
- Browse detailed history table

### 4. Exporting Reports
- Click "Export PDF" button in rink editor
- Get formatted PDF with:
  - All measurements sorted by point number
  - Both inches and cm values
  - Color-coded status indicators
  - Notes and timestamps
  - Depth guidelines reference

## 🎨 Color Coding System

| Depth Range | Status | Color | Meaning |
|------------|--------|-------|---------|
| <1" | Too Thin | 🔴 Red | Unsafe - too thin |
| 1"-1.75" | Good | 🟢 Green | Optimal thickness |
| 1.76"-2" | Acceptable | 🟡 Yellow | Acceptable but monitor |
| 2.01"-5" | Too Thick | 🔴 Red | Too thick - resurface needed |

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Measurements
- `GET /api/measurements/:rinkId` - Get all measurements for a rink
- `POST /api/measurements` - Save/update measurement
- `DELETE /api/measurements/:rinkId/:pointId` - Delete measurement
- `GET /api/measurements/history/:rinkId` - Get measurement history
- `GET /api/measurements/analytics/:rinkId` - Get analytics data

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Measurements Table
```sql
CREATE TABLE measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  rink_id TEXT NOT NULL,
  point_id TEXT NOT NULL,
  depth REAL NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, rink_id, point_id)
);
```

### Measurement History Table
```sql
CREATE TABLE measurement_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  rink_id TEXT NOT NULL,
  point_id TEXT NOT NULL,
  depth REAL NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 💻 Technology Stack

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite 5.0
- **Styling**: TailwindCSS 3.3
- **Charts**: Chart.js 4.4 + react-chartjs-2
- **PDF Export**: jsPDF 2.5 + jspdf-autotable
- **Graphics**: Native SVG with DOM manipulation

### Backend
- **Runtime**: Node.js
- **Framework**: Express 4.18
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **CORS**: cors middleware

## 🔐 Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT token authentication (7-day expiry)
- Protected API routes with middleware
- Input validation on all endpoints
- SQL injection prevention with prepared statements
- CORS configuration for specific origins
- Secure session management

## 📊 Analytics Features

- **Total Measurements**: Count of all recorded points
- **Average Depth**: Mean ice thickness across all points
- **Min/Max Depth**: Range of ice thickness
- **Status Distribution**: Breakdown by quality categories
- **History Count**: Total number of historical records
- **Trend Analysis**: Visual line chart of recent measurements
- **Pie Chart**: Status distribution visualization

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd icedepth-pro-project
npm run build
# Deploy dist/ folder
```

### Backend Deployment (Heroku/Railway/Render)
```bash
cd backend
# Set environment variables
# Deploy using platform CLI
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
JWT_SECRET=your_secure_random_secret
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-api.com/api
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- Chart.js for beautiful data visualizations
- Express.js for the robust backend framework
- The ice rink maintenance community for requirements

## 📞 Support

For questions or support:
- Create an issue on GitHub
- Email: support@icedepth.pro (if configured)

## 🗺️ Roadmap

- [ ] Multi-facility support
- [ ] Custom rink template creation
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Export to Excel/CSV
- [ ] Real-time collaboration
- [ ] Advanced analytics with AI predictions
- [ ] Integration with IoT sensors
- [ ] Multi-language support
- [ ] Role-based access control

---

**IceDepth Pro** - Precise Ice Monitoring, Professional Results ❄️

Built with ❤️ by the IceDepth Team
