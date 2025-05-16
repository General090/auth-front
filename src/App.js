import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Configure axios
axios.defaults.baseURL = "https://auth-back-1-qdb6.onrender.com";
axios.defaults.withCredentials = true;

export const AuthContext = React.createContext();

function Register() {
  const { setAuthState } = React.useContext(AuthContext);
  const [formData, setFormData] = React.useState({ username: '', email: '', password: '' });
  const [message, setMessage] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/register', formData);
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
      setMessage(error.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={e => setFormData({ ...formData, username: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={e => setFormData({ ...formData, password: e.target.value })}
      />
      <button type="submit">Register</button>
      <p>{message}</p>
    </form>
  );
}

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true
  });

  // Check auth status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
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
        <nav>
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
                setAuthState({ isAuthenticated: false, user: null, token: null });
              }}>Logout</button>
            </>
          )}
        </nav>

        <Routes>
          <Route path="/register" element={<Register />} />
          {/* Add Login, Profile components similarly */}
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}


export default App;