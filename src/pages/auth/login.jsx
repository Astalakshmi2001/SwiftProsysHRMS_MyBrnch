import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import sampleImage from '../../assets/sample.jpg';
import { jwtDecode } from "jwt-decode";
import { API_URL } from '../../constant/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeid: username, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setErrorMsg(data.error || 'Login failed');
        return;
      }

      const token = data.token;

      // ✅ Decode the token to get role
      const decoded = jwtDecode(token); // Not jwt_decode.default!
      const role = decoded.role;

      // ✅ Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'user') {
        navigate('/user');
      }

    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrorMsg('Something went wrong. Try again.');
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'admin') navigate('/admin');
    else if (role === 'user') navigate('/user');
  }, []);


  return (
    <div className="w-full h-screen flex p-0 m-0">
      <div
        className="w-full md:w-1/2 lg:w-3/5 h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${sampleImage})` }}
      ></div>

      <div className="w-[40%] flex justify-center items-center">
        <form onSubmit={handleLogin} className="flex flex-col items-center gap-3">
          <h3 className="text-2xl font-semibold">Login</h3>
          {errorMsg && (
            <p className="text-red-600 text-sm font-medium">{errorMsg}</p>
          )}
          <div className="relative mb-3">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-[300px] h-[50px] border border-black rounded-md text-lg px-4 bg-transparent text-black focus:outline-none focus:border-orange-500 peer"
            />
            <label
              htmlFor="username"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-[19px] transition-all peer-focus:top-0 peer-focus:text-orange-500 peer-focus:text-sm peer-valid:top-0 peer-valid:text-orange-500 peer-valid:text-sm bg-white px-1"
            >
              Username
            </label>
          </div>

          <div className="relative mb-1">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-[300px] h-[50px] border border-black rounded-md text-lg px-4 bg-transparent text-black focus:outline-none focus:border-orange-500 peer"
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-black text-[19px] transition-all peer-focus:top-0 peer-focus:text-orange-500 peer-focus:text-sm peer-valid:top-0 peer-valid:text-orange-500 peer-valid:text-sm bg-white px-1"
            >
              Password
            </label>
          </div>

          <a href="#" className="self-end text-orange-500 font-semibold text-sm">
            Forgot Password
          </a>

          <button type="submit" disabled={loading} className="w-[300px] h-[50px] bg-orange-500 text-white font-semibold rounded-md transition-transform duration-300 hover:shadow-lg disabled:opacity-60">
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* <p className="text-sm">
            Don't have an account?{" "}
            <a href="/signup" className="text-orange-500 font-semibold">
              Signup
            </a>
          </p> */}
        </form>
      </div>
    </div>
  )
}

export default Login
