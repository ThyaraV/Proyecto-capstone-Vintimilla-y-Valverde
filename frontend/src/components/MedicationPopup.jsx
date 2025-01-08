// src/components/MedicationPopup.jsx

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../assets/styles/MedicationPopup.css';
import { format } from 'date-fns';
import { useTakeMedicationMutation } from '../slices/treatmentSlice';

Modal.setAppElement('#root');

const MedicationPopup = ({ isOpen, onRequestClose, medications = [], treatmentId, onUpdate }) => {
  console.log('MedicationPopup - treatmentId:', treatmentId); // Verifica que se reciba correctamente
  const [takeMedication] = useTakeMedicationMutation();
  const [localMeds, setLocalMeds] = useState(medications);
  
  // Estados para manejo de carga y errores
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Sincronizar el estado local cuando cambian las props de medicamentos o treatmentId
  useEffect(() => {
    setLocalMeds(medications);
  }, [medications]);

  const handleCheckboxChange = async (medicationId) => {
    if (!treatmentId) {
      console.error('treatmentId es undefined');
      alert('No se puede actualizar el medicamento sin un treatmentId válido.');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      console.log(`Enviando solicitud para actualizar medicamento: treatmentId=${treatmentId}, medicationId=${medicationId}`);
      const result = await takeMedication({ treatmentId, medicationId }).unwrap();
      console.log('Respuesta de la mutación:', result);

      // Filtrar el medicamento tomado de la lista local
      const updatedMeds = localMeds.filter(med => med._id !== medicationId);
      setLocalMeds(updatedMeds);

      // Notificar al componente padre si es necesario
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error al marcar el medicamento como tomado:', error);
      setUpdateError('Hubo un error al actualizar el medicamento. Por favor, intenta nuevamente.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Detalles de Medicamentos"
      className="medication-modal"
      overlayClassName="medication-overlay"
    >
      <div className="modal-header">
        <h2>🩺 Medicamentos de hoy</h2>
        <button className="close-icon" onClick={onRequestClose}>✖</button>
      </div>
      {isUpdating && <p>Actualizando...</p>}
      {updateError && <p className="error-message">{updateError}</p>}
      {localMeds.length > 0 ? (
        <div className="medication-list">
          {localMeds.map((med) => (
            <div key={med._id} className="medication-card">
              <div className="medication-header">
                <h3 className="medication-name">{med.name}</h3>
                {med.dosage && <span className="medication-dosage">Dosis: {med.dosage}</span>}
              </div>
              <div className="medication-dates">
                {med.startDate && (
                  <span>Inicio: {format(new Date(med.startDate), 'dd/MM/yyyy')}</span>
                )}
                {med.endDate && (
                  <span>Fin: {format(new Date(med.endDate), 'dd/MM/yyyy')}</span>
                )}
              </div>
              <div className="medication-actions">
                <label>
                  <input
                    type="checkbox"
                    checked={med.takenToday}
                    onChange={() => handleCheckboxChange(med._id)}
                  />
                  Tomado
                </label>
              </div>
              <div className="progress-bar">
                <div className="progress" style={{ width: '75%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-medications">No tienes medicamentos programados para hoy.</p>
      )}
    </Modal>
  );
};

export default MedicationPopup;
