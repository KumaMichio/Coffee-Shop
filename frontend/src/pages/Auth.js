// frontend/src/pages/Auth.js
import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import LanguageDropdown from '../components/LanguageDropdown';
import { useTranslation } from '../hooks/useTranslation';
import './Auth.css';

const Auth = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Check if user is admin and redirect accordingly
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'admin') {
        navigate('/admin');
        return;
      }
    }
    navigate('/');
  };

  const items = [
    {
      key: 'login',
      label: (
        <span>
          <LoginOutlined />
          {t('auth.login')}
        </span>
      ),
      children: (
        <LoginForm
          onSuccess={handleSuccess}
          onSwitchToRegister={() => setActiveTab('register')}
        />
      ),
    },
    {
      key: 'register',
      label: (
        <span>
          <UserAddOutlined />
          {t('auth.register')}
        </span>
      ),
      children: (
        <RegisterForm
          onSuccess={handleSuccess}
          onSwitchToLogin={() => setActiveTab('login')}
        />
      ),
    },
  ];

  return (
    <div className="auth-page">
      {/* Language Selector */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <LanguageDropdown textColor="#1f2937" />
      </div>

      {/* Left Section - Background Image */}
      <div 
        className="auth-background-section"
        style={{
          backgroundImage: `url('/wp7575195-anime-cafe-wallpapers.jpg')`
        }}
      >
        <div className="auth-background-content">
          {/* Background image only, no text */}
        </div>
      </div>

      {/* Right Section - Auth Form */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <Card className="auth-form-card">
            <h1 className="auth-form-title">
              <span className="coffee-icon">☕</span>
              Coffee Shop Finder
            </h1>
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab} 
              items={items}
              centered
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
