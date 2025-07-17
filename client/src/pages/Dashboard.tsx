import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to the Hospital Management System, {user?.firstName}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Patients</h3>
            <p className="text-3xl font-bold text-primary-600">150</p>
            <p className="text-sm text-gray-500">Total registered</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
            <p className="text-3xl font-bold text-success-600">12</p>
            <p className="text-sm text-gray-500">Today</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Doctors</h3>
            <p className="text-3xl font-bold text-warning-600">8</p>
            <p className="text-sm text-gray-500">On duty</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
            <p className="text-3xl font-bold text-danger-600">$12,450</p>
            <p className="text-sm text-gray-500">This month</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Appointments</h3>
          </div>
          <div className="card-body">
            <p className="text-gray-500">No recent appointments to display.</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              <button className="btn btn-primary w-full">Schedule Appointment</button>
              <button className="btn btn-secondary w-full">Add Patient</button>
              <button className="btn btn-success w-full">View Inventory</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;