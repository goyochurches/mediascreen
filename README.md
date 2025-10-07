# Media Management Platform

## Description

This is a media management platform that allows users to manage screens, playlists, and multimedia content such as images and videos. The application is built using **Next.js**, **Firebase**, and **Tailwind CSS**.

## Features

- **Screen Management**: Create, edit, and assign playlists to specific screens.
- **Playlist Management**: Create and organize playlists with multimedia content.
- **Content Management**: Upload and manage images and videos.
- **Authentication**: Secure login using Firebase Authentication.
- **Real-Time Database**: Store and sync data using Firestore.

## Technologies Used

- **Next.js**: React framework for web applications.
- **Firebase**: Backend-as-a-service for authentication, database, and storage.
- **Tailwind CSS**: CSS framework for responsive and modern design.
- **React Hook Form**: Form handling with validation.
- **Zod**: Data schema validation.

## Installation

1. Clone this repository:
   ```bash
   git clone <REPOSITORY_URL>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root of the project and configure the required environment variables:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
media/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── screens/
│   │   │   ├── playlists/
│   │   │   ├── content/
│   │   ├── login/
│   │   ├── display/
│   ├── components/
│   │   ├── ui/
│   │   ├── media-viewer.tsx
│   ├── firebase/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
├── public/
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the server in production mode.

## Contribution

1. Fork the repository.
2. Create a branch for your feature:
   ```bash
   git checkout -b feature/new-feature
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add new feature"
   ```
4. Push your changes:
   ```bash
   git push origin feature/new-feature
   ```
5. Open a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
