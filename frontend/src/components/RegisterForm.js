// frontend/src/components/RegisterForm.js
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import authService from '../services/authService';

const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authService.register(values.username, values.email, values.password);
      message.success('Đăng ký thành công!');
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      name="register"
      onFinish={onFinish}
      autoComplete="off"
      layout="vertical"
    >
      <Form.Item
        label="Username"
        name="username"
        rules={[
          { required: true, message: 'Vui lòng nhập username!' },
          { min: 3, message: 'Username phải có ít nhất 3 ký tự!' },
          { max: 50, message: 'Username không được quá 50 ký tự!' },
        ]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="Username" 
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: 'Vui lòng nhập email!' },
          { type: 'email', message: 'Email không đúng định dạng!' },
        ]}
      >
        <Input 
          prefix={<MailOutlined />} 
          placeholder="Email" 
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Mật khẩu"
        name="password"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu!' },
          { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Mật khẩu"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="Xác nhận mật khẩu"
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Mật khẩu không khớp!'));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Xác nhận mật khẩu"
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
          Đăng ký
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        Đã có tài khoản?{' '}
        <Button type="link" onClick={onSwitchToLogin}>
          Đăng nhập ngay
        </Button>
      </div>
    </Form>
  );
};

export default RegisterForm;
