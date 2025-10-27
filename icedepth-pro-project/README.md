# IceDepth Pro - Professional Ice Rink Monitoring SAAS

![IceDepth Pro Logo](https://img.shields.io/badge/IceDepth-Pro-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

A professional SaaS platform for monitoring ice depth measurements across multiple ice rink templates. Built with React and TailwindCSS, featuring user authentication, persistent data storage, and interactive SVG-based rink diagrams.

## 🎯 Features

- **🔐 User Authentication** - Secure login and signup system
- **🏒 Multiple Rink Templates** - Olympic, NHL, and Studio rink layouts
- **📊 Interactive Measurements** - Click-to-measure interface with visual feedback
- **💾 Persistent Storage** - LocalStorage-based data persistence per user
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **🎨 Modern UI** - Clean, professional interface with TailwindCSS
- **⚡ Fast & Lightweight** - Built with Vite for optimal performance

## 🚀 Live Demo

Try the demo account:
- **Email:** demo@icedepth.com
- **Password:** demo123

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/icedepth-pro.git
cd icedepth-pro
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 🏗️ Project Structure

```
icedepth-pro/
├── src/
│   ├── components/
│   │   ├── LoginPage.jsx       # Authentication component
│   │   ├── Dashboard.jsx       # Main dashboard with rink selection
│   │   └── RinkEditor.jsx      # Interactive rink measurement interface
│   ├── App.jsx                 # Main app component with routing logic
│   ├── main.jsx                # App entry point
│   └── index.css               # Global styles with Tailwind
├── public/                     # Static assets
├── index.html                  # HTML template
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # TailwindCSS configuration
├── postcss.config.js           # PostCSS configuration
└── package.json                # Dependencies and scripts
```

## 🎮 Usage

### Creating an Account
1. Navigate to the login page
2. Click "Sign Up" tab
3. Enter your name, email, and password
4. Click "Create Account"

### Recording Measurements
1. Select a rink template from the dashboard (Olympic, NHL, or Studio)
2. Click on any red circle measurement point on the rink diagram
3. Enter the ice depth measurement (e.g., "1.5\"")
4. Click "Save"
5. The measurement will appear as a blue badge on the rink

### Editing/Deleting Measurements
1. Click on any blue badge (existing measurement)
2. Modify the value or leave it blank to delete
3. Click "Save"

## 🎨 Rink Templates

### Olympic Rink (60m × 30m)
- Standard international hockey rink size
- 14 measurement points strategically placed
- Complete rink markings including blue lines, center line, and face-off circles

### NHL Rink (200ft × 85ft)
- North American professional hockey standard
- 14 measurement points across defensive and neutral zones
- Authentic NHL rink layout

### Studio Rink (40m × 20m)
- Smaller practice/training rink
- 12 measurement points
- Ideal for training facilities and studios

## 💻 Technology Stack

- **Frontend Framework:** React 18.2
- **Styling:** TailwindCSS 3.3
- **Build Tool:** Vite 5.0
- **SVG Graphics:** Native SVG with DOM manipulation
- **State Management:** React Hooks (useState, useEffect, useCallback, useRef)
- **Data Persistence:** LocalStorage API

## 🔒 Data Storage

All user data is stored locally in the browser using LocalStorage:
- **User Accounts:** `iceRinkUsers`
- **Measurements:** `iceDepth_{userId}`
- **Session:** `currentUser`

> **Note:** This is a demo implementation. For production use, implement a proper backend with database storage and authentication.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] Backend API integration with database
- [ ] JWT-based authentication
- [ ] Export measurements to PDF/Excel
- [ ] Multi-user collaboration
- [ ] Historical data tracking and analytics
- [ ] Custom rink template creation
- [ ] Email notifications and reports
- [ ] Mobile app (React Native)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Created with ❄️ by Claude & Your Team

## 🙏 Acknowledgments

- React team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- Vite for the blazing-fast build tool

---

**IceDepth Pro** - Precise Ice Monitoring, Professional Results

For questions or support, please open an issue on GitHub.
