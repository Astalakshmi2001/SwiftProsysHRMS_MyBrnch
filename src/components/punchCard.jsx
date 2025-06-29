import React, { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import useAuth from "../hooks/useAuth";
import useAttendance from "../hooks/useAttendance";
import { projects } from "../constant/data";

const AUTO_PUNCH_OUT_DELAY = 30 * 60 * 1000;

const ClockInDashboard = () => {
  const { user } = useAuth();
  const idleTimer = useRef(null);
  const { storeAttendance, getEmployeeAttendance } = useAttendance();

  const [isClockedIn, setIsClockedIn] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    let timer;
    if (isClockedIn && startTime) {
      timer = setInterval(() => {
        const now = dayjs();
        setElapsedTime(now.diff(startTime, "second"));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isClockedIn, startTime]);

  useEffect(() => {
    const savedSession = localStorage.getItem("attendanceSession");
    if (savedSession) {
      const { isClockedIn, startTime } = JSON.parse(savedSession);
      const parsedStart = dayjs(startTime);
      setIsClockedIn(isClockedIn);
      setStartTime(parsedStart);
      setElapsedTime(dayjs().diff(parsedStart, "second")); // Restore elapsed time
    }
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.employeeid) return;
      try {
        const response = await getEmployeeAttendance(user.employeeid);
        if (response?.data) {
          setAttendanceData(response.data.reverse());
        }
      } catch (error) {
        console.error("Error fetching attendance:", error.message);
      }
    };
    fetchAttendance();
  }, [user]);

  const handleClockIn = async () => {
    if (!user) return alert("User not found.");
    if (!selectedProject || !selectedShift) {
      alert("Please select both Project and Shift");
      return;
    }

    const time = dayjs();
    const formattedTime = time.format("HH:mm:ss");

    if (!isClockedIn) {
      const punchInPayload = {
        employeeId: user.employeeid,
        firstName: user.firstName,
        project: selectedProject,
        date: currentTime.format("ddd, DD MMMM YYYY"),
        shift: selectedShift,
        tracker: [
          {
            clockIn: formattedTime,
            clockOut: "--:--:--"
          }
        ]
      };

      try {
        await storeAttendance(punchInPayload);
        localStorage.setItem("attendanceSession", JSON.stringify({
          isClockedIn: true,
          startTime: time.toISOString(),
        }));

        setStartTime(time);
        setIsClockedIn(true);
        setElapsedTime(0);
        setEndTime(null);

        const updated = await getEmployeeAttendance(user.employeeid);
        setAttendanceData(updated?.data?.reverse() || []);
      } catch (error) {
        console.error("Failed to store punch-in:", error.message);
      }

    } else {
      const punchOutPayload = {
        employeeId: user?.employeeid,
        firstName: user?.firstName,
        date: currentTime.format("ddd, DD MMMM YYYY"),
        tracker: [
          {
            clockOut: formattedTime,
          },
        ],
      };

      try {
        await storeAttendance(punchOutPayload);
        localStorage.removeItem("attendanceSession");

        setEndTime(time);
        setIsClockedIn(false);
        setStartTime(null);
        setElapsedTime(null);

        const updated = await getEmployeeAttendance(user.employeeid);
        setAttendanceData(updated?.data?.reverse() || []);
      } catch (error) {
        console.error("Failed to store punch-out:", error.message);
      }
    }
  };

  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (isClockedIn && !endTime) {
        idleTimer.current = setTimeout(() => {
          console.log("⏰ Auto punch out due to inactivity");
          handleClockIn(); // auto punch out
        }, AUTO_PUNCH_OUT_DELAY);
      }
    };

    // Listen to user interactions
    const activityEvents = ["mousemove", "keydown", "mousedown", "touchstart"];
    activityEvents.forEach(event =>
      window.addEventListener(event, resetIdleTimer)
    );

    // Start initial timer
    resetIdleTimer();

    return () => {
      activityEvents.forEach(event =>
        window.removeEventListener(event, resetIdleTimer)
      );
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isClockedIn, endTime]);

  const formatElapsed = (seconds) => {
    if (seconds == null) return "--:--:--";
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-white rounded shadow-sm p-4">
          <h2 className="text-blue-500 font-bold">Hi {user?.firstName}!</h2>
          <p className="text-xs text-gray-500">Please check your attendance...</p>
          <div>
            <p className="text-[45px] text-center font-bold text-orange-400">{formatElapsed(elapsedTime)}</p>
          </div>
          <button className="mt-4 w-full border border-blue-500 text-blue-500 py-2 rounded hover:bg-blue-500 hover:text-white transition-colors">
            Apply Leave
          </button>
        </div>

        <div className="bg-white rounded shadow-sm p-4 md:col-span-2">
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-gray-700">Attendance</h4>
              <div className="flex gap-2">
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="">Select Shift</option>
                  <option value="Shift-1">Shift 1</option>
                  <option value="General">General</option>
                  <option value="Shift-2">Shift 2</option>
                </select>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="">Select Project</option>
                  {projects.map((dept) => (
                    <option key={dept.key} value={dept.key}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between my-2">
              <div>
                <p className="text-xs text-gray-400">Start Time</p>
                <p className="text-lg">
                  {startTime ? startTime.format("HH:mm:ss") : "--:--:--"}
                </p>
                <p className="text-sm text-gray-600">{currentTime.format("dddd, DD MMMM YYYY")}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">End Time</p>
                <p className="text-lg">{endTime ? endTime.format("HH:mm:ss") : "--:--:--"}</p>
              </div>
            </div>

            <div className="w-full">
              {!isClockedIn || !endTime ? (
                <button
                  onClick={handleClockIn}
                  className="w-full border border-blue-500 text-blue-500 py-2 rounded hover:bg-blue-500 hover:text-white"
                >
                  {isClockedIn ? "Punch Out" : "Punch In"}
                </button>
              ) : (
                <p className="text-center text-gray-500">You clocked out at {endTime.toLocaleTimeString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm mt-2 p-4">
        <h5 className="text-gray-700 font-semibold mb-4">Recent Attendance</h5>
        <div className="overflow-auto">
          <table className="w-full text-left border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Project</th>
                <th className="p-2">Date</th>
                <th className="p-2">Shift</th>
                <th className="p-2">Punch In</th>
                <th className="p-2">Punch Out</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length > 0 ? (
                attendanceData.map((record, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{record.project}</td>
                    <td className="p-2">{record.date}</td>
                    <td className="p-2">{record.shift}</td>
                    <td className="p-2">
                      {record.tracker?.[0]?.clockIn || "--:--:--"}
                    </td>
                    <td className="p-2">
                      {record.tracker?.[record.tracker.length - 1]?.clockOut || "--:--:--"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-2 text-center text-gray-500 italic">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClockInDashboard;