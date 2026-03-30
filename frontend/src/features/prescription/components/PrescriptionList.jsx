import React from 'react';
import PrescriptionCard from './PrescriptionCard';

const PrescriptionList = ({ prescriptions, loading, error, onEdit, onDelete }) => {
  if (loading) return <div className="text-center py-8">Loading prescriptions...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  if (prescriptions.length === 0) {
    return <div className="text-center py-8 text-gray-500">No prescriptions found</div>;
  }

  return (
    <div>
      {prescriptions.map((prescription) => (
        <PrescriptionCard
          key={prescription.id}
          prescription={prescription}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default PrescriptionList;
