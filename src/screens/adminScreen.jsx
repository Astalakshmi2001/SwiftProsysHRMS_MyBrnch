import React, { useState } from 'react';
import Header from '../pages/header/header';
import Sidebar from '../pages/sidebar/sidebar';
import { Outlet } from 'react-router-dom';

function AdminScreen() {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed((prev) => !prev);
  return (
    <div className="w-full h-screen bg-gray-100">
      <Header collapsed={collapsed} toggleSidebar={toggleSidebar} />

      <div className="flex">
        <div className="fixed top-0 left-0 overflow-y-auto">
          <Sidebar collapsed={collapsed} />
        </div>

        <div className={`flex-grow mt-[60px] h-[calc(100vh-60px)] overflow-y-auto p-2 transition-all duration-300 ${collapsed ? "ml-[70px]" : "ml-[250px]"}`}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminScreen
