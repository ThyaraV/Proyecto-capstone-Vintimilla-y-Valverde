import express from "express";
const router = express.Router();
import { getDoctors } from "../controllers/doctorController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

router.route("/").get(protect, admin, getDoctors);

export default router;
