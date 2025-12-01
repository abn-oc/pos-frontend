import React from 'react';

export const OrderDetails = ({ user }) => {
  return (
    <div style={styles.container}>
      <h1>Order Details</h1>
      <p>Order details page - Coming soon</p>
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