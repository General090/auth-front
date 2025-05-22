import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Configure axios
axios.defaults.baseURL = 'https://auth-back-w4gd.onrender.com';
axios.defaults.withCredentials = true;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthContext = React.createContext();

function Register() {
  const { setAuthState } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setAuthState({
        isAuthenticated: true,
        user: response.data.user,
        token: response.data.token
      });
      navigate('/profile');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-4 text-center">Register</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-3 p-2 border rounded"
          value={formData.username}
          onChange={e => setFormData({ ...formData, username: e.target.value })}
          required
          minLength="3"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          className="w-full mb-4 p-2 border rounded"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          required
          minLength="6"
        />
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
          Register
        </button>
        {message && <p className="text-red-500 mt-3 text-center">{message}</p>}
      </form>
    </div>
  );
}

function Login() {
  const { setAuthState } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId',  JSON.stringify(response.data.userId));
      localStorage.setItem('username',  JSON.stringify(response.data.username));
      setAuthState({
        isAuthenticated: true,
        userId: response.data.userId,
        token: response.data.token,
        username: response.data.username
      });
      navigate('/profile');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed.');
    }

    
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-3 p-2 border rounded"
          value={formData.username}
          onChange={e => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          value={formData.password}
          onChange={e => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">
          Login
        </button>
        {message && <p className="text-red-500 mt-3 text-center">{message}</p>}
      </form>
    </div>
  );
}

function Profile({ handleLogout }) {
  const { authState } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (authState.user) {
      axios.get(`/api/profile/${authState.user.id}`)
        .then(res => {
          setProfileData({
            username: res.data.username,
            email: res.data.email,
            password: ''
          });
        })
        .catch(() => setMessage('Failed to load profile.'));
    }
  }, [authState.user]);

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/profile/${authState.userId}`, profileData);
      setMessage('Profile updated successfully!');
      setProfileData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setMessage('Error updating profile.');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/profile/${authState.User}`);
      handleLogout();
      navigate('/register');
    } catch (err) {
      setMessage('Error deleting account.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold mb-4 text-center">Profile</h2>
        <input
          type="text"
          className="w-full mb-3 p-2 border rounded"
          value={profileData.username}
          onChange={e => setProfileData({ ...profileData, username: e.target.value })}
          placeholder="Username"
        />
        <input
          type="email"
          className="w-full mb-3 p-2 border rounded"
          value={profileData.email}
          onChange={e => setProfileData({ ...profileData, email: e.target.value })}
          placeholder="Email"
        />
        <input
          type="password"
          className="w-full mb-4 p-2 border rounded"
          value={profileData.password}
          onChange={e => setProfileData({ ...profileData, password: e.target.value })}
          placeholder="New Password (leave empty to keep current)"
        />
        <button onClick={handleUpdate} className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded mb-2">
          Save Changes
        </button>
        <button onClick={handleLogout} className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded mb-2">
          Logout
        </button>
        <button onClick={handleDelete} className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded">
          Delete Account
        </button>
        {message && <p className="text-center mt-3 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to AuthApp</h1>
        <p className="mb-4">Please register or login to continue</p>
        <div className="space-x-4">
          <Link to="/register" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Register</Link>
          <Link to="/login" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Login</Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setAuthState({ isAuthenticated: false, user: null, token: null });
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    let user = null;
  
    try {
      if (userData && userData !== "undefined") {
        user = JSON.parse(userData);
      }
    } catch (err) {
      console.error("Invalid user data in localStorage:", err);
      localStorage.removeItem("user");
    }
  
    if (token && user) {
      axios.get(`http://localhost:5000/api/profile/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => {
          setAuthState({
            isAuthenticated: true,
            user,
            token,
            isLoading: false
          });
        })
        .catch((err) => {
          console.error("Token invalid or user fetch failed:", err);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false
          });
          navigate('/');
        });
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false
      });
      navigate('/');
    }
  }, []);
  

  if (authState.isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-lg font-bold text-blue-600">AuthApp</Link>
        <div className="space-x-4">
          {!authState.isAuthenticated ? (
            <>
              <Link to="/register" className="text-gray-700 hover:text-blue-600">Register</Link>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="text-gray-700 hover:text-blue-600 cursor-pointer">Profile</Link>
              <button
                onClick={handleLogout}
                className="text-red-300 hover:text-red-700 cursor-pointer"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile handleLogout={handleLogout} />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
