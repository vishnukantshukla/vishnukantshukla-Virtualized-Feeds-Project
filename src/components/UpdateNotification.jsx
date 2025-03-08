// src/components/UpdateNotification.js
import React, { useState, useEffect } from 'react';

const UpdateNotification = () => {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setShowUpdateNotification(true);
    window.addEventListener('swUpdateAvailable', handleUpdate);
    
    return () => window.removeEventListener('swUpdateAvailable', handleUpdate);
  }, []);

  const refreshPage = () => {
    window.location.reload();
  };

  if (!showUpdateNotification) return null;
  
  return (
    <div className="fixed top-4 right-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded shadow-lg">
      <p>New content is available!</p>
      <button 
        onClick={refreshPage}
        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
      >
        Refresh
      </button>
    </div>
  );
};

export default UpdateNotification;