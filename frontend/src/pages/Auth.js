// frontend/src/pages/Auth.js
import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import './Auth.css';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/');
  };

  const items = [
    {
      key: 'login',
      label: (
        <span>
          <LoginOutlined />
          Đăng nhập
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
          Đăng ký
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
      {/* Left Section - Background Image */}
      <div className="auth-background-section">
        <div className="auth-background-content">
          <h1 className="auth-background-title">☕ Coffee Shop Finder</h1>
          <p className="auth-background-subtitle">
            Khám phá những quán cà phê tuyệt vời xung quanh bạn
          </p>
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
