import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return null;
}
