import express from 'express';
import { assignActivityToPatient, updateAssignmentResults, getAssignedActivities,deleteAssignedActivity} from '../controllers/treatmentController.js';
import { protect,admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect,admin, assignActivityToPatient);
router.route('/:assignmentId/results').put(protect,admin, updateAssignmentResults);
router.route('/:patientId/activities').get(protect, getAssignedActivities);
router.route('/:assignmentId').delete(protect, admin, deleteAssignedActivity);


export default router;
