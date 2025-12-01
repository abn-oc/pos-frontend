import React from 'react';

export const Profile = ({ user, setUser }) => {
  return (
    <div style={styles.container}>
      <h1>Profile</h1>
      <p>Welcome, {user?.fullName}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
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