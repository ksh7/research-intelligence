# Durkheim Intelligence

A comprehensive web application for university departments to conduct social research by creating custom surveys and collecting public responses.

## Features

- **User Authentication**: Secure registration and login system for researchers
- **Research Project Management**: Create and organize research projects with full CRUD operations
- **Research Form Builder**: Integrated SurveyJS form builder with drag-and-drop interface
- **Response Collection**: Public form sharing and real-time response collection
- **Analytics Dashboard**: Interactive charts and data visualization with Chart.js
- **Responsive Design**: Mobile-first design optimized for all devices

## Technology Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL, MongoDB
- **Research Form Builder**: SurveyJS
- **State Management**: Zustand
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### 1. Clone and Install

```bash
git clone <repository-url>
cd research-intelligence
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Common Issues

**1. "Invalid API key" or connection errors**
- Verify your `.env` file has the correct URL and API key
- Make sure there are no extra spaces or quotes around the values
- Restart the development server after changing `.env`

**2. "Table doesn't exist" errors**
- Ensure you've run the database migration in SQL Editor
- Check that all tables were created in the Table Editor
- Verify the migration completed without errors

**3. Authentication not working**
- Check that the `users` table was created properly
- Verify RLS policies are enabled on all tables
- Try registering a new user to test the flow

**4. Environment variables not loading**
- Make sure your `.env` file is in the project root (same level as `package.json`)
- Restart the development server after adding/changing environment variables
- Ensure variable names start with `VITE_` for Vite to include them


## License

This project is licensed under the MIT License.