import { Router } from "express";
import { seedIssues } from "../controllers/seedController";

const router = Router();

router.post("/issues", seedIssues);

export default router;
