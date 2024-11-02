import React from 'react';
import { useGetDoctorWithPatientsQuery } from '../../slices/doctorApiSlice';
import { Link } from 'react-router-dom';
import '../../assets/styles/HomeMedicoScreen.css';

const HomeScreenMedico = () => {
  const { data: patients, isLoading, error } = useGetDoctorWithPatientsQuery();

  return (
    <div className="table-container">
      <h2>Pacientes Asignados</h2>
      {isLoading ? (
        <p>Cargando pacientes...</p>
      ) : error ? (
        <p>Error al cargar los pacientes: {error?.data?.message || "Ocurrió un problema inesperado"}</p>
      ) : patients.length > 0 ? (
        <table className="assigned-patients-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Reporte</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id}>
                <td>{patient.user?.name || "No disponible"}</td>
                <td>{patient.user?.lastName || "No disponible"}</td>
                <td>{patient.user?.email || "No disponible"}</td>
                <td>{patient.user?.phoneNumber || "No disponible"}</td>
                <td>{patient.user?.isActive ? "Activo" : "Inactivo"}</td>
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
