// frontend/src/components/LoginForm.js
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import authService from '../services/authService';
import { useTranslation } from '../hooks/useTranslation';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await authService.login(values.email, values.password);
      message.success(t('auth.loginSuccess'));
      // onSuccess will handle redirect based on user role
      if (onSuccess) onSuccess(data);
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
        label={t('auth.email')}
        name="email"
        rules={[
          { required: true, message: t('auth.emailRequired') },
          { type: 'email', message: t('auth.emailInvalid') },
        ]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder={t('auth.email')} 
          size="large"
        />
      </Form.Item>

      <Form.Item
        label={t('auth.password')}
        name="password"
        rules={[{ required: true, message: t('auth.passwordRequired') }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={t('auth.password')}
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
          {t('auth.login')}
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        {t('auth.noAccount')}{' '}
        <Button type="link" onClick={onSwitchToRegister}>
          {t('auth.register')}
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;
