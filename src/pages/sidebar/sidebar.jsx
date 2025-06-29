import React, { useState } from "react";
import "../../App.css";
import mainlogo from "../../assets/mainlogo.png";
import logo from "../../assets/logo.png";
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Sidebar({ collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem('role'); // or get from props/context
  const basePath = role === 'admin' ? '/admin' : '/user';

  const menuItems = [
    { name: "Dashboard", icon: "bx bxs-dashboard", url: `${basePath}`, roles: ["admin"] },
    { name: "Employees", icon: "bx bx-user", url: `${basePath}/emplist`, roles: ["admin"] },
    { name: "Attendance", icon: "bx bx-calendar-event", url: role === "admin" ? `${basePath}/attendance` : `${basePath}`, roles: ["admin", "user"] },
    { name: "Reports", icon: "bx bx-bar-chart-alt-2", url: `${basePath}/attendancereport`, roles: ["admin"] },
    { name: "Logout", icon: "bx bx-log-out-circle", url: null, roles: ["admin", "user"] },
  ];
  const visibleMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <div
      className={`flex flex-col bg-white border-r transition-all duration-300 ${collapsed ? "p-2 w-[70px]" : "p-2 w-[250px]"
        } h-[100vh]`}
    >
      {!collapsed ? (
        <div className="w-[200px] h-[50px]">
          <img src={mainlogo} alt="SwiftProsys" className="w-full h-full" />
        </div>
      ) : (
        <div className="w-[50px] h-[45px]">
          <img src={logo} alt="SwiftProsys" className="w-full h-full" />
        </div>
      )}
      <ul className="flex flex-col grow px-2 my-3">
        {visibleMenu.map((item, index) => {
          const isActive = location.pathname === item.url;

          return (
            <li className="mb-2" key={index}>
              {item.url ? (
                <Link
                  to={item.url}
                  className={`flex items-center p-2 no-underline rounded-md transition-colors
                  ${isActive ? 'bg-maincolor text-white' : 'text-gray-800 hover:bg-maincolor hover:text-white'}`}
                >
                  <i className={`${item.icon} text-xl me-2`}></i>
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    navigate('/login'); // redirect to login
                  }}
                  className="flex items-center w-full p-2 text-left no-underline text-gray-800 rounded-md hover:bg-maincolor hover:text-white transition-colors"
                >
                  <i className={`${item.icon} text-xl me-2`}></i>
                  {!collapsed && <span>{item.name}</span>}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {!collapsed && (
        <div className="text-xs text-gray-500 text-center px-2 py-3">
          <hr className="my-2" />
          Swift Prosys © 2025 HRM
        </div>
      )}
    </div>
  );
}

export default Sidebar
