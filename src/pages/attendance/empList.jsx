import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmployees from '../../hooks/useEmployees';

const EmployeeList = () => {
  const { employees } = useEmployees();
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  const goToEmployees = () => {
    navigate('/admin/addemployee');
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    const valA = a[sortBy]?.toLowerCase?.() || '';
    const valB = b[sortBy]?.toLowerCase?.() || '';
    return sortOrder === 'asc'
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(employees.length / pageSize);
  return (
    <div className="container-fluid bg-gray-100 px-0">
      <div className="bg-white p-3 rounded">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold mb-6">Employee List</h2>
          <button onClick={goToEmployees} className="mb-6 bg-blue-500 text-white text-sm px-2 py-2 rounded hover:bg-indigo-700 transition">
            + Add New Employee
          </button>
        </div>

        {employees.length === 0 ? (
          <p className="text-gray-500">No employees added yet.</p>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort('employeeid')}
                  >
                    <div className="flex items-center space-x-1">
                      <span className='text-xs'>Employee ID</span>
                      <span className="flex flex-col text-xs leading-none">
                        <i className={`bx bxs-chevron-up ${sortBy === 'employeeid' && sortOrder === 'asc' ? 'text-black' : 'text-gray-400'}`}></i>
                        <i className={`bx bxs-chevron-down ${sortBy === 'employeeid' && sortOrder === 'desc' ? 'text-black' : 'text-gray-400'}`}></i>
                      </span>
                    </div>
                  </th>
                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort('firstName')}
                  >
                    <div className="flex items-center space-x-1">
                      <span className='text-xs'>Name</span>
                      <span className="flex flex-col text-xs leading-none">
                        <i className={`bx bxs-chevron-up ${sortBy === 'firstName' && sortOrder === 'asc' ? 'text-black' : 'text-gray-400'}`}></i>
                        <i className={`bx bxs-chevron-down ${sortBy === 'firstName' && sortOrder === 'desc' ? 'text-black' : 'text-gray-400'}`}></i>
                      </span>
                    </div>
                  </th>

                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort('position')}
                  >
                    <div className="flex items-center space-x-1">
                      <span className='text-xs'>Position</span>
                      <span className="flex flex-col text-xs leading-none">
                        <i className={`bx bxs-chevron-up ${sortBy === 'position' && sortOrder === 'asc' ? 'text-black' : 'text-gray-400'}`}></i>
                        <i className={`bx bxs-chevron-down ${sortBy === 'position' && sortOrder === 'desc' ? 'text-black' : 'text-gray-400'}`}></i>
                      </span>
                    </div>
                  </th>

                  <th
                    className="px-4 py-2 text-left cursor-pointer"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center space-x-1">
                      <span className='text-xs'>Department</span>
                      <span className="flex flex-col text-xs leading-none">
                        <i className={`bx bxs-chevron-up ${sortBy === 'department' && sortOrder === 'asc' ? 'text-black' : 'text-gray-400'}`}></i>
                        <i className={`bx bxs-chevron-down ${sortBy === 'department' && sortOrder === 'desc' ? 'text-black' : 'text-gray-400'}`}></i>
                      </span>
                    </div>
                  </th>
                  <th className="px-4 py-2 text-left text-xs">Phone Number</th>
                  <th className="px-4 py-2 text-left text-xs">Join Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedEmployees.map((emp, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{emp.employeeid}</td>
                    <td className="px-4 py-2 flex gap-2 items-center">
                      {emp.previewImage ? (
                        <img
                          src={emp.previewImage}
                          alt=""
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white">
                          👤
                        </div>
                      )}
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="px-4 py-2">{emp.position?.split("_")
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}</td>
                    <td className="px-4 py-2">{emp.department?.split("_")
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}</td>
                    <td className="px-4 py-2">{emp.phone}</td>
                    <td className="px-4 py-2">{emp.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
