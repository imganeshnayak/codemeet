# 🚀 Quick Start - Admin Dashboard

## Step-by-Step Setup (5 Minutes)

### 1️⃣ Create Super Admin
```powershell
cd backend
npm run create-admin
```

**Output:**
```
✅ Super admin created successfully!

📋 Login Credentials:
   Email: admin@civichub.com
   Password: admin123456

⚠️  IMPORTANT: Please change the password after first login!

🌐 Admin Portal: http://localhost:8080/admin/login
```

### 2️⃣ Start Backend Server
```powershell
# In backend folder
npm run dev
```

**Expected:** Server running on http://localhost:5000

### 3️⃣ Start Frontend Server
```powershell
# Open new terminal
cd frontend
npm run dev
```

**Expected:** App running on http://localhost:8080

### 4️⃣ Login to Admin Portal

1. Open browser: `http://localhost:8080/admin/login`
2. Enter email: `admin@civichub.com`
3. Enter password: `admin123456`
4. Click "Sign In"
5. ✅ You're now in the admin dashboard!

---

## 📱 What You Can Do

### Dashboard
- View total issues count
- See pending/in-progress/resolved stats
- Check resolution rate
- View 30-day trend charts

### Issues Management
- **List Issues**: Filter by status, category, priority
- **Search**: Find specific issues by keyword
- **View Details**: See full issue with photos and timeline
- **Update Status**: Change from pending → under-review → in-progress → resolved
- **Update Priority**: low, medium, high, urgent
- **Add Notes**: Public (visible to user) or private
- **Assign**: To admin or department
- **Reject**: With reason

---

## 🎯 Quick Actions

### Update an Issue Status
1. Go to "Issues" from sidebar
2. Click "View" on any issue
3. Select new status from dropdown
4. Click "Update Status"
5. ✅ Done!

### Add an Admin Note
1. Open any issue detail
2. Scroll to "Add Note" panel
3. Type your note
4. Check "Public" if user should see it
5. Click "Add Note"
6. ✅ Note added!

### Reject an Issue
1. Open issue detail
2. Scroll to "Reject Issue" panel
3. Enter rejection reason
4. Click "Reject Issue"
5. ✅ Issue rejected!

---

## 🔧 Troubleshooting

### Can't login?
- ✅ Check backend is running (http://localhost:5000)
- ✅ Verify super-admin was created
- ✅ Check credentials: admin@civichub.com / admin123456

### Dashboard not loading?
- ✅ Check MongoDB is connected
- ✅ Check browser console for errors
- ✅ Verify API URL in frontend/.env

### Charts not showing?
- ✅ Create some test issues first
- ✅ Check if data is in MongoDB
- ✅ Refresh the page

---

## 📚 Documentation

- **Setup Guide**: Read `ADMIN_SETUP.md`
- **Progress**: Check `ADMIN_PROGRESS.md`
- **Summary**: See `ADMIN_COMPLETE.md`

---

## 🎉 That's It!

You now have a fully functional admin dashboard! 

**Admin Portal**: http://localhost:8080/admin/login
**Credentials**: admin@civichub.com / admin123456

Happy managing! 🛡️
