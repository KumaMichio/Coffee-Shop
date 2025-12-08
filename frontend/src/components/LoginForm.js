// frontend/src/components/LoginForm.js
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import authService from '../services/authService';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authService.login(values.email, values.password);
      message.success('Đăng nhập thành công!');
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="login"
      onFinish={onFinish}
      autoComplete="off"
      layout="vertical"
    >
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Vui lòng nhập email!' },
          { type: 'email', message: 'Email không đúng định dạng!' },
        ]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="Email" 
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Mật khẩu"
        name="password"
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Mật khẩu"
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading} 
          block 
          size="large"
        >
          Đăng nhập
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        Chưa có tài khoản?{' '}
        <Button type="link" onClick={onSwitchToRegister}>
          Đăng ký ngay
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;
