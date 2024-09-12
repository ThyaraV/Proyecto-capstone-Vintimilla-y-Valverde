import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const users = [
    {
        name: 'Admin User',
        lastName: 'AdminLastName',
        cardId: '0000001',
        email: 'admin@email.com',
        phoneNumber: '123-456-7890',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: true,
        role: 'User',
    },
    {
        name: 'John Doe',
        lastName: 'Doe',
        cardId: '0000002',
        email: 'john@email.com',
        phoneNumber: '098-765-4321',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false,
        role: 'User',
    },
    {
        name: 'Jane Doe',
        lastName: 'Doe',
        cardId: '0000003',
        email: 'jane@email.com',
        phoneNumber: '123-123-1234',
        password: bcrypt.hashSync('123456', 10),
        isAdmin: false,
        role: 'User',
    }
];
const doctors = [
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Dr. Alice',
        lastName: 'Smith',
        cardId: '1111111',
        email: 'alice@hospital.com',
        phoneNumber: '321-654-9870',
        password: bcrypt.hashSync('doctor123', 10),
        isAdmin: false,
        role: 'Doctor',
        especialidad: 'Neurología',
        patients: [] // Esto se llenará al asignar pacientes
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Dr. Bob',
        lastName: 'Johnson',
        cardId: '1111112',
        email: 'bob@hospital.com',
        phoneNumber: '987-654-3210',
        password: bcrypt.hashSync('doctor123', 10),
        isAdmin: false,
        role: 'Doctor',
        especialidad: 'Cardiología',
        patients: []
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Dr. Carol',
        lastName: 'Williams',
        cardId: '1111113',
        email: 'carol@hospital.com',
        phoneNumber: '654-321-0987',
        password: bcrypt.hashSync('doctor123', 10),
        isAdmin: false,
        role: 'Doctor',
        especialidad: 'Pediatría',
        patients: []
    }
];

const patients = [
    {
        _id: new mongoose.Types.ObjectId(),
        school: 'High School No. 1',
        birthdate: new Date('2005-03-12'),
        gender: 'Femenino',
        educationalLevel: 'Secundaria',
        familyRepresentative: 'Mrs. Brown',
        address: '456 Elm St',
        maritalStatus: 'Soltero/a',
        profession: 'Estudiante',
        cognitiveStage: 'Inicial',
        referredTo: 'Psicólogo',
        doctor: doctors[0]._id, // Asignado a Dr. Alice
    },
    {
        _id: new mongoose.Types.ObjectId(),
        school: 'Elementary School No. 2',
        birthdate: new Date('2008-07-25'),
        gender: 'Masculino',
        educationalLevel: 'Primaria',
        familyRepresentative: 'Mr. Green',
        address: '789 Maple Ave',
        maritalStatus: 'Soltero/a',
        profession: 'Estudiante',
        cognitiveStage: 'Intermedio',
        referredTo: 'Pediatra',
        doctor: doctors[1]._id, // Asignado a Dr. Bob
    },
    {
        _id: new mongoose.Types.ObjectId(),
        school: 'Middle School No. 3',
        birthdate: new Date('2010-11-05'),
        gender: 'Masculino',
        educationalLevel: 'Primaria',
        familyRepresentative: 'Mrs. White',
        address: '123 Oak St',
        maritalStatus: 'Soltero/a',
        profession: 'Estudiante',
        cognitiveStage: 'Avanzado',
        referredTo: 'Neurología',
        doctor: doctors[2]._id, // Asignado a Dr. Carol
    }

];

const activities = [
    {
        name: 'Asociación de Fotos',
        description: 'Seleccionar el nombre correcto para la imagen mostrada.',
        type: 'asociacion_fotos',
        dateCompletion: new Date('2024-09-10'),
        scoreObtained: 85,
        timeUsed: 120, // segundos
        difficultyLevel: 2, // Dificultad intermedia
        Observations: 'Buena precisión pero requiere mejorar en tiempo de respuesta.',
        progress: 'mejorando',
        image: '/images/fiesta/f1.png',
        activeView: true,
        patientId: patients[1]._id, // Asociado a Alice Brown
    },
    {
        name: 'Juego de Memoria',
        description: 'Recordar y emparejar imágenes iguales en pares.',
        type: 'memoria',
        dateCompletion: new Date('2024-09-08'),
        scoreObtained: 120,
        timeUsed: 200, // segundos
        difficultyLevel: 1, // Dificultad fácil
        Observations: 'Mejor desempeño en comparación con la sesión anterior.',
        progress: 'mejorando',
        image: '/images/fiesta/f1.png',
        activeView: true,
        patientId: patients[1]._id, // Asociado a Bob Green

    },
    {
        name: 'Suma y Resta',
        description: 'Resolver ecuaciones matemáticas sencillas lo más rápido posible.',
        type: 'matematicas',
        dateCompletion: new Date('2024-09-07'),
        scoreObtained: 70,
        timeUsed: 90, // segundos
        difficultyLevel: 2, // Dificultad intermedia
        Observations: 'Resultados precisos pero requiere mejorar en velocidad.',
        progress: 'mejorando',
        image: '/images/fiesta/f1.png',
        activeView: true,
        patientId: patients[0]._id, // Asociado a Alice Brown

    },
    
];


export { users, doctors, patients,activities };