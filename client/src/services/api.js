import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aml_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const loginApi = (data) => API.post('/auth/login', data);
export const registerApi = (data) => API.post('/auth/register', data);

// Customer APIs
export const getCustomerByIdApi = (id) => API.get(`/customers/${id}`);
export const getAllCustomersApi = (params) => API.get('/customers', { params });

// Account APIs
export const getAccountByIdApi = (id) => API.get(`/accounts/${id}`);
export const freezeAccountApi = (id, reason) => API.put(`/accounts/${id}/freeze`, { reason });
export const unfreezeAccountApi = (id, reason) => API.put(`/accounts/${id}/unfreeze`, { reason });

// Transaction APIs
export const createTransactionApi = (data) => API.post('/transactions', data);
export const getAccountTransactionsApi = (accountId, params) => API.get(`/transactions/account/${accountId}`, { params });
export const getAllTransactionsApi = (params) => API.get('/transactions', { params });
export const getTransactionByIdApi = (id) => API.get(`/transactions/details/${id}`);

// AML APIs
export const getAmlAlertsApi = (params) => API.get('/aml/alerts', { params });
export const getAmlAlertByIdApi = (id) => API.get(`/aml/alerts/${id}`);
export const reviewAmlAlertApi = (id, data) => API.put(`/aml/alerts/${id}/review`, data);

// Dynamic AML Rules APIs
export const getAmlRulesApi = () => API.get('/aml/rules');
export const updateAmlRuleApi = (id, data) => API.put(`/aml/rules/${id}`, data);
export const toggleAmlRuleApi = (id) => API.put(`/aml/rules/${id}/toggle`);

// Dashboard Analytics APIs
export const getDashboardSummaryApi = () => API.get('/dashboard/summary');
export const getTransactionVolumeApi = () => API.get('/dashboard/transaction-volume');
export const getRiskDistributionApi = () => API.get('/dashboard/risk-distribution');
export const getAuditLogsApi = (params) => API.get('/dashboard/audit-logs', { params });

export default API;
