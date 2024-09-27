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
  getFaceData, // Importar getFaceData
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

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

// Rutas para la gestión de usuarios (solo admin)
router
  .route("/:id")
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserByID)
  .put(protect, admin, updateUser);

export default router;
