# Cloud Contact Book

A cloud-based contact manager built with React, Vite, and Firebase. Users can sign up or log in, add contacts, mark favorites, soft-delete contacts, and restore deleted contacts from a recycle bin. Contact data is synced in real time with Cloud Firestore.

## Features

- Email/password authentication with Firebase Authentication
- Real-time contact list powered by Cloud Firestore
- Add contacts with name and phone number
- Mark contacts as favorites
- Soft delete contacts instead of removing them permanently
- Restore deleted contacts from the recycle bin
- Temporary in-app notifications for contact actions
- Responsive contact grid for desktop and mobile screens

## Tech Stack

- React 19
- Vite / Rolldown Vite
- Firebase Authentication
- Cloud Firestore
- React Router DOM
- ESLint

## Project Structure

```text
cloud-contact-book/
|-- public/
|-- src/
|   |-- App.jsx
|   |-- firebase.js
|   |-- main.jsx
|   |-- auth/
|   |-- components/
|   |-- pages/
|   `-- styles/
|-- index.html
|-- package.json
`-- vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- A Firebase project with Authentication and Firestore enabled

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/cloud-contact-book.git
cd cloud-contact-book
```

2. Install dependencies:

```bash
npm install
```

3. Configure Firebase:

Create a Firebase project, enable Email/Password sign-in, create a Firestore database, and add your Firebase web app configuration in `src/firebase.js`.

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

4. Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually `http://localhost:5173`.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the app for production.

```bash
npm run preview
```

Serves the production build locally.

```bash
npm run lint
```

Runs ESLint across the project.

## Firestore Data Model

Contacts are stored in the `contacts` collection. Each contact document includes:

```js
{
  name: "Contact Name",
  phone: "Phone Number",
  deleted: false,
  favorite: false,
  userId: "firebase-user-id"
}
```

## Firestore Rules

For production, add Firestore security rules so users can only read and write their own contacts. Example starting point:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /contacts/{contactId} {
      allow read, create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;

      allow update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Build for Deployment

Create a production build:

```bash
npm run build
```

The generated files will be in the `dist` folder. You can deploy this folder to Firebase Hosting, Vercel, Netlify, GitHub Pages, or any static hosting provider.

## Notes

- The current app reads contacts in real time from Firestore.
- Deleting a contact marks it as deleted, so it can be restored later.
- Firebase web configuration values identify your Firebase app. They should still be paired with proper Firestore security rules before deployment.

## License

This project is available for personal and educational use. Add a license file if you plan to publish it as open source.
