import React from 'react';

const StoreManagement = ({ user }) => {
  return (
    <div style={styles.container}>
      <h1>Store Management</h1>
      <p>Store management page - Coming soon</p>
    </div>
  );
};

export default StoreManagement;

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