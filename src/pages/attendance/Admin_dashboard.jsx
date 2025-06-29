import React, { useEffect, useState } from 'react';
import dayjs from "dayjs";
import useEmployees from '../../hooks/useEmployees';
import useAttendance from '../../hooks/useAttendance';
import ModernBarGraph from '../../components/ModernBarGraph';

const shiftConfig = {
  general: ["08:30", "09:00", "09:30", "10:00"],
  "shift-1": ["06:00", "07:00"],
  "shift-2": ["13:00", "14:00"]
};

const setStatus = (data) => {
  return data.map((item) => {
    const shift = item.shift?.toLowerCase();
    const shiftTimes = shiftConfig[shift];
    const firstClockIn = item.tracker?.[0]?.clockIn;

    if (!shiftTimes || !firstClockIn) {
      return { ...item, status: "Unknown" };
    }

    const clockIn = dayjs(firstClockIn, "HH:mm:ss");

    const isOnTime = shiftTimes.some((shiftTimeStr) => {
      const shiftStart = dayjs(shiftTimeStr, "HH:mm");
      const graceStart = shiftStart.subtract(10, "minute");
      const graceEnd = shiftStart.add(5, "minute");
      return clockIn.isAfter(graceStart) && clockIn.isBefore(graceEnd.add(1, "second"));
    });

    return {
      ...item,
      status: isOnTime ? "On time" : "Late"
    };
  });
};

const AdminDashboard = () => {
  const { employees } = useEmployees();
  const { getAllAttendance } = useAttendance();
  const [attendanceData, setAttendanceData] = useState([]);
  const [departmentAttendance, setDepartmentAttendance] = useState([]);
  const [presentCount, setPresentCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllAttendance();
        setAttendanceData(data?.data || []);

        const today = dayjs().format("YYYY-MM-DD");

        // filter today's attendance
        const todayRecords = data.data.filter(
          (item) => dayjs(item.date).format("YYYY-MM-DD") === today
        );

        // present = has at least one non-empty clockIn
        const present = new Set();
        todayRecords.forEach((entry) => {
          const hasClockIn = entry.tracker?.some(t => t.clockIn && t.clockIn !== "--:--:--");
          if (hasClockIn) {
            present.add(entry.employeeId);
          }
        });

        setPresentCount(present.size);

        if (employees?.length) {
          const allEmployeeIds = new Set(employees.map(e => e.employeeid));
          const leaveCount = [...allEmployeeIds].filter(id => !present.has(id)).length;
          setLeaveCount(leaveCount);
        }
        const departmentMap = {};

        employees.forEach(emp => {
          const dept = emp.department || "Unassigned";
          if (!departmentMap[dept]) {
            departmentMap[dept] = { name: dept, present: 0, total: 0 };
          }

          departmentMap[dept].total += 1;
        });

        const countedDeptEmployees = new Set();

        todayRecords.forEach((entry) => {
          const hasClockIn = entry.tracker?.some(
            (t) => t.clockIn && t.clockIn !== "--:--:--"
          );

          if (hasClockIn) {
            const emp = employees.find(
              (e) => String(e.employeeid) === String(entry.employeeId) // ✅ FIXED
            );

            if (!emp) {
              console.warn("❌ Could not find employee for:", entry.employeeId); // ✅ FIXED
              return;
            }

            const empId = emp.employeeid;
            if (countedDeptEmployees.has(empId)) return;
            countedDeptEmployees.add(empId);

            const dept = emp.department?.trim() || "Unassigned";

            if (departmentMap[dept]) {
              departmentMap[dept].present += 1;
              console.log(`✅ Counted ${empId} in dept: ${dept}`);
            } else {
              console.warn("❗Department not initialized for:", dept);
            }
          }
        });

        const enrichedTodayRecords = setStatus(todayRecords);

        // Count late arrivals
        const lateArrivals = enrichedTodayRecords.filter(entry => entry.status === "Late");
        setLateCount(lateArrivals.length);
        // Convert to array with percentage & color
        const colorClasses = [
          "bg-green-500", "bg-blue-500", "bg-purple-500",
          "bg-yellow-500", "bg-pink-500", "bg-indigo-500"
        ];

        const deptStats = Object.values(departmentMap).map((dept, index) => ({
          ...dept,
          percentage: Math.round((dept.present / dept.total) * 100),
          color: colorClasses[index % colorClasses.length]
        }));

        setDepartmentAttendance(deptStats);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [getAllAttendance, employees]);

  const stats = [
    { title: "Total Employees", value: employees?.length || 0, icon: "bx-group", trend: "+5% from last month", color: "bg-blue-100 text-blue-600" },
    { title: "Present Today", value: presentCount, icon: "bx-check-circle", trend: `${Math.round((presentCount / (employees?.length || 1)) * 100)}% attendance`, color: "bg-green-100 text-green-600" },
    { title: "On Leave", value: leaveCount, icon: "bx-calendar-x", trend: leaveCount > 0 ? `${leaveCount} not clocked in` : "Full attendance", color: "bg-yellow-100 text-yellow-600" },
    { title: "Late Arrivals", value: lateCount, icon: "bx-time-five", trend: `${Math.round((lateCount / (presentCount || 1)) * 100)}% of present`, color: "bg-red-100 text-red-600" }
  ];

  // const recentActivity = [
  //   { employee: "John Doe", action: "Checked in late", time: "10 min ago", avatar: "https://i.pravatar.cc/150?img=5" },
  //   { employee: "Jane Smith", action: "Submitted leave request", time: "25 min ago", avatar: "https://i.pravatar.cc/150?img=11" },
  //   { employee: "Robert Johnson", action: "Updated profile", time: "1 hour ago", avatar: "https://i.pravatar.cc/150?img=8" }
  // ];

  return (
    <div className="p-2">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <p className={`text-sm ${stat.color.replace('bg-', 'text-')} mt-1`}>
                  {stat.trend}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <i className={`bx ${stat.icon} text-2xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Overview */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Attendance Overview</h3>
            <select className="border rounded px-3 py-1 text-sm">
              <option>Last 7 Days</option>
              <option>Last Month</option>
              <option>Last Quarter</option>
            </select>
          </div>
          <div className="rounded flex items-center justify-start">
            <ModernBarGraph data={departmentAttendance} orientation="vertical" />
          </div>
        </div>

        {/* Recent Activity */}
        {/* <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start">
                <img src={activity.avatar} alt="User" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <p className="font-medium">{activity.employee}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* Department Attendance */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Department Attendance</h3>
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Department</th>
                <th className="text-left py-3 px-4">Present</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Percentage</th>
                <th className="text-left py-3 px-4">Progress</th>
              </tr>
            </thead>
            <tbody>
              {departmentAttendance.map((dept, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{dept.name?.split("_")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}</td>
                  <td className="py-3 px-4">{dept.present}</td>
                  <td className="py-3 px-4">{dept.total}</td>
                  <td className="py-3 px-4">{dept.percentage}%</td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${dept.color} h-2 rounded-full`}
                        style={{ width: `${dept.percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

const DepartmentAttendanceBarGraph = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-md font-semibold mb-4">Department-wise Attendance</h3>
      <div className="space-y-4">
        {data.map((dept, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {dept.name
                  ?.split("_")
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
              <span className="text-sm text-gray-500">{dept.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div
                className={`${dept.color} h-full rounded-full`}
                style={{ width: `${dept.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
