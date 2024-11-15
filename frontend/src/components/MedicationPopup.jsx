// src/components/MedicationPopup.jsx

import React from 'react';
import Modal from 'react-modal';
import '../assets/styles/MedicationPopup.css';
import { format } from 'date-fns';

Modal.setAppElement('#root');

const MedicationPopup = ({ isOpen, onRequestClose, medications = [] }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Detalles de Medicamentos"
      className="medication-modal"
      overlayClassName="medication-overlay"
    >
      <div className="modal-header">
        <h2>🩺 Medicamentos de Hoy</h2>
        <button className="close-icon" onClick={onRequestClose}>✖</button>
      </div>
      {medications.length > 0 ? (
        <div className="medication-list">
          {medications.map((med, index) => (
            <div key={index} className="medication-card">
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
