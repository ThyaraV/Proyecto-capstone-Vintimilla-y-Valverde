import express from "express";
const router = express.Router();
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
  getFaceData,
  searchUsers,
  disableUser,
  enableUser// Importar getFaceData
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { saveUserMood } from '../controllers/moodController.js';

router.post('/mood', protect, saveUserMood);

// Ruta para el registro de usuario y obtener todos los usuarios (solo admin)
router.route("/").post(registerUser).get(protect, admin, getUsers);

// Ruta para cerrar sesión
router.post("/logout", logoutUser);

// Ruta para autenticación de usuarios (inicio de sesión con contraseña o datos faciales)
router.post("/auth", authUser);

// Ruta para obtener datos faciales según el email
router.post("/facedata", getFaceData); // Nueva ruta para obtener los datos faciales

// Rutas para el perfil de usuario
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Ruta para buscar usuarios
router.get("/search", protect, admin, searchUsers);


// Rutas para la gestión de usuarios (solo admin)
router
  .route("/:id")
  .delete(protect, admin, disableUser)
  .get(protect, admin, getUserByID)
  .put(protect, admin, updateUser);

router
  .route("/:id/enable")
  .put(protect, admin, enableUser);

export default router;
