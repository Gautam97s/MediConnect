import React, { createContext, useContext } from 'react';
import { useAppointments } from '../hooks/useAppointments';

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const appointmentsData = useAppointments();

  return (
    <AppointmentContext.Provider value={appointmentsData}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointmentContext = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointmentContext must be used within AppointmentProvider');
  }
  return context;
};
