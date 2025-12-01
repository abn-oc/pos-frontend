import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProductsByStoreId,
  searchProductsByKeyword,
  searchCustomers,
  createCustomer,
  createOrder,
  getInventoryByProductAndBranch
} from '../functions';

const POS = ({ user }) => {
  const navigate = useNavigate();
  
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [paymentType, setPaymentType] = useState('CASH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New customer form
  const [newCustomer, setNewCustomer] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      if (user?.storeId) {
        const data = await getProductsByStoreId(user.storeId);
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (err) {
      setError('Failed to load products: ' + err.message);
    }
  };

  // Search products
  const handleProductSearch = async (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredProducts(products);
      return;
    }

    try {
      if (user?.storeId) {
        const results = await searchProductsByKeyword(user.storeId, term);
        setFilteredProducts(results);
      }
    } catch (err) {
      setFilteredProducts(products.filter(p => 
        p.name.toLowerCase().includes(term.toLowerCase()) ||
        p.skuId?.toLowerCase().includes(term.toLowerCase())
      ));
    }
  };

  // Add product to cart
  const addToCart = async (product) => {
    // Check inventory if branchId available
    if (user?.branchId) {
      try {
        const inventory = await getInventoryByProductAndBranch(user.branchId, product.id);
        if (inventory.quantity <= 0) {
          setError('Product out of stock');
          setTimeout(() => setError(''), 3000);
          return;
        }
      } catch (err) {
        console.warn('Could not check inventory:', err);
      }
    }

    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        product: product,
        quantity: 1,
        price: product.sellingPrice
      }]);
    }
  };

  // Update cart item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Search customers
  const handleCustomerSearch = async (term) => {
    setCustomerSearch(term);
    if (term.length < 2) {
      setCustomerResults([]);
      return;
    }

    try {
      const results = await searchCustomers(term);
      setCustomerResults(results);
    } catch (err) {
      setError('Failed to search customers: ' + err.message);
    }
  };

  // Select customer
  const selectCustomer = (cust) => {
    setCustomer(cust);
    setShowCustomerModal(false);
    setCustomerSearch('');
    setCustomerResults([]);
  };

  // Create new customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const created = await createCustomer(newCustomer);
      setCustomer(created);
      setShowNewCustomerModal(false);
      setNewCustomer({ fullName: '', email: '', phone: '' });
      setSuccess('Customer created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create customer: ' + err.message);
    }
  };

  // Complete order
  const completeOrder = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!customer) {
      setError('Please select a customer');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerId: customer.id,
        branchId: user.branchId,
        paymentType: paymentType,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const order = await createOrder(orderData);
      
      // Clear cart and show success
      setCart([]);
      setCustomer(null);
      setSuccess(`Order #${order.id} completed successfully! Total: $${order.totalAmount.toFixed(2)}`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to complete order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Point of Sale</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Notifications */}
      {error && <div style={styles.errorBanner}>{error}</div>}
      {success && <div style={styles.successBanner}>{success}</div>}

      <div style={styles.mainContent}>
        {/* Left Side - Products */}
        <div style={styles.leftPanel}>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => handleProductSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.productGrid}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                style={styles.productCard}
                onClick={() => addToCart(product)}
              >
                <div style={styles.productName}>{product.name}</div>
                <div style={styles.productBrand}>{product.brand}</div>
                <div style={styles.productPrice}>${product.sellingPrice.toFixed(2)}</div>
                <div style={styles.productSku}>SKU: {product.skuId}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Cart */}
        <div style={styles.rightPanel}>
          {/* Customer Selection */}
          <div style={styles.customerSection}>
            <div style={styles.sectionTitle}>Customer</div>
            {customer ? (
              <div style={styles.selectedCustomer}>
                <div>
                  <strong>{customer.fullName}</strong>
                  <div style={styles.customerInfo}>{customer.phone}</div>
                  <div style={styles.customerInfo}>{customer.email}</div>
                </div>
                <button
                  onClick={() => setCustomer(null)}
                  style={styles.removeButton}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div style={styles.customerButtons}>
                <button
                  onClick={() => setShowCustomerModal(true)}
                  style={styles.selectButton}
                >
                  Select Customer
                </button>
                <button
                  onClick={() => setShowNewCustomerModal(true)}
                  style={styles.newButton}
                >
                  New Customer
                </button>
              </div>
            )}
          </div>

          {/* Cart Items */}
          <div style={styles.cartSection}>
            <div style={styles.sectionTitle}>Cart ({cart.length})</div>
            <div style={styles.cartItems}>
              {cart.length === 0 ? (
                <div style={styles.emptyCart}>Cart is empty</div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} style={styles.cartItem}>
                    <div style={styles.cartItemInfo}>
                      <div style={styles.cartItemName}>{item.product.name}</div>
                      <div style={styles.cartItemPrice}>
                        ${item.price.toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                    <div style={styles.cartItemControls}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={styles.qtyButton}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                        style={styles.qtyInput}
                        min="1"
                      />
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={styles.qtyButton}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        style={styles.removeButton}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={styles.cartItemTotal}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Type */}
          <div style={styles.paymentSection}>
            <div style={styles.sectionTitle}>Payment Method</div>
            <div style={styles.paymentButtons}>
              {['CASH', 'CARD', 'ONLINE'].map(type => (
                <button
                  key={type}
                  onClick={() => setPaymentType(type)}
                  style={{
                    ...styles.paymentButton,
                    ...(paymentType === type ? styles.paymentButtonActive : {})
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Total and Checkout */}
          <div style={styles.totalSection}>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total:</span>
              <span style={styles.totalAmount}>${calculateTotal().toFixed(2)}</span>
            </div>
            <button
              onClick={completeOrder}
              disabled={loading || cart.length === 0 || !customer}
              style={styles.checkoutButton}
            >
              {loading ? 'Processing...' : 'Complete Order'}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Search Modal */}
      {showCustomerModal && (
        <div style={styles.modal} onClick={() => setShowCustomerModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Select Customer</h2>
              <button onClick={() => setShowCustomerModal(false)} style={styles.closeButton}>✕</button>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={customerSearch}
              onChange={(e) => handleCustomerSearch(e.target.value)}
              style={styles.modalInput}
              autoFocus
            />
            <div style={styles.customerList}>
              {customerResults.map(cust => (
                <div
                  key={cust.id}
                  style={styles.customerItem}
                  onClick={() => selectCustomer(cust)}
                >
                  <div><strong>{cust.fullName}</strong></div>
                  <div style={styles.customerInfo}>{cust.phone}</div>
                  <div style={styles.customerInfo}>{cust.email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {showNewCustomerModal && (
        <div style={styles.modal} onClick={() => setShowNewCustomerModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>New Customer</h2>
              <button onClick={() => setShowNewCustomerModal(false)} style={styles.closeButton}>✕</button>
            </div>
            <form onSubmit={handleCreateCustomer} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  value={newCustomer.fullName}
                  onChange={(e) => setNewCustomer({...newCustomer, fullName: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone *</label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  style={styles.input}
                />
              </div>
              <button type="submit" style={styles.submitButton}>Create Customer</button>
            </form>
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
  },
  successBanner: {
    backgroundColor: '#efe',
    color: '#2a2',
    padding: '12px 20px',
    borderLeft: '4px solid #2a2',
  },
  mainContent: {
    display: 'flex',
    height: 'calc(100vh - 64px)',
  },
  leftPanel: {
    flex: 2,
    padding: '20px',
    overflowY: 'auto',
  },
  rightPanel: {
    flex: 1,
    backgroundColor: 'white',
    borderLeft: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '400px',
  },
  searchBox: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  },
  productCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: '14px',
  },
  productBrand: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px',
  },
  productPrice: {
    fontSize: '18px',
    color: '#007bff',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  productSku: {
    fontSize: '11px',
    color: '#999',
  },
  customerSection: {
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#666',
    textTransform: 'uppercase',
  },
  selectedCustomer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f0f8ff',
    borderRadius: '4px',
  },
  customerInfo: {
    fontSize: '12px',
    color: '#666',
  },
  customerButtons: {
    display: 'flex',
    gap: '10px',
  },
  selectButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  newButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  cartSection: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    borderBottom: '1px solid #eee',
  },
  cartItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  emptyCart: {
    textAlign: 'center',
    color: '#999',
    padding: '40px 20px',
  },
  cartItem: {
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cartItemInfo: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  cartItemPrice: {
    fontSize: '12px',
    color: '#666',
  },
  cartItemControls: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
  },
  qtyButton: {
    width: '30px',
    height: '30px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  qtyInput: {
    width: '50px',
    padding: '5px',
    textAlign: 'center',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  removeButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  cartItemTotal: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#007bff',
    textAlign: 'right',
  },
  paymentSection: {
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  paymentButtons: {
    display: 'flex',
    gap: '10px',
  },
  paymentButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f0f0f0',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  paymentButtonActive: {
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff',
  },
  totalSection: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  totalLabel: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#007bff',
  },
  checkoutButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
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
    padding: '20px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
  },
  modalInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '15px',
    boxSizing: 'border-box',
  },
  customerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  customerItem: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
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
    div[style*="productCard"]:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
    }
    div[style*="customerItem"]:hover {
      background-color: #f0f8ff;
    }
  `;
  if (!document.querySelector('style[data-pos-styles]')) {
    styleSheet.setAttribute('data-pos-styles', 'true');
    document.head.appendChild(styleSheet);
  }
}

export { POS };