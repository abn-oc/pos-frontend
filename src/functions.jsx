// API Base URL
const API_BASE_URL = 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token
const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove auth token
const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// ============================================
// AUTH FUNCTIONS
// ============================================

export const register = async (userData) => {
  const response = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  if (response.jwt) {
    setAuthToken(response.jwt);
  }
  return response;
};

export const login = async (credentials) => {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (response.jwt) {
    setAuthToken(response.jwt);
  }
  return response;
};

export const logout = () => {
  removeAuthToken();
};

// ============================================
// USER FUNCTIONS
// ============================================

export const getUserProfile = async () => {
  return apiCall('/api/user/profile');
};

export const getUserById = async (id) => {
  return apiCall(`/api/user/${id}`);
};

// ============================================
// STORE FUNCTIONS
// ============================================

export const createStore = async (storeData) => {
  return apiCall('/api/store/create', {
    method: 'POST',
    body: JSON.stringify(storeData),
  });
};

export const getAllStores = async () => {
  return apiCall('/api/store');
};

export const getStoreById = async (id) => {
  return apiCall(`/api/store/${id}`);
};

export const updateStore = async (id, storeData) => {
  return apiCall(`/api/store/${id}`, {
    method: 'PUT',
    body: JSON.stringify(storeData),
  });
};

export const deleteStore = async (id) => {
  return apiCall(`/api/store/${id}`, {
    method: 'DELETE',
  });
};

export const changeStoreStatus = async (id, status) => {
  return apiCall(`/api/store/${id}/status?status=${status}`, {
    method: 'PUT',
  });
};

export const getStoreByEmployee = async () => {
  return apiCall('/api/store/employee');
};

export const getStoreByAdmin = async () => {
  return apiCall('/api/store/admin');
};

// ============================================
// BRANCH FUNCTIONS
// ============================================

export const createBranch = async (branchData) => {
  return apiCall('/api/branches', {
    method: 'POST',
    body: JSON.stringify(branchData),
  });
};

export const getBranchById = async (id) => {
  return apiCall(`/api/branches/${id}`);
};

export const getAllBranchesByStoreId = async (storeId) => {
  return apiCall(`/api/branches/store/${storeId}`);
};

