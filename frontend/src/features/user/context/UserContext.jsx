import React, { createContext, useContext } from 'react';
import { useUser } from '../hooks/useUser';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const userData = useUser();

  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};
