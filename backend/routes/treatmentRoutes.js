import express from 'express';
import { assignActivityToPatient, updateAssignmentResults, getAssignedActivities} from '../controllers/treatmentController.js';
import { protect, doctor } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, doctor, assignActivityToPatient);
router.route('/:assignmentId/results').put(protect, updateAssignmentResults);
router.route('/:patientId/activities').get(protect, getAssignedActivities);

export default router;
