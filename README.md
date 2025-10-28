# MedVault Healthcare System

![MedVault Logo](screenshots/admin-dashboard.png)

## 🏥 Project Overview

MedVault is a comprehensive healthcare management system that connects patients, doctors, and administrators through a secure and efficient platform. Built with modern technologies, it offers features like medical record management, appointment scheduling, emergency services, and real-time analytics.

## ⭐ Key Features

### 🏥 For Healthcare Providers
- **Schedule Management**: Efficient time slot management
- **Patient Records**: Secure access to patient histories
- **Emergency Response**: Quick response to urgent cases
- **Analytics Dashboard**: Track patient metrics and appointments

### 👨‍💼 For Administrators
- **User Management**: Handle doctor and patient registrations
- **Access Control**: Manage permissions and verifications
- **System Analytics**: Monitor platform usage and growth
- **Document Verification**: Validate medical credentials

### 🧑‍🤝‍🧑 For Patients
- **Medical Records**: Secure storage and sharing
- **Appointment Booking**: Easy scheduling system
- **Emergency Services**: 24/7 emergency assistance
- **Document Upload**: Store and manage medical files

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.1.x
- **Language**: Java 17
- **Security**: JWT Authentication
- **Database**: MySQL 8.0
- **Documentation**: OpenAPI (Swagger)

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: Context API
- **UI Components**: Custom components
- **Charts**: Recharts

## 📊 System Architecture

```plaintext
Client Layer
   ↓
React Frontend
   ↓
REST API (Spring Boot)
   ↓
Service Layer
   ↓
Data Access Layer
   ↓
MySQL Database
```

## 🚀 Getting Started

### Prerequisites
- Java JDK 17+
- Node.js 16+
- MySQL 8.0+
- Maven 3.8+

### Backend Setup
1. Clone the repository
   ```bash
   git clone https://github.com/Jaikumar96/medvault-healthcare.git
   ```

2. Configure database
   ```bash
   cd medvault-backend
   # Create application.properties from template
   cp src/main/resources/application.properties.template src/main/resources/application.properties
   # Update database credentials
   ```

3. Run the application
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Install dependencies
   ```bash
   cd medvault-frontend
   npm install
   ```

2. Start development server
   ```bash
   npm run dev
   ```

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Encrypted data transmission
- Secure file storage
- Session management
- Password hashing
- Request rate limiting

## 📁 Project Structure

```plaintext
medvault-healthcare/
├── medvault-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
└── medvault-frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   └── hooks/
    └── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Jaikumar R** - *Initial work* - [Jaikumar96](https://github.com/Jaikumar96)

## 📞 Support

For support, email medvault.support@example.com or join our Slack channel.

## 🙏 Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc