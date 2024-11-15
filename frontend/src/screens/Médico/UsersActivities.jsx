import React from 'react';
import { useSelector } from 'react-redux';
import { useGetDoctorWithPatientsQuery } from '../../slices/doctorApiSlice';
import { Link } from 'react-router-dom';
import '../../assets/styles/UsersActivities.css';
import Loader from '../../components/Loader.jsx';

const HomeScreenMedico = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  
  // Obtener los pacientes del doctor usando RTK Query
  const { data: patients, isLoading, error } = useGetDoctorWithPatientsQuery();

  return (
    <div className="home-container">
      <h2 className="home-title">Pacientes Asignados</h2>
      
      {isLoading ? (
        <Loader /> // Mostrar Loader mientras se cargan los datos
      ) : error ? (
        <p className="error-message">
          Error al cargar los pacientes: {error?.data?.message || "Ocurrió un problema inesperado"}
        </p>
      ) : patients && patients.length > 0 ? (
        <div className="patients-grid">
          {patients.map((patient) => (
            <div
              key={patient._id}
              className={`patient-card ${!patient.user?.isActive ? 'inactive' : ''}`}
            >
              {/* Fondo de gradiente */}
              <div className="gradient-background"></div>

              {/* Indicador de Estado */}
              <span className="patient-status"></span>

              {/* Foto del Paciente */}
              <div className="patient-photo-container">
                {/* Imagen del paciente o imagen predeterminada */}
                <img
                  src={patient.user?.profilePicture || '/default-profile.png'}
                  alt={`${patient.user?.name} ${patient.user?.lastName}`}
                  className="patient-photo"
                  loading="lazy"
                />
              </div>

              {/* Información del Paciente */}
              <div className="patient-info">
                <span className="patient-name">
                  {patient.user?.name || "No disponible"} {patient.user?.lastName || ""}
                </span>
                <p className="patient-role">{patient.user?.role || "Paciente"}</p>
              </div>

              {/* Botón para Ver Más */}
              <Link
                to={`/admin/${patient._id}/UserActivity`}
                className="report-button"
              >
                Ver más
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-patients-message">No tienes pacientes asignados.</p>
      )}
    </div>
  );
};

export default HomeScreenMedico;
