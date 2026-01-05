// frontend/src/components/RegisterForm.js
import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import authService from '../services/authService';
import { useTranslation } from '../hooks/useTranslation';

const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authService.register(values.username, values.email, values.password);
      message.success(t('auth.registerSuccess'));
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
        label={t('auth.username')}
        name="username"
        rules={[
          { required: true, message: t('auth.usernameRequired') },
          { min: 3, message: t('auth.usernameMinLength') },
          { max: 50, message: 'Username must be 50 characters or less!' },
        ]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder={t('auth.username')} 
          size="large"
        />
      </Form.Item>

      <Form.Item
        label={t('auth.email')}
        name="email"
        rules={[
          { required: true, message: t('auth.emailRequired') },
          { type: 'email', message: t('auth.emailInvalid') },
        ]}
      >
        <Input 
          prefix={<MailOutlined />} 
          placeholder={t('auth.email')} 
          size="large"
        />
      </Form.Item>

      <Form.Item
        label={t('auth.password')}
        name="password"
        rules={[
          { required: true, message: t('auth.passwordRequired') },
          { min: 6, message: t('auth.passwordMinLength') },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={t('auth.password')}
          size="large"
        />
      </Form.Item>

      <Form.Item
        label={t('auth.confirmPassword')}
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match!'));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={t('auth.confirmPassword')}
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
          {t('auth.register')}
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        {t('auth.haveAccount')}{' '}
        <Button type="link" onClick={onSwitchToLogin}>
          {t('auth.login')}
        </Button>
      </div>
    </Form>
  );
};

export default RegisterForm;
