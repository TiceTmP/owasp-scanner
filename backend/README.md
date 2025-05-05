# 🔐 Sign in with OAuth

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A demonstration project showcasing OAuth authentication implementation with various platforms using NestJS framework.
Perfect for learning and implementing social login in your applications.

## ✨ Features

- 🔑 **Multiple OAuth Providers**:
    - ![Google](https://img.shields.io/badge/Google-4285F4?style=flat&logo=google&logoColor=white) Google OAuth Sign In
    - ![LINE](https://img.shields.io/badge/LINE-00C300?style=flat&logo=line&logoColor=white) LINE Login
    - ![Microsoft](https://img.shields.io/badge/Microsoft-5E5E5E?style=flat&logo=microsoft&logoColor=white) Microsoft
      Authentication
- 🔒 Secure Session Management
- 📝 TypeScript Support
- 🚀 Easy to Set Up and Run

## 📋 Prerequisites

- Node.js v20 or higher
- npm
- NestJS CLI

## 🛠️ Installation

1. Clone the repository

```bash
git clone https://github.com/TiceTmP/sign-in-with-o-auth.git
cd sign-in-with-o-auth
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` file in the root directory and add your credentials:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# LINE Login Credentials
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=

# Microsoft Azure Credentials
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=

# Session Secret
SESSION_SECRET=your_session_secret
```

## 🔑 Getting OAuth Credentials

### <img src="https://www.google.com/favicon.ico" width="16"/> Google OAuth

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth client ID
5. Set up OAuth consent screen
6. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
7. Copy the Client ID and Client Secret

### <img src="https://line.me/favicon.ico" width="16"/> LINE Login

1. Visit [LINE Developers Console](https://developers.line.biz/console/)
2. Create a new provider (if needed)
3. Create a new channel (LINE Login)
4. Add callback URL: `http://localhost:3000/auth/line/callback`
5. Enable Email address permission in OpenID Connect
6. Copy the Channel ID and Channel Secret

### <img src="https://www.microsoft.com/favicon.ico" width="16"/> Microsoft Authentication

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory > App registrations
3. Create a new registration
4. Set redirect URI (Web): `http://localhost:3000/auth/microsoft/callback`
5. Under "Authentication":
    - Set "Supported account types" to "Accounts in any organizational directory and personal Microsoft accounts"
    - Enable "Access tokens" and "ID tokens" under "Implicit grant"
6. Copy the Application (client) ID
7. Create a new client secret under "Certificates & secrets"

## 🚀 Running the Application

1. Start the development server:

```bash
npm run start:dev
```

2. Visit these URLs to test authentication:

- 🔵 Google: `http://localhost:3000/auth/google`
- 💚 LINE: `http://localhost:3000/auth/line`
- 🔷 Microsoft: `http://localhost:3000/auth/microsoft`

## 📁 Project Structure

```
src/
├── auth/
│   ├── google.strategy.ts   # Google authentication strategy
│   ├── line.strategy.ts     # LINE authentication strategy
│   ├── microsoft.strategy.ts # Microsoft authentication strategy
│   ├── auth.controller.ts   # Authentication routes
│   ├── auth.service.ts      # Authentication business logic
│   └── auth.module.ts       # Authentication module configuration
├── app.module.ts            # Main application module
└── main.ts                  # Application entry point
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---
Made with ❤️ using NestJS