import React, { useEffect, useState } from "react";
import useAttendance from '../../hooks/useAttendance';
import dayjs from 'dayjs';
import AdminDashboard from "./Admin_dashboard";

export default function AttendanceTable() {
  const { getAllAttendance } = useAttendance();
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllAttendance();
        const enrichedData = setStatus(data?.data || []);
        setAttendanceData(enrichedData);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      }
    };

    fetchData();
  }, [getAllAttendance]);

  const shiftConfig = {
    general: ["08:30", "09:00", "09:30", "10:00"],
    "shift-1": ["06:00", "07:00"],
    "shift-2": ["13:00", "14:00"]
  };

  const setStatus = (data) => {
    return data.map((item) => {
      const shift = item.shift?.toLowerCase();
      const shiftTimes = shiftConfig[shift];

      // Get first clock-in time
      const firstClockIn = item.tracker?.[0]?.clockIn;

      if (!shiftTimes || !firstClockIn) {
        return { ...item, status: "Unknown" };
      }

      const clockIn = dayjs(firstClockIn, "HH:mm:ss");

      // Compare clockIn to all valid shift start times
      const isOnTime = shiftTimes.some((shiftTimeStr) => {
        const shiftStart = dayjs(shiftTimeStr, "HH:mm");
        const graceStart = shiftStart.subtract(10, "minute"); // early window
        const graceEnd = shiftStart.add(5, "minute");         // late grace

        return clockIn.isAfter(graceStart) && clockIn.isBefore(graceEnd.add(1, "second"));
      });

      return {
        ...item,
        status: isOnTime ? "On time" : "Late"
      };
    });
  };

  return (
    <div className="container-fluid bg-gray-100 px-0">
      <div className="bg-white p-3 rounded">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl">Daily Attendance Report</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="border px-3 py-1 rounded text-sm"
            />
          </div>
        </div>

        <table className="w-full table-auto text-sm border border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Date</th>
              <th className="border px-3 py-2 text-left">Employee ID</th>
              <th className="border px-3 py-2 text-left">Name</th>
              <th className="border px-3 py-2 text-left">Shift</th>
              <th className="border px-3 py-2 text-left">Punch In</th>
              <th className="border px-3 py-2 text-left">Punch Out</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{item.date}</td>
                <td className="border px-3 py-2">{item.employeeId}</td>
                <td className="border px-3 py-2">{item.firstName}</td>
                <td className="border px-3 py-2">
                  <div className="flex justify-between items-center">
                    <span>{item.shift}</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-white text-xs ${item.status === "Late" ? "bg-red-500" : "bg-blue-500"}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </td>
                <td className="border px-3 py-2">{item.tracker?.[0]?.clockIn || "--:--:--"}</td>
                <td className="border px-3 py-2">{item.tracker?.[item.tracker.length - 1]?.clockOut || "--:--:--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}