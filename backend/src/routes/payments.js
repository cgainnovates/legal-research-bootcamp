import { Router } from "express";
import {
  getPricing,
  handleWebhook,
  initializePayment,
  verifyPayment,
} from "../controllers/payments.js";

const router = Router();

router.get("/pricing", getPricing);
router.post("/initialize", initializePayment);
router.get("/verify/:reference", verifyPayment);
router.post("/webhook", handleWebhook);

export default router;
