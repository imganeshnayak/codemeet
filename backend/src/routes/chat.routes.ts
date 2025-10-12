import { Router } from 'express';
import { sendMessage, getChatHistory, clearChatHistory, healthCheck } from '../controllers/chatController';

const router = Router();

// Public routes (support anonymous chat)
router.post('/', sendMessage);
router.get('/history/:sessionId', getChatHistory);
router.delete('/history/:sessionId', clearChatHistory);
router.get('/health', healthCheck);

export default router;
