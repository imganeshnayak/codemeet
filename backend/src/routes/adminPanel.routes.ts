import { Router } from 'express';
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAllAdmins,
  updateAdminStatus,
  deleteAdmin
} from '../controllers/adminAuthController';
import {
  getDashboardMetrics,
  getIssueTrends,
  getGeographicDistribution,
  getAdminPerformance,
  getRecentActivity
} from '../controllers/adminDashboardController';
import {
  listIssues,
  getIssueDetail,
  updateIssueStatus,
  assignIssue,
  updateIssuePriority,
  addAdminNote,
  rejectIssue,
  uploadAfterPhotos,
  bulkUpdateStatus,
  bulkAssignIssues,
  getIssuesStats,
  deleteIssue
} from '../controllers/adminIssueController';
import { authenticateAdmin } from '../middleware/adminAuth.middleware';
import {
  requireSuperAdmin,
  requireAdminOrAbove,
  requireAnyAdmin
} from '../middleware/roleCheck.middleware';

const router = Router();

// ============================================
// AUTHENTICATION ROUTES (No auth required)
// ============================================
router.post('/auth/login', loginAdmin);

// ============================================
// ADMIN PROFILE ROUTES (Auth required)
// ============================================
router.get('/auth/profile', authenticateAdmin, getAdminProfile);
router.put('/auth/profile', authenticateAdmin, updateAdminProfile);
router.put('/auth/change-password', authenticateAdmin, changeAdminPassword);

// ============================================
// ADMIN MANAGEMENT ROUTES (Super Admin only)
// ============================================
router.post('/auth/register', authenticateAdmin, requireSuperAdmin, registerAdmin);
router.get('/admins', authenticateAdmin, requireSuperAdmin, getAllAdmins);
router.put('/admins/:id/status', authenticateAdmin, requireSuperAdmin, updateAdminStatus);
router.delete('/admins/:id', authenticateAdmin, requireSuperAdmin, deleteAdmin);

// ============================================
// DASHBOARD ROUTES (All admins)
// ============================================
router.get('/dashboard/metrics', authenticateAdmin, requireAnyAdmin, getDashboardMetrics);
router.get('/dashboard/trends', authenticateAdmin, requireAnyAdmin, getIssueTrends);
router.get('/dashboard/geographic', authenticateAdmin, requireAnyAdmin, getGeographicDistribution);
router.get('/dashboard/performance', authenticateAdmin, requireAdminOrAbove, getAdminPerformance);
router.get('/dashboard/activity', authenticateAdmin, requireAnyAdmin, getRecentActivity);

// ============================================
// ISSUE MANAGEMENT ROUTES
// ============================================

// List and stats (All admins)
router.get('/issues', authenticateAdmin, requireAnyAdmin, listIssues);
router.get('/issues/stats', authenticateAdmin, requireAnyAdmin, getIssuesStats);

// Single issue operations (All admins)
router.get('/issues/:id', authenticateAdmin, requireAnyAdmin, getIssueDetail);
router.put('/issues/:id/status', authenticateAdmin, requireAnyAdmin, updateIssueStatus);
router.post('/issues/:id/notes', authenticateAdmin, requireAnyAdmin, addAdminNote);

// Assignment and priority (Admin and above)
router.put('/issues/:id/assign', authenticateAdmin, requireAdminOrAbove, assignIssue);
router.put('/issues/:id/priority', authenticateAdmin, requireAdminOrAbove, updateIssuePriority);

// Rejection and photos (Admin and above)
router.put('/issues/:id/reject', authenticateAdmin, requireAdminOrAbove, rejectIssue);
router.post('/issues/:id/photos', authenticateAdmin, requireAdminOrAbove, uploadAfterPhotos);

// Bulk operations (Admin and above)
router.post('/issues/bulk/status', authenticateAdmin, requireAdminOrAbove, bulkUpdateStatus);
router.post('/issues/bulk/assign', authenticateAdmin, requireAdminOrAbove, bulkAssignIssues);

// Delete (Admin and above, but super-admin for permanent delete)
router.delete('/issues/:id', authenticateAdmin, requireAdminOrAbove, deleteIssue);

export default router;
