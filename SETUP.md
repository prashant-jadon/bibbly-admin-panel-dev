# Admin Panel Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd adminpanel
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.local.example .env.local
   ```
   
   Edit `.env.local` and set your backend API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access Admin Panel**
   - Open http://localhost:3000
   - Login with admin credentials

## Creating an Admin User

Before you can login, you need to create an admin user in the backend:

### Option 1: Using MongoDB Shell
```javascript
use bibbly_dating
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### Option 2: Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `bibbly_dating` → `users`
4. Find your user document
5. Edit and set `role` field to `"admin"`

### Option 3: Create New Admin User
1. Sign up normally through the app
2. Then update the role in database to "admin"

## Features Overview

### Dashboard
- View total users, active users, conversations
- Revenue statistics
- App status overview
- Quick action links

### User Management
- Search and filter users
- View detailed user information
- Update user account status
- Grant/revoke premium access
- View user activity stats

### Premium Management
- **Master Switch**: Enable/disable all premium features
- **Features**: Manage individual premium features
  - Toggle features on/off
  - Set free and premium limits
  - Edit feature details
- **Plans**: Configure premium subscription plans
  - Monthly, Yearly, Lifetime plans
  - Edit pricing and duration

### Micro-payments
- Enable/disable micro-payments
- Configure daily free limits:
  - Free requests per day
  - Free discovery profiles per day
  - Free reveals per day
- **Request Packs**: Manage purchasable packs
  - Add new packs
  - Edit existing packs (price, count)
  - Delete packs
  - View revenue stats

### Feature Flags
Toggle app features:
- Google Authentication
- Anonymous Messaging
- Identity Reveal
- User Search
- Discovery Feed
- Push Notifications
- Profile Sharing

### App Limits
Configure:
- Max photos per profile
- Max bio length
- Max message length
- Request expiry days
- Max interests
- Moderation settings (auto-suspend threshold, AI moderation)

### Settings
- App name and version
- Maintenance mode toggle
- Maintenance message

## API Integration

The admin panel integrates with all backend admin APIs:

- `GET /admin/dashboard` - Dashboard stats
- `GET /admin/config` - App configuration
- `PUT /admin/premium/toggle` - Toggle premium mode
- `GET /admin/premium/features` - Get premium features
- `PUT /admin/premium/features/:id` - Update feature
- `GET /admin/micropayments` - Get micro-payment settings
- `PUT /admin/micropayments` - Update settings
- `POST /admin/micropayments/packs` - Add pack
- `PUT /admin/micropayments/packs/:id` - Update pack
- `DELETE /admin/micropayments/packs/:id` - Delete pack
- `GET /admin/users` - List users
- `GET /admin/users/:id` - User details
- `PUT /admin/users/:id/status` - Update status
- `PUT /admin/users/:id/premium` - Update premium
- And more...

## Troubleshooting

### Can't Login
- Ensure user has `role: "admin"` in database
- Check backend API is running
- Verify API URL in `.env.local`

### API Errors
- Check browser console for errors
- Verify backend is running on correct port
- Check CORS settings in backend
- Ensure admin token is being sent in requests

### Build Errors
- Run `npm install` again
- Delete `node_modules` and `.next` folders
- Run `npm install` and `npm run dev`

## Production Deployment

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Set environment variables** on your hosting platform:
   - `NEXT_PUBLIC_API_URL` - Your production API URL

3. **Start the server:**
   ```bash
   npm start
   ```

## Security Notes

- Admin panel requires admin role authentication
- Tokens are stored in localStorage
- All API calls include authentication headers
- 401 errors automatically redirect to login
- Protected routes check authentication on mount

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend API is accessible
3. Check network tab for API responses
4. Review backend logs

