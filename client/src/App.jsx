import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerAccount from './pages/customer/Account';
import CustomerTransactions from './pages/customer/Transactions';
import CustomerStatement from './pages/customer/Statement';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeCustomers from './pages/employee/Customers';
import EmployeeTransactions from './pages/employee/Transactions';
import EmployeeAlerts from './pages/employee/Alerts';
import AlertDetails from './pages/employee/AlertDetails';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminAmlRules from './pages/admin/AmlRules';
import AdminAuditLogs from './pages/admin/AuditLogs';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Portal Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/account" element={<CustomerAccount />} />
            <Route path="/customer/transactions" element={<CustomerTransactions />} />
            <Route path="/customer/statement" element={<CustomerStatement />} />
          </Route>

          {/* Employee Compliance Portal Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']} />}>
            <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="/employee/customers" element={<EmployeeCustomers />} />
            <Route path="/employee/transactions" element={<EmployeeTransactions />} />
            <Route path="/employee/alerts" element={<EmployeeAlerts />} />
            <Route path="/employee/alerts/:id" element={<AlertDetails />} />
          </Route>

          {/* Admin System Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/aml-rules" element={<AdminAmlRules />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
