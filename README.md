# OWASP API Scanner

![OWASP](https://img.shields.io/badge/OWASP-API%20Security-blue)
![NestJS](https://img.shields.io/badge/NestJS-11.0-red)
![Nuxt](https://img.shields.io/badge/Nuxt-3.16-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

A comprehensive security scanning tool for APIs, following the OWASP API Security Top 10 guidelines. This application helps identify vulnerabilities in your APIs by analyzing Swagger/OpenAPI specifications and performing active security scans.

## 🔍 Features

- **API Vulnerability Scanning**: Detects security vulnerabilities based on OWASP Top 10 for APIs
- **OpenAPI/Swagger Integration**: Import API definitions directly from Swagger/OpenAPI JSON URLs
- **Comprehensive Reporting**: Detailed vulnerability reports with risk levels, descriptions, and remediation guidance
- **Dashboard View**: Visual representation of scan statistics and vulnerabilities
- **PDF Report Generation**: Export scan results to PDF format
- **Modern UI**: Clean, responsive interface built with Nuxt 3 and Tailwind CSS

## 🏗️ Architecture

The application consists of several components:

- **Frontend**: Nuxt.js 3 application with Tailwind CSS for styling
- **Backend**: NestJS API with TypeORM for database access
- **ZAP Engine**: OWASP Zed Attack Proxy for security scanning
- **Database**: PostgreSQL for data storage
- **Example API**: A vulnerable example API for testing purposes

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (20.x or later)
- Yarn 1.22.x (for frontend)
- npm (for backend)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/owasp-api-scanner.git
cd owasp-api-scanner
```

2. Start the application using Docker Compose:

```bash
docker-compose up -d
```

3. Access the application:
    - Frontend: http://localhost:8080
    - Backend API: http://localhost:3000
    - Example API (for testing): http://localhost:3030
    - ZAP API: http://localhost:9000

## 📚 Usage

1. **Login**: Use the credentials admin/password for demo purposes
2. **Start a New Scan**: Navigate to the "New Scan" page and enter your API's Swagger/OpenAPI JSON URL
3. **View Results**: Once the scan is complete, review the detected vulnerabilities and their details
4. **Download Report**: Generate a PDF report of the scan findings

## 🔧 Development

### Frontend

```bash
cd frontend
yarn install
yarn dev
```

Note: This project uses Yarn 1.22 for the frontend package management.

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Environment Variables

Configure the application using the following environment variables:

**Backend**:
- `DB_HOST`: PostgreSQL database host
- `DB_PORT`: PostgreSQL database port
- `DB_USERNAME`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- `DB_NAME`: PostgreSQL database name
- `ZAP_API_URL`: URL for ZAP API
- `ZAP_API_KEY`: API key for ZAP

**Frontend**:
- `API_BASE_URL`: Backend API URL

## 🔒 Security Considerations

This application is designed for security testing purposes. Please consider:

- Running scans only against APIs you own or have permission to test
- Using secure credentials in production environments
- Following responsible disclosure practices for any vulnerabilities found

## 📋 API Scanning Process

1. Import API definition from Swagger/OpenAPI JSON
2. Parse API endpoints and parameters
3. Execute active scans using ZAP Engine
4. Analyze responses for security vulnerabilities
5. Generate comprehensive reports

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [OWASP](https://owasp.org/) for security guidelines and ZAP
- [NestJS](https://nestjs.com/) for the backend framework
- [Nuxt.js](https://nuxt.com/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [TypeScript](https://www.typescriptlang.org/) for type-safe code