import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllCustomers,
  searchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getOrdersByCustomer
} from '../functions';

const CustomerManagement = ({ user }) => {
  const navigate = useNavigate();
  
  // State
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getAllCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      setError('Failed to load customers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search customers
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    try {
      const results = await searchCustomers(term);
      setFilteredCustomers(results);
    } catch (err) {
      // Fallback to local search
      const filtered = customers.filter(c =>
        c.fullName.toLowerCase().includes(term.toLowerCase()) ||
        c.email?.toLowerCase().includes(term.toLowerCase()) ||
        c.phone?.includes(term)
      );
      setFilteredCustomers(filtered);
    }
  };

  // Create customer
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newCustomer = await createCustomer(formData);
      setCustomers([newCustomer, ...customers]);
      setFilteredCustomers([newCustomer, ...filteredCustomers]);
      setShowCreateModal(false);
      setFormData({ fullName: '', email: '', phone: '' });
      setSuccess('Customer created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create customer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update customer
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateCustomer(selectedCustomer.id, formData);
      setCustomers(customers.map(c => c.id === updated.id ? updated : c));
      setFilteredCustomers(filteredCustomers.map(c => c.id === updated.id ? updated : c));
      setShowEditModal(false);
      setSelectedCustomer(null);
      setFormData({ fullName: '', email: '', phone: '' });
      setSuccess('Customer updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update customer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete customer
  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteCustomer(selectedCustomer.id);
      setCustomers(customers.filter(c => c.id !== selectedCustomer.id));
      setFilteredCustomers(filteredCustomers.filter(c => c.id !== selectedCustomer.id));
      setShowDeleteModal(false);
      setSelectedCustomer(null);
      setSuccess('Customer deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete customer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // View customer details
  const viewCustomerDetails = async (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
    try {
      const orders = await getOrdersByCustomer(customer.id);
      setCustomerOrders(orders);
    } catch (err) {
      console.error('Failed to load customer orders:', err);
      setCustomerOrders([]);
    }
  };

  // Open edit modal
  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      fullName: customer.fullName,
      email: customer.email || '',
      phone: customer.phone
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Customer Management</h1>
          <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div style={styles.errorBanner}>
          {error}
          <button onClick={() => setError('')} style={styles.closeNotif}>✕</button>
        </div>
      )}
      {success && (
        <div style={styles.successBanner}>
          {success}
          <button onClick={() => setSuccess('')} style={styles.closeNotif}>✕</button>
        </div>
      )}

      {/* Main Content */}
      <div style={styles.content}>
        {/* Search and Create */}
        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button
            onClick={() => setShowCreateModal(true)}
            style={styles.createButton}
          >
            + New Customer
          </button>
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{customers.length}</div>
            <div style={styles.statLabel}>Total Customers</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{filteredCustomers.length}</div>
            <div style={styles.statLabel}>Filtered Results</div>
          </div>
        </div>

        {/* Customer Table */}
        {loading ? (
          <div style={styles.loading}>Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <div style={styles.emptyText}>No customers found</div>
            <button onClick={() => setShowCreateModal(true)} style={styles.emptyButton}>
              Create First Customer
            </button>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} style={styles.tableRow}>
                    <td style={styles.td}>{customer.id}</td>
                    <td style={styles.td}>
                      <strong>{customer.fullName}</strong>
                    </td>
                    <td style={styles.td}>{customer.email || '-'}</td>
                    <td style={styles.td}>{customer.phone}</td>
                    <td style={styles.td}>
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => viewCustomerDetails(customer)}
                          style={styles.viewButton}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => openEditModal(customer)}
                          style={styles.editButton}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => openDeleteModal(customer)}
                          style={styles.deleteButton}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Create New Customer</h2>
              <button onClick={() => setShowCreateModal(false)} style={styles.closeButton}>✕</button>
            </div>
            <form onSubmit={handleCreate} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  style={styles.input}
                  required
                  autoFocus
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={styles.modal} onClick={() => setShowEditModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Edit Customer</h2>
              <button onClick={() => setShowEditModal(false)} style={styles.closeButton}>✕</button>
            </div>
            <form onSubmit={handleUpdate} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  style={styles.input}
                  required
                  autoFocus
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowEditModal(false)} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={styles.modal} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Delete Customer</h2>
              <button onClick={() => setShowDeleteModal(false)} style={styles.closeButton}>✕</button>
            </div>
            <p>Are you sure you want to delete <strong>{selectedCustomer?.fullName}</strong>?</p>
            <p style={styles.warningText}>This action cannot be undone.</p>
            <div style={styles.modalActions}>
              <button onClick={() => setShowDeleteModal(false)} style={styles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleDelete} style={styles.deleteButtonLarge} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showDetailsModal && (
        <div style={styles.modal} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.modalContentLarge} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Customer Details</h2>
              <button onClick={() => setShowDetailsModal(false)} style={styles.closeButton}>✕</button>
            </div>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>ID:</span>
                <span style={styles.detailValue}>{selectedCustomer?.id}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Name:</span>
                <span style={styles.detailValue}>{selectedCustomer?.fullName}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Email:</span>
                <span style={styles.detailValue}>{selectedCustomer?.email || '-'}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Phone:</span>
                <span style={styles.detailValue}>{selectedCustomer?.phone}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Created:</span>
                <span style={styles.detailValue}>
                  {new Date(selectedCustomer?.createdAt).toLocaleString()}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Updated:</span>
                <span style={styles.detailValue}>
                  {new Date(selectedCustomer?.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div style={styles.ordersSection}>
              <h3>Order History ({customerOrders.length})</h3>
              {customerOrders.length > 0 ? (
                <div style={styles.ordersList}>
                  {customerOrders.map(order => (
                    <div key={order.id} style={styles.orderItem}>
                      <div>
                        <strong>Order #{order.id}</strong>
                        <div style={styles.orderDate}>
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div style={styles.orderAmount}>
                        ${order.totalAmount?.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.noOrders}>No orders yet</div>
              )}
            </div>
          </div>
        </div>
      )}
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
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '24px',
  },
  backButton: {
    backgroundColor: 'white',
    color: '#007bff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  errorBanner: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px 20px',
    borderLeft: '4px solid #c33',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successBanner: {
    backgroundColor: '#efe',
    color: '#2a2',
    padding: '12px 20px',
    borderLeft: '4px solid #2a2',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeNotif: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: 'inherit',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  toolbar: {
    display: 'flex',
    gap: '15px',
    marginBottom: '30px',
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
  },
  createButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    fontSize: '18px',
    color: '#666',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  emptyText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '20px',
  },
  emptyButton: {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#333',
    borderBottom: '2px solid #dee2e6',
    fontSize: '14px',
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#495057',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  viewButton: {
    padding: '6px 10px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  editButton: {
    padding: '6px 10px',
    backgroundColor: '#ffc107',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  deleteButton: {
    padding: '6px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalContentLarge: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#999',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '10px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  deleteButtonLarge: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  warningText: {
    color: '#dc3545',
    fontSize: '14px',
    marginTop: '10px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '30px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  detailLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: '16px',
    color: '#333',
  },
  ordersSection: {
    borderTop: '1px solid #ddd',
    paddingTop: '20px',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '15px',
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  orderDate: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px',
  },
  orderAmount: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#28a745',
  },
  noOrders: {
    textAlign: 'center',
    padding: '30px',
    color: '#999',
    fontSize: '14px',
  },
};

// Add hover effects
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    button:hover:not(:disabled) {
      opacity: 0.9;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    tr:hover {
      background-color: #f8f9fa;
    }
    input:focus {
      outline: none;
      border-color: #007bff;
    }
  `;
  if (!document.querySelector('style[data-customer-styles]')) {
    styleSheet.setAttribute('data-customer-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}

export { CustomerManagement };