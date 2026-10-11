import { Router } from "express";
import { getRatesQuoteHandler, syncRatesToS3Handler } from "../controllers/rates.controller";

const router = Router();

router.post("/quote", getRatesQuoteHandler);
router.post("/sync-s3", syncRatesToS3Handler);

export default router;
