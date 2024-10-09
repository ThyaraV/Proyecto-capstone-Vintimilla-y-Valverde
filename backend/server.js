import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import activitiesRoutes from "./routes/activitiesRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js"; // Importar las rutas de doctores
import connectDB from "./config/db.js";

const port = process.env.PORT || 5000;

connectDB(); // Connect to MongoDB

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

// Definir las rutas
app.use("/api/users", userRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/doctors", doctorRoutes); // Agregar la ruta de doctores

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server running on port ${port}`));
