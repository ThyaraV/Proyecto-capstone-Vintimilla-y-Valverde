import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetPatientsQuery } from '../../slices/patientApiSlice';
import { Link } from 'react-router-dom';
import '../../assets/styles/HomeMedicoScreen.css'; // Asegúrate de tener estilos específicos para la tabla aquí

const HomeScreenMedico = () => {
  const { userInfo } = useSelector((state) => state.auth); // Obtenemos la información del usuario médico

  const { data: patients = [], isLoading, error } = useGetPatientsQuery();

  // Filtramos los pacientes asignados al médico que ha iniciado sesión
  const assignedPatients = patients.filter((patient) => {
    // Verificamos si patient.doctor es un objeto y extraemos su _id
    const doctorId = patient.doctor?._id || patient.doctor;
    return doctorId === userInfo._id;
  });

  return (
    <div className="table-container">
      <h2>Pacientes Asignados</h2>
      {isLoading ? (
        <p>Cargando pacientes...</p>
      ) : error ? (
        <p>Error al cargar los pacientes.</p>
      ) : assignedPatients.length > 0 ? (
        <table className="assigned-patients-table">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Etapa</th>
              <th>Datos del paciente</th>
            </tr>
          </thead>
          <tbody>
            {assignedPatients.map((patient) => (
              <tr key={patient._id}>
                <td>
                  <img src={patient.user?.avatar} alt="avatar" className="avatar" />
                  {patient.user?.name || "Nombre no disponible"}
                </td>
                <td>{patient.stage || "No especificado"}</td>
                <td>
                  <Link to={`/patient/${patient._id}/report`} className="report-link">
                    Ver reporte
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No tienes pacientes asignados.</p>
      )}
    </div>
  );
};

export default HomeScreenMedico;

