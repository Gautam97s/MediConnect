import React from 'react';

const PrescriptionCard = ({ prescription, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{prescription.medicationName}</h3>
          <p className="text-gray-600">Doctor: {prescription.doctorName}</p>
          <p className="text-sm text-gray-500 mt-2">
            Dosage: {prescription.dosage}
          </p>
          <p className="text-sm text-gray-500">Duration: {prescription.duration}</p>
          <p className="text-sm text-gray-500 mt-1">
            Issued: {new Date(prescription.issuedDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(prescription.id)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(prescription.id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCard;
