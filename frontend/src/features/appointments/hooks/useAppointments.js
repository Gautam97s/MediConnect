import { useState, useEffect } from 'react';
import * as appointmentApi from '../api/appointmentApi';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await appointmentApi.getAllAppointments();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create appointment
  const addAppointment = async (appointmentData) => {
    try {
      const newAppointment = await appointmentApi.createAppointment(appointmentData);
      setAppointments([...appointments, newAppointment]);
      return newAppointment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update appointment
  const updateAppointmentData = async (id, appointmentData) => {
    try {
      const updated = await appointmentApi.updateAppointment(id, appointmentData);
      setAppointments(
        appointments.map((apt) => (apt.id === id ? updated : apt))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete appointment
  const removeAppointment = async (id) => {
    try {
      await appointmentApi.deleteAppointment(id);
      setAppointments(appointments.filter((apt) => apt.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    error,
    addAppointment,
    updateAppointmentData,
    removeAppointment,
    refetch: fetchAppointments,
  };
};
