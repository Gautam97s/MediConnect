import React from 'react';
import AppointmentCard from './AppointmentCard';

const AppointmentList = ({ appointments, loading, error, onEdit, onDelete }) => {
  if (loading) return <div className="text-center py-8">Loading appointments...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  if (appointments.length === 0) {
    return <div className="text-center py-8 text-gray-500">No appointments found</div>;
  }

  return (
    <div>
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default AppointmentList;
