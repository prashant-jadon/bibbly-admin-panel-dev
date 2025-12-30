# bibbly Admin Panel - Complete Guide

## 🎯 Overview

A comprehensive Next.js admin panel for managing the bibbly Dating App backend. Built with modern technologies and a clean, intuitive interface.

## ✨ Features

### 1. Dashboard
- **Real-time Statistics**
  - Total users, active users, new users
  - Total conversations and requests
  - Premium users count
  - Revenue overview
- **App Status**
  - Maintenance mode indicator
  - Premium mode status
  - App version
- **Quick Actions**
  - Direct links to all management sections

### 2. User Management
- **User List**
  - Search by email, username
  - Filter by status (active/suspended/deleted)
  - Filter by premium status
  - Pagination support
- **User Details**
  - Complete user profile
  - Activity statistics
  - Purchase history
  - Recent activity
- **User Actions**
  - Update account status
  - Grant/revoke premium
  - View detailed stats

### 3. Premium Management
- **Master Switch**
  - Enable/disable all premium features
  - App-wide premium toggle
- **Feature Management**
  - List all premium features
  - Toggle individual features
  - Edit feature details:
    - Name and description
    - Free limit
    - Premium limit
- **Plan Management**
  - View all premium plans
  - Edit plan details:
    - Name and pricing
    - Duration
    - Active status

### 4. Micro-payments
- **Settings**
  - Enable/disable micro-payments
  - Configure daily free limits:
    - Free requests per day
    - Free discovery profiles
    - Free reveals
- **Request Packs**
  - Add new packs
  - Edit existing packs:
    - Pack name
    - Request count
    - Price
    - Active status
  - Delete packs
- **Revenue Stats**
  - Total purchases
  - Total revenue

### 5. Feature Flags
- Toggle app features on/off:
  - Google Authentication
  - Anonymous Messaging
  - Identity Reveal
  - User Search
  - Discovery Feed
  - Push Notifications
  - Profile Sharing

### 6. App Limits
- **Content Limits**
  - Max photos per profile
  - Max bio length
  - Max message length
  - Max interests
  - Request expiry days
- **Moderation**
  - Auto-suspend report count
  - AI moderation toggle

### 7. Settings
- App name and version
- Maintenance mode
- Maintenance message

## 🚀 Getting Started

### Installation

```bash
cd adminpanel
npm install
```

### Configuration

1. Copy environment file:
```bash
cp env.local.example .env.local
```

2. Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:3000

### Creating Admin User

You need to set a user's role to "admin" in the database:

**MongoDB Shell:**
```javascript
use bibbly_dating
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

**MongoDB Compass:**
1. Open Compass
2. Navigate to `bibbly_dating` → `users`
3. Find your user
4. Edit `role` field to `"admin"`

## 📁 Project Structure

```
adminpanel/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Dashboard page
│   ├── users/               # User management
│   │   └── [id]/           # User details
│   ├── premium/            # Premium management
│   ├── micropayments/      # Micro-payment settings
│   ├── features/           # Feature flags
│   ├── limits/             # App limits
│   ├── settings/           # App settings
│   ├── login/              # Login page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home (redirects)
│   └── providers.tsx       # React Query provider
├── components/
│   ├── Layout.tsx          # Main layout with sidebar
│   ├── ProtectedRoute.tsx  # Auth protection wrapper
│   └── ui/
│       └── Toggle.tsx      # Toggle switch component
├── lib/
│   ├── api.ts             # API client with interceptors
│   ├── store.ts           # Zustand auth store
│   └── utils.ts           # Helper functions
└── package.json
```

## 🔐 Authentication

- Uses JWT tokens stored in localStorage
- Automatic token injection in API requests
- Auto-redirect to login on 401 errors
- Protected routes check admin role

## 🎨 UI/UX Features

- **Responsive Design**
  - Mobile-friendly sidebar
  - Responsive tables and cards
  - Touch-friendly controls

- **Loading States**
  - Skeleton loaders
  - Spinner animations
  - Optimistic updates

- **Error Handling**
  - Toast notifications
  - Error messages
  - Retry mechanisms

- **User Feedback**
  - Success/error toasts
  - Form validation
  - Confirmation dialogs

## 📊 Data Management

- **React Query**
  - Automatic caching
  - Background refetching
  - Optimistic updates
  - Error retry logic

- **State Management**
  - Zustand for auth state
  - React Query for server state
  - Local state for forms

## 🔧 API Integration

All API calls go through `lib/api.ts` which:
- Adds authentication headers automatically
- Handles errors globally
- Shows toast notifications
- Redirects on 401 errors

### Example API Call

```typescript
const { data } = useQuery({
  queryKey: ['dashboard'],
  queryFn: () => adminApi.getDashboard(),
});
```

## 🎯 Key Pages

### Dashboard (`/dashboard`)
- Overview statistics
- Revenue information
- App status
- Quick actions

### Users (`/users`)
- User list with search/filter
- User details page
- Status management
- Premium management

### Premium (`/premium`)
- Master toggle
- Feature list with toggles
- Plan management

### Micro-payments (`/micropayments`)
- Settings configuration
- Pack management
- Revenue stats

### Features (`/features`)
- Feature flag toggles
- One-click enable/disable

### Limits (`/limits`)
- Content limits
- Moderation settings

### Settings (`/settings`)
- App configuration
- Maintenance mode

## 🛠️ Development

### Adding New Features

1. **Add API method** in `lib/api.ts`:
```typescript
newFeature: async (data: any) => {
  const response = await api.get('/admin/new-feature');
  return response.data;
}
```

2. **Create page** in `app/new-feature/page.tsx`:
```typescript
export default function NewFeaturePage() {
  return (
    <ProtectedRoute>
      <NewFeatureContent />
    </ProtectedRoute>
  );
}
```

3. **Use React Query** for data fetching:
```typescript
const { data } = useQuery({
  queryKey: ['new-feature'],
  queryFn: () => adminApi.newFeature(),
});
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Set on your hosting platform:
- `NEXT_PUBLIC_API_URL` - Production API URL

### Recommended Hosting

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Railway**
- **DigitalOcean App Platform**

## 📝 Notes

- All routes require admin authentication
- Token persists in localStorage
- API errors are handled automatically
- Responsive design works on all devices
- TypeScript for type safety
- Tailwind CSS for styling

## 🐛 Troubleshooting

### Login Issues
- Verify user has `role: "admin"` in database
- Check backend API is running
- Verify API URL in `.env.local`

### API Errors
- Check browser console
- Verify backend CORS settings
- Check network tab for requests

### Build Errors
- Delete `node_modules` and `.next`
- Run `npm install` again
- Check Node.js version (18+)

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Built with ❤️ for bibbly Dating App**

