import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <h1 className="loading-title">Echo Chambers</h1>
      <p className="loading-subtitle">
        A mystical realm where memories dance with shadows, and every reflection holds a secret waiting to be discovered.
      </p>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default LoadingScreen;