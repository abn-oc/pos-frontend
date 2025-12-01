import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../functions';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based menu items
  const getMenuItems = () => {
    const role = user?.role;
    const items = [];

    // Common items for all users
    items.push(
      { name: 'Profile', path: '/profile', icon: '👤' },
      { name: 'Customers', path: '/customers', icon: '👥' }
    );

    // POS access for cashiers and above
    if (['ROLE_BRANCH_CASHIER', 'ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_ADMIN', 
         'ROLE_STORE_MANAGER', 'ROLE_STORE_ADMIN', 'ROLE_ADMIN'].includes(role)) {
      items.push({ name: 'POS', path: '/pos', icon: '💰' });
    }

    // Orders access for all
    items.push({ name: 'Orders', path: '/orders', icon: '📦' });

    // Refunds for cashiers and above
    if (['ROLE_BRANCH_CASHIER', 'ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_ADMIN', 
         'ROLE_STORE_MANAGER', 'ROLE_STORE_ADMIN', 'ROLE_ADMIN'].includes(role)) {
      items.push({ name: 'Refunds', path: '/refunds', icon: '↩️' });
    }

    // Products for managers and above
    if (['ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_STORE_MANAGER', 
         'ROLE_STORE_ADMIN', 'ROLE_ADMIN'].includes(role)) {
      items.push({ name: 'Products', path: '/products', icon: '📦' });
    }

    // Inventory for managers and above
    if (['ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_STORE_MANAGER', 
         'ROLE_STORE_ADMIN', 'ROLE_ADMIN'].includes(role)) {
      items.push({ name: 'Inventory', path: '/inventory', icon: '📊' });
    }

    // Categories for store managers and above
    if (['ROLE_STORE_MANAGER', 'ROLE_STORE_ADMIN', 'ROLE_ADMIN'].includes(role)) {
      items.push({ name: 'Categories', path: '/categories', icon: '🏷️' });
    }

    // Employees for managers and above
    if (['ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_ADMIN', 'ROLE_STORE_MANAGER', 
         'ROLE_STORE_ADMIN', 'ROLE_ADMIN'].includes(role)) {
      items.push({ name: 'Employees', path: '/employees', icon: '👔' });
    }

    // Branches for store admins and above
    if (['ROLE_BRANCH_ADMIN', 'ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER', 
         'ROLE_ADMIN'].includes(role)) {
      items.push({ name: 'Branches', path: '/branches', icon: '🏢' });
    }

    // Stores for admins only
    if (['ROLE_ADMIN', 'ROLE_STORE_ADMIN'].includes(role)) {
      items.push({ name: 'Stores', path: '/stores', icon: '🏪' });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const getRoleDisplay = (role) => {
    const roleMap = {
      'ROLE_USER': 'User',
      'ROLE_ADMIN': 'Admin',
      'ROLE_BRANCH_CASHIER': 'Cashier',
      'ROLE_BRANCH_MANAGER': 'Branch Manager',
      'ROLE_STORE_MANAGER': 'Store Manager',
      'ROLE_STORE_ADMIN': 'Store Admin',
      'ROLE_BRANCH_ADMIN': 'Branch Admin',
    };
    return roleMap[role] || role;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.headerTitle}>POS System Dashboard</h1>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.fullName}</span>
            <span style={styles.userRole}>{getRoleDisplay(user?.role)}</span>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h2 style={styles.welcomeTitle}>Welcome back, {user?.fullName}!</h2>
          <p style={styles.welcomeText}>
            What would you like to do today?
          </p>
        </div>

        {/* Menu Grid */}
        <div style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <div
              key={index}
              style={styles.menuCard}
              onClick={() => navigate(item.path)}
            >
              <div style={styles.menuIcon}>{item.icon}</div>
              <div style={styles.menuName}>{item.name}</div>
            </div>
          ))}
        </div>

        {/* Quick Stats (Optional - can be expanded later) */}
        <div style={styles.statsSection}>
          <h3 style={styles.statsTitle}>Quick Stats</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>-</div>
              <div style={styles.statLabel}>Today's Sales</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>-</div>
              <div style={styles.statLabel}>Orders</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>-</div>
              <div style={styles.statLabel}>Customers</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>-</div>
              <div style={styles.statLabel}>Products</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    margin: 0,
    fontSize: '24px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    fontSize: '16px',
    fontWeight: '500',
  },
  userRole: {
    fontSize: '14px',
    opacity: 0.9,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '4px 12px',
    borderRadius: '12px',
  },
  logoutButton: {
    backgroundColor: 'white',
    color: '#007bff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  welcomeSection: {
    marginBottom: '40px',
  },
  welcomeTitle: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '10px',
  },
  welcomeText: {
    fontSize: '16px',
    color: '#666',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  menuCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  menuIcon: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  menuName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
  },
  statsSection: {
    marginTop: '40px',
  },
  statsTitle: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '10px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
  },
};

// Add hover effects
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    button:hover {
      opacity: 0.9;
    }
    div[style*="menuCard"]:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
  `;
  if (!document.querySelector('style[data-dashboard-styles]')) {
    styleSheet.setAttribute('data-dashboard-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default Dashboard;