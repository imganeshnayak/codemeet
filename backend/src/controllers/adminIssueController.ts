import { Request, Response } from 'express';
import Issue from '../models/Issue';
import Admin from '../models/Admin';

// List issues with advanced filtering, sorting, and pagination
export const listIssues = async (req: Request, res: Response) => {
  try {
    const {
      status,
      category,
      priority,
      assignedTo,
      assignedDepartment,
      searchQuery,
      dateFrom,
      dateTo,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (assignedDepartment) filter.assignedDepartment = assignedDepartment;

    // Search in title and description
    if (searchQuery) {
      filter.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo as string);
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sort configuration
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email department')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalIssues = await Issue.countDocuments(filter);
    const totalPages = Math.ceil(totalIssues / limitNum);

    res.json({
      success: true,
      data: {
        issues,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalIssues,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues',
      error: error.message
    });
  }
};

// Get single issue detail with full information
export const getIssueDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id)
      .populate('reportedBy', 'name email phone address')
      .populate('assignedTo', 'name email department role')
      .populate('adminNotes.admin', 'name email')
      .populate('statusHistory.changedBy', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      data: issue
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issue detail',
      error: error.message
    });
  }
};

// Update issue status with history tracking
export const updateIssueStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const admin = (req as any).admin;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'under-review', 'in-progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Add to status history
    issue.statusHistory.push({
      status: issue.status,
      changedBy: admin._id,
      reason: comment || undefined,
      timestamp: new Date()
    });

    // Update current status
    issue.status = status;

    // Set resolution date if resolved
    if (status === 'resolved' && !issue.actualResolution) {
      issue.actualResolution = new Date();
    }

    await issue.save();

    // Populate for response
    await issue.populate('assignedTo', 'name email department');
    await issue.populate('statusHistory.changedBy', 'name email');

    res.json({
      success: true,
      message: 'Issue status updated successfully',
      data: issue
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update issue status',
      error: error.message
    });
  }
};

// Assign issue to admin
export const assignIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo, assignedDepartment, estimatedResolution } = req.body;
    const admin = (req as any).admin;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Verify assigned admin exists
    if (assignedTo) {
      const assignedAdmin = await Admin.findById(assignedTo);
      if (!assignedAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Assigned admin not found'
        });
      }
      issue.assignedTo = assignedTo;
    }

    if (assignedDepartment) {
      issue.assignedDepartment = assignedDepartment;
    }

    if (estimatedResolution) {
      issue.estimatedResolution = new Date(estimatedResolution);
    }

    // Add to status history
    issue.statusHistory.push({
      status: issue.status,
      changedBy: admin._id,
      reason: `Assigned to ${assignedDepartment || 'admin'}`,
      timestamp: new Date()
    });

    // Update status to under-review if still pending
    if (issue.status === 'pending') {
      issue.status = 'under-review';
    }

    await issue.save();

    // Populate for response
    await issue.populate('assignedTo', 'name email department');

    res.json({
      success: true,
      message: 'Issue assigned successfully',
      data: issue
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign issue',
      error: error.message
    });
  }
};

// Update issue priority
export const updateIssuePriority = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    const admin = (req as any).admin;

    if (!priority) {
      return res.status(400).json({
        success: false,
        message: 'Priority is required'
      });
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority value'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const oldPriority = issue.priority;
    issue.priority = priority;

    // Add to status history
    issue.statusHistory.push({
      status: issue.status,
      changedBy: admin._id,
      reason: `Priority changed from ${oldPriority} to ${priority}`,
      timestamp: new Date()
    });

    await issue.save();

    res.json({
      success: true,
      message: 'Issue priority updated successfully',
      data: issue
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update issue priority',
      error: error.message
    });
  }
};

// Add admin note to issue
export const addAdminNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { note, isPublic = false } = req.body;
    const admin = (req as any).admin;

    if (!note || note.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Add note
    issue.adminNotes.push({
      admin: admin._id,
      note: note.trim(),
      isPublic,
      timestamp: new Date()
    });

    await issue.save();

    // Populate for response
    await issue.populate('adminNotes.admin', 'name email');

    res.json({
      success: true,
      message: 'Admin note added successfully',
      data: issue
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to add admin note',
      error: error.message
    });
  }
};

