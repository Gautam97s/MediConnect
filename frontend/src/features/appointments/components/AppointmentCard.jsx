import React from 'react';

const AppointmentCard = ({ appointment, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{appointment.doctorName}</h3>
          <p className="text-gray-600">{appointment.specialty}</p>
          <p className="text-sm text-gray-500 mt-2">
            Date: {new Date(appointment.appointmentDate).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">Time: {appointment.appointmentTime}</p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(appointment.id)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(appointment.id)}
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

export default AppointmentCard;
