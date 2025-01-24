Aplicación Web para el Seguimiento de Pacientes Neurodegenerativos

Introducción

Esta aplicación web, desarrollada con el stack MERN (MongoDB, Express, React, Node.js), tiene como objetivo optimizar el seguimiento de pacientes con problemas neurodegenerativos mediante la digitalización de procesos y el uso de herramientas modernas como inteligencia artificial y autenticación facial.

Requisitos Previos

Antes de ejecutar la aplicación, asegúrese de tener instalados los siguientes componentes:

Node.js (v16 o superior)

MongoDB (v5 o superior, puede ser local o en la nube a través de MongoDB Atlas)

Navegador web moderno (Google Chrome o equivalente)

Git (opcional, para clonar el repositorio)

Instalación

Clonar el repositorio:

git clone https://github.com/usuario/app-seguimiento-pacientes.git
cd app-seguimiento-pacientes

Configurar las variables de entorno:
Cree un archivo .env en el directorio principal con las siguientes variables:

PORT=5000
MONGO_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/higea
JWT_SECRET=su_llave_secreta
CLIENT_URL=http://localhost:3000

Instalar dependencias:

Backend:

cd backend
npm install

Frontend:

cd ../frontend
npm install

Iniciar la aplicación:

Backend:

cd backend
npm start

Frontend:

cd ../frontend
npm start

Abra la aplicación en su navegador:

Frontend: http://localhost:3000

Backend: http://localhost:5000

Estructura del Proyecto

app-seguimiento-pacientes/
├── backend/
│   ├── controllers/    # Lógica de negocio
│   ├── models/         # Modelos de datos MongoDB
│   ├── routes/         # Rutas de la API
│   ├── server.js       # Punto de entrada del servidor
│   └── config/         # Configuración (conexión a la BD, etc.)
├── frontend/
│   ├── src/
│   │   ├── components/ # Componentes de React
│   │   ├── screens/    # Pantallas principales
│   │   ├── App.js      # Componente principal
│   │   └── index.js    # Punto de entrada del frontend
├── .env.example         # Ejemplo de variables de entorno
├── README.md            # Documentación
└── package.json         # Configuración de dependencias

Funciones Principales

Para Médicos

Gestor de pacientes: Crear, editar y monitorear perfiles de pacientes.

Asignación de actividades: Seleccionar actividades cognitivas para los pacientes.

Evaluaciones cognitivas: Uso del test MoCA digitalizado.

Panel de reportes: Visualización de progreso y gráficos.

Para Pacientes

Actividades interactivas: Juegos y tareas cognitivas asignadas.

Registro emocional: "Velocímetro emocional" diario.

Notificaciones: Recordatorios automáticos de actividades y citas.

Pruebas

Pruebas de la API:

Use herramientas como Postman o cURL para probar los endpoints disponibles.

Ejemplo de petición:

curl -X POST http://localhost:5000/api/patients -H "Content-Type: application/json" -d '{"name": "Juan Perez", "age": 65}'

Pruebas del Frontend:

Navegue por las diferentes pantallas y verifique la funcionalidad.

Consideraciones de Seguridad

Mantenga la clave JWT y las credenciales de la base de datos en secreto.

Habilite HTTPS en entornos de producción.

Realice auditorías periódicas al código y la base de datos.

Despliegue

Frontend:

Construya el proyecto:

cd frontend
npm run build

Aloje los archivos estáticos en servicios como Vercel o Netlify.

Backend:

Use servicios como Heroku, AWS o DigitalOcean para desplegar el servidor.

Configure las variables de entorno en el entorno de producción.

