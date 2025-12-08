// frontend/src/pages/Auth.js
import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 450, 
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          borderRadius: '8px'
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: 24 }}>
          ☕ Coffee Shop Finder
        </h1>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={items}
          centered
        />
      </Card>
    </div>
  );
};

export default Auth;
