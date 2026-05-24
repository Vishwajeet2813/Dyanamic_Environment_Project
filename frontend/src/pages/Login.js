import React, { useState } from 'react';
import { login, register } from '../services/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = isLogin 
        ? await login({ email: form.email, password: form.password })
        : await register(form);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🚀 Dev Platform</h1>
        <h2 style={styles.subtitle}>{isLogin ? 'Login' : 'Register'}</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              style={styles.input}
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
            />
          )}
          <input
            style={styles.input}
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({...form, email: e.target.value})}
          />
          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})}
          />
          <button style={styles.button} type="submit">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <hr style={{margin: '20px 0'}}/>

        <a href="http://localhost:5000/api/auth/github" style={styles.githubBtn}>
          🐙 Login with GitHub
        </a>

        <p 
          style={styles.toggle}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Account nahi hai? Register karo" : "Already registered? Login karo"}
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '400px'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '5px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  githubBtn: {
    display: 'block',
    textAlign: 'center',
    padding: '12px',
    backgroundColor: '#333',
    color: 'white',
    borderRadius: '5px',
    textDecoration: 'none',
    fontSize: '16px'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '10px'
  },
  toggle: {
    textAlign: 'center',
    marginTop: '15px',
    color: '#4CAF50',
    cursor: 'pointer'
  }
};

export default Login;