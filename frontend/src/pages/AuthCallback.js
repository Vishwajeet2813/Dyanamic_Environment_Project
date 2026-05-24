import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div style={{textAlign: 'center', marginTop: '100px'}}>
      <h2>🔄 Logging in...</h2>
    </div>
  );
};

export default AuthCallback;