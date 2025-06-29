import React, { useState } from 'react';
import { departmentPositionMap, departments } from '../../constant/data';
import { Link } from 'react-router-dom';
import { API_URL } from '../../constant/api';

const AddEmployee = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [employee, setEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    department: '',
    phone: '',
    employeeid: '',
    password: '',
    profileImage: null,
    previewImage: '',
    joinDate: '',
    role: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "department" ? { position: "" } : {})
    }));
  };

  const availablePositions = departmentPositionMap[employee.department] || [];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEmployee(prev => ({
        ...prev,
        profileImage: file,
        previewImage: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
      });

      if (!response.ok) {
        throw new Error('Failed to add employee');
      }

      const data = await response.json();

      setSuccessMessage(data.message || 'Employee added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      console.log('Token:', data.token);

      setEmployee({
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        department: '',
        phone: '',
        employeeid: '',
        password: '',
        profileImage: null,
        previewImage: '',
        joinDate: '',
        role: ''
      });

      onAddEmployee?.({ id: Date.now(), ...employee });

    } catch (err) {
      console.error('Error submitting employee:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid bg-gray-100 px-0">
      <div className="bg-white p-3 rounded">
        <Link to="/emplist" className="mb-6 text-indigo-600 text-decoration-none">
          ← Back to Employee List
        </Link>
        <h2 className="text-2xl font-bold mb-6 mt-6">Add New Employee</h2>
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="firstName"
              value={employee.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <input
              name="lastName"
              value={employee.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <input
              name="email"
              value={employee.email}
              onChange={handleChange}
              type="email"
              placeholder="Email"
              className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="department"
              value={employee.department}
              onChange={handleChange}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.key} value={dept.key}>
                  {dept.label}
                </option>
              ))}
            </select>
            <select
              name="position"
              value={employee.position}
              onChange={handleChange}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            >
              <option value="">Select Position</option>
              {availablePositions.map((dept) => (
                <option key={dept.key} value={dept.key}>
                  {dept.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="phone"
              value={employee.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="employeeid"
              value={employee.employeeid}
              onChange={handleChange}
              placeholder="Employee ID/Username"
              className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <div className="relative w-full">
              <input
                name="password"
                value={employee.password}
                onChange={handleChange}
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                className="w-full border border-gray-300 px-4 py-2 pr-10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
              <span
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} text-xl`}></i>
              </span>
            </div>
            <select
              name="role"
              value={employee.role}
              onChange={handleChange}
              className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-gray-700">Joining Date</span>
              <input
                type="date"
                name="joinDate"
                value={employee.joinDate}
                onChange={handleChange}
                className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-6">
              <label className="block">
                <span className="text-gray-700">Profile Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full cursor-pointer mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                />
              </label>
              {employee.previewImage && (
                <img
                  src={employee.previewImage}
                  alt="Preview"
                  className="w-[80px] h-[80px] ring-2 ring-indigo-500 object-cover"
                />
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-[250px] h-[45px] bg-blue-500 text-white py-2 mt-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
          >
            {isSubmitting ? 'Submitting...' : 'Add Employee'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
