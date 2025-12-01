import React from 'react';

export const NotFound = () => {
  return (
    <div style={styles.container}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="#/dashboard" style={styles.link}>Go back to Dashboard</a>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '16px',
  },
};