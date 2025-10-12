import { Router } from 'express';
import { getHomePage, seedHomePage } from '../controllers/homeController';

const router = Router();

// Public route to get home page data
router.get('/', getHomePage);

// (Optional) Seed home page data (should be protected or removed in production)
router.post('/seed', seedHomePage);

export default router;
