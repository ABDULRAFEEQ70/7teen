import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Hospital Management System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.firstName} {user?.lastName} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Simple navigation */}
      <nav className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-12 items-center">
            <a href="/dashboard" className="text-white hover:text-primary-200">Dashboard</a>
            {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse' || user?.role === 'receptionist') && (
              <a href="/patients" className="text-white hover:text-primary-200">Patients</a>
            )}
            <a href="/doctors" className="text-white hover:text-primary-200">Doctors</a>
            <a href="/appointments" className="text-white hover:text-primary-200">Appointments</a>
            {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'nurse') && (
              <a href="/medical-records" className="text-white hover:text-primary-200">Medical Records</a>
            )}
            {(user?.role === 'admin' || user?.role === 'nurse') && (
              <a href="/inventory" className="text-white hover:text-primary-200">Inventory</a>
            )}
            {(user?.role === 'admin' || user?.role === 'receptionist') && (
              <a href="/billing" className="text-white hover:text-primary-200">Billing</a>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;