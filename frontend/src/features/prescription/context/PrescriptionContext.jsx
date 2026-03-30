import React, { createContext, useContext } from 'react';
import { usePrescriptions } from '../hooks/usePrescriptions';

const PrescriptionContext = createContext();

export const PrescriptionProvider = ({ children }) => {
  const prescriptionsData = usePrescriptions();

  return (
    <PrescriptionContext.Provider value={prescriptionsData}>
      {children}
    </PrescriptionContext.Provider>
  );
};

export const usePrescriptionContext = () => {
  const context = useContext(PrescriptionContext);
  if (!context) {
    throw new Error('usePrescriptionContext must be used within PrescriptionProvider');
  }
  return context;
};
