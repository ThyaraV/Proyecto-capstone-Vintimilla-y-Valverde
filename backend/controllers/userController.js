import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import * as faceapi from "face-api.js";

//@desc Auth user and get token
//@route POST /api/users/login
//@access Public
//@desc Auth user and get token
//@route POST /api/users/auth
//@access Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password, faceData } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error("Correo electrónico no válido");
  }
  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("Usuario no encontrado");
  }

  if (!user.isActive) {
    // Verificar si el usuario está inhabilitado
    res.status(403); // Forbidden
    throw new Error("Usuario inhabilitado. No se puede iniciar sesión.");
  }

  if (faceData) {
    // Autenticación con reconocimiento facial
    if (!user.faceData || user.faceData.length === 0) {
      res.status(401);
      throw new Error("El usuario no tiene datos faciales registrados ");
    }

    const storedFaceDescriptor = new Float32Array(user.faceData);
    const queryDescriptor = new Float32Array(faceData);

    const distance = faceapi.euclideanDistance(
      storedFaceDescriptor,
      queryDescriptor
    );

    if (distance < 0.6) {
      generateToken(res, user._id);
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        cardId: user.cardId,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(401);
      throw new Error("Cara no reconocida");
    }
  } else if (password) {
    // Autenticación con contraseña
    if (await user.matchPassword(password)) {
      generateToken(res, user._id);
      res.status(200).json({
        _id: user._id,
        name: user.name,
        lastName: user.lastName,
        cardId: user.cardId,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(401);
      throw new Error("Email o contraseña inválidos");
    }
  } else {
    res.status(400);
    throw new Error(
      "Se requiere contraseña o datos faciales para iniciar sesión"
    );
  }
});

//@desc Get face data for a user
//@route POST /api/users/facedata
//@access Public
// Agrega logs en el controlador
const getFaceData = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log("Email recibido en getFaceData:", email);

  const user = await User.findOne({ email });
  if (!user) {
    console.error("Usuario no encontrado");
    res.status(404);
    throw new Error("Usuario no encontrado");
  }

  if (!user.faceData || user.faceData.length === 0) {
    console.error("El usuario no tiene datos faciales registrados");
    res.status(400);
    throw new Error("El usuario no tiene datos faciales registrados");
  }

  console.log("faceData del usuario:", user.faceData);
  res.status(200).json({ faceData: user.faceData });
});

//@desc Register user
//@route POST /api/users
//@access Public
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    lastName,
    cardId,
    email,
    phoneNumber,
    password,
    faceDescriptor,
  } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  let parsedFaceDescriptor;
  if (faceDescriptor) {
    try {
      parsedFaceDescriptor =
        typeof faceDescriptor === "string"
          ? JSON.parse(faceDescriptor)
          : faceDescriptor;

      if (
        !Array.isArray(parsedFaceDescriptor) ||
        !parsedFaceDescriptor.every((num) => typeof num === "number")
      ) {
        throw new Error();
      }
    } catch {
      res.status(400);
      throw new Error("Invalid faceDescriptor format");
    }
  }

  const userData = {
    name,
    lastName,
    cardId,
    email,
    phoneNumber,
    password,
  };

  if (parsedFaceDescriptor) {
    userData.faceData = parsedFaceDescriptor;
  }

  const user = await User.create(userData);

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      lastName: user.lastName,
      cardId: user.cardId,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

//@desc Logout user - clear cookie
//@route GET /api/users/logout
//@access Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

//@desc Get user profile
//@route GET /api/users/profile
//@access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      lastName: user.lastName,
      cardId: user.cardId,
      email: user.email,
      phoneNumber: user.phoneNumber,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//@desc Update user profile
//@route PUT /api/users/profile
//@access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.cardId = req.body.cardId || user.cardId;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    if (req.body.password) {
      user.password = req.body.password;
    }

    // Procesa el faceDescriptor localmente
    if (req.body.faceDescriptor) {
      let faceDescriptor = req.body.faceDescriptor;

      if (typeof faceDescriptor === "string") {
        try {
          faceDescriptor = JSON.parse(faceDescriptor);
        } catch (error) {
          console.error("Error parsing faceDescriptor JSON:", error.message);
          res.status(400);
          throw new Error("Invalid faceDescriptor format");
        }
      }

      if (
        Array.isArray(faceDescriptor) &&
        faceDescriptor.every((num) => typeof num === "number")
      ) {
        user.faceData = faceDescriptor;
      } else {
        console.error("Invalid faceDescriptor format: Not an array of numbers");
        res.status(400);
        throw new Error("Invalid faceDescriptor format");
      }
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      lastName: updatedUser.lastName,
      cardId: updatedUser.cardId,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//@desc Get all users
//@route GET /api/users
//@access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

//@desc Get user by ID
//@route GET /api/users/:id
//@access Private/Admin
const getUserByID = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//@desc Delete user
//@route DELETE /api/users/:id
//@access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Cannot delete admin user");
    }
    await User.deleteOne({ _id: user._id });
    res.status(200).json({ message: "User deleted successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const disableUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isActive = false; // Cambiar el estado a inhabilitado
    await user.save(); // Guardar los cambios en la base de datos
    res.status(200).json({ message: "User disabled successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const enableUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isActive = true; // Cambiar el estado a habilitado
    await user.save(); // Guardar los cambios en la base de datos
    res.status(200).json({ message: "User enabled successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//@desc Update user
//@route PUT /api/users/:id
//@access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//@desc Search users
//@route GET /api/users/search
//@access Private/Admin
const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query; // obtenemos la consulta de búsqueda de los parámetros de la URL

  // Buscamos usuarios que coincidan con la consulta
  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { lastName: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ],
  });

  res.status(200).json(users);
});

export {
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
  enableUser
};
