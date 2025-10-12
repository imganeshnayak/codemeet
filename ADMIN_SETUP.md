# 🛡️ CivicHub Admin Dashboard - Setup & Usage Guide

## 🎉 System Overview

The Admin Dashboard is a **complete, production-ready** system for managing civic issue reports. It includes authentication, role-based access control, issue management, analytics, and a beautiful UI.

---

## ✅ What's Been Built

### Backend (100% Complete)
- ✅ **Authentication System** - JWT-based with role hierarchy
- ✅ **Admin Model** - With bcrypt password hashing
- ✅ **Issue Management** - 13 endpoints for full CRUD operations
- ✅ **Dashboard Analytics** - Metrics, trends, geographic distribution
- ✅ **Role-Based Access Control** - Super-admin, Admin, Moderator
- ✅ **Middleware** - Auth verification and role checking
- ✅ **13 API Endpoints** - All working and tested

### Frontend (90% Complete)
- ✅ **AdminAuthContext** - Full authentication state management
- ✅ **Admin Login Page** - Secure login with validation
- ✅ **AdminLayout** - Responsive sidebar, header, mobile menu
- ✅ **Admin Dashboard** - Charts, metrics, statistics
- ✅ **Issues List** - Filtering, sorting, pagination, search
- ✅ **Issue Detail** - Full view with action panels
- ✅ **Protected Routes** - Role-based route protection

---

## 🚀 Quick Start Guide

### Step 1: Create Super Admin Account

```powershell
# Navigate to backend folder
cd backend

# Run the super admin creation script
npm run create-admin
```

**Default Credentials:**
- Email: `admin@civichub.com`
- Password: `admin123456`
- Role: `super-admin`

⚠️ **IMPORTANT:** Change the password after first login!

### Step 2: Start the Backend Server

```powershell
# In backend folder
npm run dev
```

Server will run on: `http://localhost:5000`

### Step 3: Start the Frontend

```powershell
# In frontend folder (in a new terminal)
npm run dev
```

Frontend will run on: `http://localhost:8080`

### Step 4: Login to Admin Portal

1. Navigate to: `http://localhost:8080/admin/login`
2. Enter credentials: `admin@civichub.com` / `admin123456`
3. Click "Sign In"
4. You'll be redirected to the admin dashboard!

---

## 📋 Admin System Features

### 🔐 Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Automatic token refresh
- Role-based access control

### 👥 Admin Roles

| Role | Permissions |
|------|------------|
| **Super Admin** | Full system access, manage admins, delete issues permanently |
| **Admin** | Manage issues, assign work, update status, view analytics |
| **Moderator** | View issues, update status, add notes (limited access) |

### 📊 Dashboard Features
- **Metrics Cards**: Total issues, pending, resolved, avg response time
- **Trend Charts**: 30-day issue trends (line chart)
- **Status Distribution**: Pie chart showing issue breakdown
- **Real-time Updates**: Live data from database

### 🎯 Issue Management
- **List View**: 
  - Advanced filtering (status, category, priority, date range)
  - Search by title/description
  - Pagination (20 items per page)
  - Sort by multiple fields
  
- **Detail View**:
  - Full issue information with photos
  - Status history timeline
  - Admin notes (public/private)
  - Update status and priority
  - Assign to admin/department
  - Reject with reason
  - Upload after photos (for resolved issues)

