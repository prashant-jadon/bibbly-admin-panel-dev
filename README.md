# bibbly Admin Panel

Complete admin panel for managing the bibbly Dating App backend.

## Features

- 📊 **Dashboard** - Overview of users, revenue, and app status
- 👥 **User Management** - View, search, update user status, grant/revoke premium
- 💎 **Premium Management** - Toggle premium mode, manage features and plans
- 💰 **Micro-payments** - Configure request packs and pricing
- 🚩 **Feature Flags** - Enable/disable app features
- ⚙️ **App Limits** - Configure app limits and moderation settings
- 🔧 **Settings** - App configuration and maintenance mode

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running on `http://localhost:5001`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Login

1. Make sure you have an admin user in the backend database
2. Login with admin credentials at `/login`
3. User must have `role: 'admin'` in the database

## Project Structure

```
adminpanel/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── users/             # User management
│   ├── premium/           # Premium management
│   ├── micropayments/     # Micro-payment settings
│   ├── features/          # Feature flags
│   ├── limits/            # App limits
│   ├── settings/          # App settings
│   └── login/             # Login page
├── components/            # React components
│   ├── Layout.tsx        # Main layout with sidebar
│   ├── ProtectedRoute.tsx # Auth protection
│   └── ui/               # UI components
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   ├── store.ts          # Zustand store
│   └── utils.ts          # Helper functions
└── package.json
```

## API Integration

All API calls are handled through `lib/api.ts` which:
- Automatically adds authentication tokens
- Handles errors and shows toast notifications
- Intercepts 401 errors and redirects to login

## Features

### Dashboard
- Real-time stats (users, conversations, revenue)
- App status overview
- Quick action links

### User Management
- Search and filter users
- View user details
- Update account status (active/suspended/deleted)
- Grant/revoke premium access
- View user stats and purchase history

### Premium Management
- Master toggle for premium mode
- Manage individual premium features
- Configure premium plans
- Set free and premium limits

### Micro-payments
- Enable/disable micro-payments
- Configure daily free limits
- Add/edit/delete request packs
- View revenue statistics

### Feature Flags
- Toggle app features on/off
- Google Auth, Anonymous Messaging, Search, etc.

### App Limits
- Configure max photos, bio length, message length
- Set moderation rules
- Auto-suspend thresholds

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```

## Building for Production

```bash
npm run build
npm start
```

## Notes

- All routes are protected and require admin authentication
- Token is stored in localStorage
- API errors are automatically handled and displayed
- Responsive design works on mobile and desktop

