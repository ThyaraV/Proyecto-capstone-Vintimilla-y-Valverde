import mongoose from 'mongoose';
import connectDB from './config/db.js';
import colors from 'colors';
import dotenv from 'dotenv';
import User from './models/userModel.js'; 
import Doctor from './models/doctorModel.js';
import Patient from './models/patientModel.js';
import Activity from './models/activityModel.js'; // Importar modelo de actividades
import { users, doctors, patients, activities } from './data/users.js'; // Asegúrate de que 'activities' esté exportado correctamente

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Doctor.deleteMany();
        await Patient.deleteMany();
        await Activity.deleteMany(); // Asegúrate de eliminar actividades antiguas antes de insertar nuevas

        // Insertar usuarios genéricos
        const createdUsers = await User.insertMany(users);
        const adminUser = createdUsers[0]._id;

        // Crear doctores con referencia al usuario correspondiente
        const sampleDoctors = doctors.map((doctor, index) => {
            return { 
                ...doctor, 
                user: createdUsers[index + 1]?._id || adminUser // Asigna un usuario a cada doctor
            };
        });

        const createdDoctors = await Doctor.insertMany(sampleDoctors);

        // Asignar médicos a pacientes y asegurarse de que cada paciente tenga un user asignado
        const samplePatients = patients.map((patient, index) => {
            const assignedDoctor = createdDoctors[index % createdDoctors.length]; // Asignar un doctor al paciente
            return {
                ...patient,
                doctor: assignedDoctor._id, // Asignar el médico al paciente
                user: createdUsers[index + doctors.length + 1]?._id || adminUser // Asigna un usuario a cada paciente
            };
        });

        const createdPatients = await Patient.insertMany(samplePatients);

        // Relacionar actividades con pacientes
        const sampleActivities = activities.map((activity) => {
            if (!activity.patientId) {
                console.warn(`Warning: No patientId found for activity ${activity.name}`);
                return null; // Saltar actividades sin patientId
            }

            // Busca el paciente correspondiente a la actividad
            const patient = createdPatients.find((p) => p._id.toString() === activity.patientId.toString());

            if (!patient) {
                console.warn(`Warning: No patient found for activity with patientId ${activity.patientId}`);
                return null; // Saltar actividades sin un paciente válido
            }

            return {
                ...activity,
                patientId: patient._id // Asignar el ID de paciente a la actividad
            };
        }).filter(activity => activity !== null); // Filtrar actividades sin paciente

        // Insertar actividades
        await Activity.insertMany(sampleActivities);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error.message}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Doctor.deleteMany();
        await Patient.deleteMany();
        await Activity.deleteMany(); // Eliminar también las actividades

        console.log('Data Destroyed'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error.message}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
