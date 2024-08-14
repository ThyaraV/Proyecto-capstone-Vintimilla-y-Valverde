import mongoose from 'mongoose';
import connectDB from './config/db.js';
import colors from 'colors';
import dotenv from 'dotenv';
import User from './models/userModel.js'; 
import Doctor from './models/doctorModel.js';
import Patient from './models/patientModel.js';
import { users, doctors, patients } from './data/users.js';

dotenv.config();

connectDB();


const importData = async () => {
    try {
        await User.deleteMany();
        await Doctor.deleteMany();
        await Patient.deleteMany();

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

        // Insertar pacientes con la referencia al médico y usuario
        await Patient.insertMany(samplePatients);

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