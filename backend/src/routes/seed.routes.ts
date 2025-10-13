import { Router } from "express";
import { seedIssues, createAdmin } from "../controllers/seedController";

const router = Router();

router.post("/issues", seedIssues);
router.post("/admin", createAdmin);

export default router;
