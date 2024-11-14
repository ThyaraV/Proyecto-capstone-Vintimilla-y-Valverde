// src/components/MedicationPopup.js
import React from 'react';
import Modal from 'react-modal';
import '../assets/styles/MedicationPopup.css';
import { format } from 'date-fns';

Modal.setAppElement('#root');

const MedicationPopup = ({ isOpen, onRequestClose, medications }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Detalles de Medicamentos"
      className="medication-modal"
      overlayClassName="medication-overlay"
    >
      <h2>Medicamentos para Tomar Hoy</h2>
      <ul>
        {medications.map((med, index) => (
          <li key={index}>
            <strong>{med.name}</strong> - {med.dosage}
            {med.startDate && <span> (Inicio: {format(new Date(med.startDate), 'dd/MM/yyyy')})</span>}
            {med.endDate && <span> (Fin: {format(new Date(med.endDate), 'dd/MM/yyyy')})</span>}
          </li>
        ))}
      </ul>
      <button onClick={onRequestClose} className="close-button">Cerrar</button>
    </Modal>
  );
};

export default MedicationPopup;
