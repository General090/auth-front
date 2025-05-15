import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Configure axios
axios.defaults.baseURL = "https://auth-back-1-qdb6.onrender.com";
axios.defaults.withCredentials = true;

// Auth context
const AuthContext = React.createContext();

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true
  });

  // Check auth status on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
      // Verify token is still valid
      axios.get('/profile/' + user.id, {
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
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false
        });
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  if (authState.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      <Router>
        <div className="container">
          <nav className="navbar">
            <Link to="/">Home</Link>
            {!authState.isAuthenticated ? (
              <>
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>
              </>
            ) : (
              <>
                <Link to="/profile">Profile</Link>
                <button onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setAuthState({
                    isAuthenticated: false,
                    user: null,
                    token: null
                  });
                }}>Logout</button>
              </>
            )}
          </nav>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

// [Keep your Home, Register, Login, Profile components with these changes below]

// In Register and Login components:
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('/api/register', formData); // Changed to relative path
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify({
      id: response.data.userId,
      username: response.data.username
    }));
    setAuthState({
      isAuthenticated: true,
      user: {
        id: response.data.userId,
        username: response.data.username
      },
      token: response.data.token
    });
    navigate('/profile');
  } catch (error) {
    setMessage(error.response?.data?.message || 
      error.message || 
      'Registration failed. Please try again.');
  }
};

// In Profile component:
const fetchProfile = async () => {
  try {
    const response = await axios.get(`/api/profile/${authState.user.id}`, {
      headers: {
        Authorization: `Bearer ${authState.token}`
      }
    });
    setProfile(response.data);
    setFormData({
      username: response.data.username,
      email: response.data.email,
      password: ''
    });
  } catch (error) {
    if (error.response?.status === 401) {
      // Token expired - force logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthState({
        isAuthenticated: false,
        user: null,
        token: null
      });
    }
    setMessage(error.response?.data?.message || 'Error loading profile');
  }
};