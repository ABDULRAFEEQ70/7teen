import React from 'react';

const PatientDetails: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Patient Details</h1>
      <div className="card">
        <div className="card-body">
          <p className="text-gray-500">Patient details will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;