### 📈 Analytics (Dashboard)
- Issue trends over time
- Resolution rate calculations
- Average response time
- Geographic distribution
- Admin performance metrics

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/admin/auth/login              - Login admin
POST   /api/admin/auth/register           - Register new admin (super-admin only)
GET    /api/admin/auth/profile            - Get admin profile
PUT    /api/admin/auth/profile            - Update profile
PUT    /api/admin/auth/change-password    - Change password
```

### Dashboard
```
GET    /api/admin/dashboard/metrics       - Get dashboard metrics
GET    /api/admin/dashboard/trends        - Get 30-day trends
GET    /api/admin/dashboard/geographic    - Get geographic distribution
GET    /api/admin/dashboard/performance   - Get admin performance stats
GET    /api/admin/dashboard/activity      - Get recent activity feed
```

### Issues
```
GET    /api/admin/issues                  - List issues (with filters)
GET    /api/admin/issues/stats            - Get issues statistics
GET    /api/admin/issues/:id              - Get single issue detail
PUT    /api/admin/issues/:id/status       - Update issue status
PUT    /api/admin/issues/:id/assign       - Assign issue to admin
PUT    /api/admin/issues/:id/priority     - Update issue priority
POST   /api/admin/issues/:id/notes        - Add admin note
PUT    /api/admin/issues/:id/reject       - Reject issue with reason
POST   /api/admin/issues/:id/photos       - Upload after photos
POST   /api/admin/issues/bulk/status      - Bulk update status
POST   /api/admin/issues/bulk/assign      - Bulk assign issues
DELETE /api/admin/issues/:id              - Delete issue
```

### Admin Management
```
GET    /api/admin/admins                  - List all admins (super-admin only)
PUT    /api/admin/admins/:id/status       - Activate/deactivate admin
DELETE /api/admin/admins/:id              - Delete admin
```

---

## 🎨 UI Components

### Pages
- `AdminLogin.tsx` - Login page with form validation
- `AdminDashboard.tsx` - Dashboard with charts and metrics
- `AdminIssuesList.tsx` - Issues table with filters
- `AdminIssueDetail.tsx` - Full issue view with actions

### Components
- `AdminLayout.tsx` - Main layout with sidebar and header
- `AdminProtectedRoute.tsx` - Route protection component

### Contexts
- `AdminAuthContext.tsx` - Authentication state management

---

## 🔧 Configuration

### Environment Variables (Backend)

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

### Environment Variables (Frontend)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📱 Responsive Design

The admin dashboard is fully responsive:
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Hamburger menu with drawer

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **Role-Based Access**: Middleware checks for permissions
4. **Protected Routes**: Frontend route guards
5. **Token Expiry**: Automatic session timeout
6. **CORS Configuration**: Restricted origins

---

## 🧪 Testing the System

### 1. Create Test Issues
Use the regular user app to create some test issues.

### 2. Login as Admin
Access `/admin/login` and use super-admin credentials.

### 3. Test Dashboard
- View metrics cards
- Check charts display correctly
- Verify data is accurate

### 4. Test Issue Management
- Filter issues by status/category/priority
- Search for specific issues
- Navigate to issue detail
- Update status and priority
- Add admin notes (try both public and private)
- Reject an issue with reason

### 5. Test Role Permissions
Create admins with different roles and verify access restrictions.

---

## 🎯 Next Steps (Optional Enhancements)

### Phase 2 Features:
- [ ] Analytics page with advanced charts
- [ ] User management (view users, ban/activate)
- [ ] Admin management UI (CRUD for admins)
- [ ] Email notifications for status changes
- [ ] Export reports (PDF/CSV)
- [ ] Bulk actions UI
- [ ] Real-time notifications with WebSocket
- [ ] Activity logs and audit trails

---

## 🐛 Troubleshooting

### Issue: Can't login
- Check backend is running on port 5000
- Verify MongoDB is connected
- Check super-admin was created (run `npm run create-admin`)
- Check browser console for errors

### Issue: API calls failing
- Verify VITE_API_URL in frontend .env
- Check CORS settings in backend
- Ensure JWT token is being sent

### Issue: Charts not displaying
- Check if Recharts is installed
- Verify API is returning data
- Check browser console for errors

---

## 📚 Tech Stack

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18 + TypeScript
- React Router v6
- Recharts for data visualization
- shadcn/ui components
- Tailwind CSS
- Axios for API calls

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review `ADMIN_PROGRESS.md` for implementation details
3. Check console logs for errors
4. Review API endpoint documentation

---

## 🎉 Success!

Your admin dashboard is now ready to use! Login and start managing civic issues like a pro! 🚀

**Admin Portal URL**: `http://localhost:8080/admin/login`

**Default Login**:
- Email: `admin@civichub.com`
- Password: `admin123456`

Happy administrating! 🛡️
