import express from "express";
const router=express.Router();
import {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserByID,
    updateUser,
} from "../controllers/userController.js";
import {protect,admin} from '../middleware/authMiddleware.js';


router.route('/').post(registerUser).get(getUsers);
router.post('/logout',logoutUser);
router.post('/auth',authUser);
router.route('/profile').get(getUserProfile).put(updateUserProfile);
router.route('/:id').delete(protect,admin,deleteUser).get(getUserByID).put(protect,admin,updateUser);


export default router;