export const updateBranch = async (id, branchData) => {
  return apiCall(`/api/branches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(branchData),
  });
};

export const deleteBranch = async (id) => {
  return apiCall(`/api/branches/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// EMPLOYEE FUNCTIONS
// ============================================

export const createStoreEmployee = async (storeId, employeeData) => {
  return apiCall(`/api/employees/store/${storeId}`, {
    method: 'POST',
    body: JSON.stringify(employeeData),
  });
};

export const createBranchEmployee = async (branchId, employeeData) => {
  return apiCall(`/api/employees/branch/${branchId}`, {
    method: 'POST',
    body: JSON.stringify(employeeData),
  });
};

export const getStoreEmployees = async (storeId, userRole = null) => {
  const queryParam = userRole ? `?userRole=${userRole}` : '';
  return apiCall(`/api/employees/store/${storeId}${queryParam}`);
};

export const getBranchEmployees = async (branchId, userRole = null) => {
  const queryParam = userRole ? `?userRole=${userRole}` : '';
  return apiCall(`/api/employees/branch/${branchId}${queryParam}`);
};

export const updateEmployee = async (id, employeeData) => {
  return apiCall(`/api/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employeeData),
  });
};

export const deleteEmployee = async (id) => {
  return apiCall(`/api/employees/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// CUSTOMER FUNCTIONS
// ============================================

export const createCustomer = async (customerData) => {
  return apiCall('/api/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
};

export const getAllCustomers = async () => {
  return apiCall('/api/customers');
};

export const searchCustomers = async (query) => {
  return apiCall(`/api/customers/search?q=${encodeURIComponent(query)}`);
};

export const updateCustomer = async (id, customerData) => {
  return apiCall(`/api/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customerData),
  });
};

export const deleteCustomer = async (id) => {
  return apiCall(`/api/customers/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// CATEGORY FUNCTIONS
// ============================================

export const createCategory = async (categoryData) => {
  return apiCall('/api/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
};

export const getCategoriesByStoreId = async (storeId) => {
  return apiCall(`/api/categories/store/${storeId}`);
};

export const updateCategory = async (categoryData) => {
  return apiCall('/api/categories/{id}', {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
};

export const deleteCategory = async () => {
  return apiCall('/api/categories/{id}', {
    method: 'DELETE',
  });
};

// ============================================
// PRODUCT FUNCTIONS
// ============================================

export const createProduct = async (productData) => {
  return apiCall('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
};

export const getProductsByStoreId = async (storeId) => {
  return apiCall(`/api/products/store/${storeId}`);
};

export const searchProductsByKeyword = async (storeId, keyword) => {
  return apiCall(`/api/products/store/${storeId}/search?keyword=${encodeURIComponent(keyword)}`);
};

export const updateProduct = async (id, productData) => {
  return apiCall(`/api/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (id) => {
  return apiCall(`/api/products/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// INVENTORY FUNCTIONS
// ============================================

export const createInventory = async (inventoryData) => {
  return apiCall('/api/inventories', {
    method: 'POST',
    body: JSON.stringify(inventoryData),
  });
};

export const getInventoryByBranch = async (branchId) => {
  return apiCall(`/api/inventories/branch/${branchId}`);
};

export const getInventoryByProductAndBranch = async (branchId, productId) => {
  return apiCall(`/api/inventories/branch/${branchId}/product/${productId}`);
};

export const updateInventory = async (id, inventoryData) => {
  return apiCall(`/api/inventories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(inventoryData),
  });
};

export const deleteInventory = async (id) => {
  return apiCall(`/api/inventories/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// ORDER FUNCTIONS
// ============================================

export const createOrder = async (orderData) => {
  return apiCall('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

export const getOrderById = async (id) => {
  return apiCall(`/api/orders/${id}`);
};

export const getTodayOrdersByBranch = async (branchId) => {
  return apiCall(`/api/orders/today/branch/${branchId}`);
};

export const getRecentOrdersByBranch = async (branchId) => {
  return apiCall(`/api/orders/recent/${branchId}`);
};

export const getOrdersByCustomer = async (customerId) => {
  return apiCall(`/api/orders/customer/${customerId}`);
};

export const getOrdersByCashier = async (cashierId) => {
  return apiCall(`/api/orders/cashier/${cashierId}`);
};

export const getOrdersByBranch = async (branchId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.customerId) params.append('customerId', filters.customerId);
  if (filters.cashierId) params.append('cashierId', filters.cashierId);
  if (filters.paymentType) params.append('paymentType', filters.paymentType);
  if (filters.status) params.append('status', filters.status);
  
  const queryString = params.toString();
  return apiCall(`/api/orders/branch/${branchId}${queryString ? `?${queryString}` : ''}`);
};

// ============================================
// REFUND FUNCTIONS
// ============================================

export const createRefund = async (refundData) => {
  return apiCall('/api/refunds', {
    method: 'POST',
    body: JSON.stringify(refundData),
  });
};

export const getAllRefunds = async () => {
  return apiCall('/api/refunds');
};

export const getRefundById = async (id) => {
  return apiCall(`/api/refunds/${id}`);
};

export const getRefundsByShift = async (shiftId) => {
  return apiCall(`/api/refunds/shift/${shiftId}`);
};

export const getRefundsByCashier = async (cashierId) => {
  return apiCall(`/api/refunds/cashier/${cashierId}`);
};

export const getRefundsByCashierAndDateRange = async (cashierId, startDate, endDate) => {
  return apiCall(`/api/refunds/cashier/${cashierId}/range?start=${startDate}&end=${endDate}`);
};

export const getRefundsByBranch = async (branchId) => {
  return apiCall(`/api/refunds/branch/${branchId}`);
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export { getAuthToken, setAuthToken, removeAuthToken };