// Add rejection reason
export const rejectIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const admin = (req as any).admin;

    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Update status and add rejection reason
    issue.status = 'rejected';
    issue.rejectionReason = rejectionReason.trim();

    // Add to status history
    issue.statusHistory.push({
      status: 'rejected',
      changedBy: admin._id,
      reason: rejectionReason.trim(),
      timestamp: new Date()
    });

    await issue.save();

    // Populate for response
    await issue.populate('assignedTo', 'name email department');

    res.json({
      success: true,
      message: 'Issue rejected successfully',
      data: issue
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject issue',
      error: error.message
    });
  }
};

// Upload after photos (for resolved issues)
export const uploadAfterPhotos = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { photoUrls } = req.body;

    if (!photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one photo URL is required'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Add after photos
    issue.afterPhotos = [...(issue.afterPhotos || []), ...photoUrls];

    await issue.save();

    res.json({
      success: true,
      message: 'After photos uploaded successfully',
      data: issue
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload after photos',
      error: error.message
    });
  }
};

// Bulk update status
export const bulkUpdateStatus = async (req: Request, res: Response) => {
  try {
    const { issueIds, status, comment } = req.body;
    const admin = (req as any).admin;

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Issue IDs array is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'under-review', 'in-progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    // Update all issues
    const updatePromises = issueIds.map(async (issueId) => {
      const issue = await Issue.findById(issueId);
      if (issue) {
        issue.statusHistory.push({
          status: issue.status,
          changedBy: admin._id,
          reason: comment || 'Bulk status update',
          timestamp: new Date()
        });
        issue.status = status;
        
        if (status === 'resolved' && !issue.actualResolution) {
          issue.actualResolution = new Date();
        }
        
        await issue.save();
        return true;
      }
      return false;
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r).length;

    res.json({
      success: true,
      message: `${successCount} issues updated successfully`,
      data: {
        totalRequested: issueIds.length,
        successfulUpdates: successCount
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk update',
      error: error.message
    });
  }
};

// Bulk assign issues
export const bulkAssignIssues = async (req: Request, res: Response) => {
  try {
    const { issueIds, assignedTo, assignedDepartment } = req.body;
    const admin = (req as any).admin;

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Issue IDs array is required'
      });
    }

    if (!assignedTo && !assignedDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Either assignedTo or assignedDepartment is required'
      });
    }

    // Verify assigned admin exists
    if (assignedTo) {
      const assignedAdmin = await Admin.findById(assignedTo);
      if (!assignedAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Assigned admin not found'
        });
      }
    }

    // Update all issues
    const updatePromises = issueIds.map(async (issueId) => {
      const issue = await Issue.findById(issueId);
      if (issue) {
        if (assignedTo) issue.assignedTo = assignedTo;
        if (assignedDepartment) issue.assignedDepartment = assignedDepartment;

        issue.statusHistory.push({
          status: issue.status,
          changedBy: admin._id,
          reason: 'Bulk assignment',
          timestamp: new Date()
        });

        if (issue.status === 'pending') {
          issue.status = 'under-review';
        }

        await issue.save();
        return true;
      }
      return false;
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter(r => r).length;

    res.json({
      success: true,
      message: `${successCount} issues assigned successfully`,
      data: {
        totalRequested: issueIds.length,
        successfulAssignments: successCount
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk assignment',
      error: error.message
    });
  }
};

// Get issues statistics by status, category, priority
export const getIssuesStats = async (req: Request, res: Response) => {
  try {
    const { assignedTo } = req.query;

    const matchStage: any = {};
    if (assignedTo) {
      matchStage.assignedTo = assignedTo;
    }

    const stats = await Issue.aggregate([
      { $match: matchStage },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats[0].byStatus,
        byCategory: stats[0].byCategory,
        byPriority: stats[0].byPriority,
        total: stats[0].total[0]?.count || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues statistics',
      error: error.message
    });
  }
};

// Delete issue (soft delete or hard delete based on role)
export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const admin = (req as any).admin;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Only super-admin can permanently delete
    if (admin.role === 'super-admin') {
      await Issue.findByIdAndDelete(id);
      res.json({
        success: true,
        message: 'Issue permanently deleted'
      });
    } else {
      // Others can only mark as deleted or change status
      issue.status = 'rejected';
      issue.rejectionReason = 'Deleted by admin';
      await issue.save();
      
      res.json({
        success: true,
        message: 'Issue marked as rejected'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete issue',
      error: error.message
    });
  }
};
