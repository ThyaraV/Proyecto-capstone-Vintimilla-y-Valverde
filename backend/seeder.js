import mongoose from 'mongoose';
import connectDB from './config/db.js';
import colors from 'colors';
import dotenv from 'dotenv';
import User from './models/userModel.js'; 
import Doctor from './models/doctorModel.js';
import Patient from './models/patientModel.js';
import Activity from './models/activityModel.js';
import { users, doctors, patients, activities } from './data/users.js'; // Exportar correctamente 'activities'

dotenv.config();

connectDB();

const importData = async () => {
    try {
        // 1. Eliminar los datos existentes en orden (dependencias)
        await Activity.deleteMany(); // Primero eliminar actividades
        await Patient.deleteMany();
        await Doctor.deleteMany();
        await User.deleteMany();

        // 2. Insertar usuarios
        const createdUsers = await User.insertMany(users);
        const adminUser = createdUsers[0]._id; // Asumir que el primer usuario es el administrador

        // 3. Insertar doctores
        const sampleDoctors = doctors.map((doctor, index) => {
            return { 
                ...doctor, 
                user: createdUsers[index + 1]?._id || adminUser // Asigna un usuario a cada doctor
            };
        });
        const createdDoctors = await Doctor.insertMany(sampleDoctors);

        // 4. Insertar pacientes
        const samplePatients = patients.map((patient, index) => {
            const assignedDoctor = createdDoctors[index % createdDoctors.length]; // Asignar un doctor al paciente
            return {
                ...patient,
                doctor: assignedDoctor._id, // Asignar el médico al paciente
                user: createdUsers[index + doctors.length + 1]?._id || adminUser // Asigna un usuario a cada paciente
            };
        });
        const createdPatients = await Patient.insertMany(samplePatients);

        // 5. Insertar actividades en el orden dado, verificando el patientId
        const sampleActivities = activities.map((activity, index) => {
            // Buscar el paciente correspondiente para asegurar que el ID sea correcto
            const patient = createdPatients.find(p => p._id.toString() === activity.patientId.toString());

            if (!patient) {
                console.warn(`Warning: No patient found for activity at index ${index}`);
                return null;
            }

            return {
                ...activity,
                patientId: patient._id // Asignar el ID correcto de paciente
            };
        }).filter(activity => activity !== null); // Filtrar cualquier actividad sin paciente

        // 6. Insertar actividades respetando el orden
        await Activity.insertMany(sampleActivities);

        console.log('Data Imported in Order!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error.message}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        // Eliminar en orden inverso
        await Activity.deleteMany();
        await Patient.deleteMany();
        await Doctor.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error.message}`.red.inverse);
        process.exit(1);
    }
};

// Determinar si destruir o importar los datos
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
