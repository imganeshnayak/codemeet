# Profile Feature Documentation

## Overview
The Profile feature allows users to view and manage their personal information, notification preferences, and activity history. It includes statistics about their reported issues and community participation.

## Backend API Endpoints

### 1. Get Profile
```
GET /api/profile
```
**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "avatar": "https://...",
      "notifications": {
        "emailUpdates": true,
        "pushNotifications": true,
        "issueUpdates": true,
        "communityMessages": false
      },
      "createdAt": "2025-10-01T00:00:00.000Z"
    },
    "stats": {
      "totalIssues": 16,
      "totalCommunities": 3,
      "totalMessages": 45,
      "issuesByStatus": {
        "pending": 5,
        "in-progress": 3,
        "resolved": 8
      }
    }
  }
}
```

### 2. Update Profile
```
PATCH /api/profile
```
**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "avatar": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated user object
  }
}
```

### 3. Update Notification Settings
```
PATCH /api/profile/notifications
```
**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "emailUpdates": true,
  "pushNotifications": true,
  "issueUpdates": true,
  "communityMessages": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification settings updated successfully",
  "data": {
    // Updated user object
  }
}
```

### 4. Get Activity History
```
GET /api/profile/activity?limit=20
```
**Authentication:** Required (Bearer token)

**Query Parameters:**
- `limit` (optional): Number of activities to return (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "activity_id",
      "type": "issue",
      "title": "Reported pothole: Main Street Pothole",
      "date": "2025-10-10T10:30:00.000Z",
      "status": "in-progress"
    },
    {
      "id": "activity_id_2",
      "type": "comment",
      "title": "Commented in Downtown Residents",
      "date": "2025-10-09T15:45:00.000Z",
      "status": "completed"
    }
  ]
}
```

### 5. Update Avatar
```
PATCH /api/profile/avatar
```
**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=john"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "data": {
    // Updated user object
  }
}
```

## Frontend Implementation

### Profile Page Structure

1. **Profile Header**
   - User avatar with camera icon for updates
   - User name and email
   - Member badges (join date, issues count, communities count)
   - Logout button

2. **Issue Statistics Chart**
   - Pie chart showing issue distribution by status
   - Statistics cards for each status
   - Total issues summary card
   - Percentage breakdown

3. **Tabs**
   - **Personal Info Tab**
     - Editable fields: name, email, phone, address
     - Edit/Cancel toggle
     - Save button with loading state
   
   - **Settings Tab**
     - Appearance settings (dark mode toggle)
     - Notification preferences with real-time updates
     - Individual switches for each notification type
   
   - **Activity Tab**
     - Recent actions and interactions
     - Issue reports and community messages
     - Status badges
     - Date formatting

### Key Features

1. **Real-time Data Fetching**
   - Profile data loaded on component mount
   - Activity history fetched separately
   - Loading states for better UX

2. **Inline Editing**
   - Enable/disable edit mode
   - Form validation
   - Save changes with API integration

3. **Notification Management**
   - Toggle switches for each setting
   - Instant API updates
   - Optimistic UI updates with error rollback

4. **Statistics Visualization**
   - Recharts library for pie chart
   - Dynamic data based on user's issues
   - Color-coded categories
   - Responsive layout

## User Model Fields

```typescript
{
  name: string;
  email: string;
  password: string; // Hashed, never returned in responses
  avatar?: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  notifications: {
    emailUpdates: boolean;
    pushNotifications: boolean;
    issueUpdates: boolean;
    communityMessages: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Considerations

1. **Authentication Required**
   - All profile endpoints require valid JWT token
   - User can only access/modify their own profile

2. **Password Protection**
   - Password field excluded from all responses (`.select('-password')`)
   - Password changes require separate endpoint (future enhancement)

3. **Input Validation**
   - Name: minimum 2 characters
   - Email: valid email format (handled by User model)
   - Avatar: valid URL format
   - Notification settings: boolean values only

4. **Data Sanitization**
   - All string inputs trimmed
   - Optional fields handled gracefully

## Testing Checklist

### Backend Tests
- [ ] GET /api/profile returns user data and statistics
- [ ] PATCH /api/profile updates user information
- [ ] PATCH /api/profile/notifications updates settings
- [ ] GET /api/profile/activity returns recent activities
- [ ] PATCH /api/profile/avatar updates avatar URL
- [ ] Unauthorized requests return 401
- [ ] Invalid data returns proper validation errors

### Frontend Tests
- [ ] Profile page loads with user data
- [ ] Statistics chart displays correctly
- [ ] Edit mode enables/disables form fields
- [ ] Save profile updates data successfully
- [ ] Notification toggles update in real-time
- [ ] Activity list displays recent actions
- [ ] Loading states show during API calls
- [ ] Error messages display on failures
- [ ] Logout functionality works correctly

## Future Enhancements

1. **Profile Picture Upload**
   - File upload functionality
   - Image cropping/resizing
   - Cloud storage integration

2. **Password Management**
   - Change password endpoint
   - Password strength validation
   - Email verification for changes

3. **Privacy Settings**
   - Profile visibility controls
   - Data export functionality
   - Account deletion option

4. **Activity Filtering**
   - Filter by activity type
   - Date range selection
   - Search functionality

5. **Social Features**
   - Follow/unfollow users
   - Public profile pages
   - User reputation system

6. **Email Notifications**
   - Actual email sending integration
   - Email templates
   - Notification digest options

## API Response Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - User Not Found
- `500` - Server Error

## Dependencies

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `express-validator` - Input validation

### Frontend
- `react` - UI framework
- `framer-motion` - Animations
- `recharts` - Chart visualization
- `lucide-react` - Icons
- `@/components/ui` - shadcn/ui components
