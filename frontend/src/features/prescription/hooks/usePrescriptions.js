import { useState, useEffect } from 'react';
import * as prescriptionApi from '../api/prescriptionApi';

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all prescriptions
  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await prescriptionApi.getAllPrescriptions();
      setPrescriptions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create prescription
  const addPrescription = async (prescriptionData) => {
    try {
      const newPrescription = await prescriptionApi.createPrescription(prescriptionData);
      setPrescriptions([...prescriptions, newPrescription]);
      return newPrescription;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update prescription
  const updatePrescriptionData = async (id, prescriptionData) => {
    try {
      const updated = await prescriptionApi.updatePrescription(id, prescriptionData);
      setPrescriptions(
        prescriptions.map((presc) => (presc.id === id ? updated : presc))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete prescription
  const removePrescription = async (id) => {
    try {
      await prescriptionApi.deletePrescription(id);
      setPrescriptions(prescriptions.filter((presc) => presc.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return {
    prescriptions,
    loading,
    error,
    addPrescription,
    updatePrescriptionData,
    removePrescription,
    refetch: fetchPrescriptions,
  };
};
