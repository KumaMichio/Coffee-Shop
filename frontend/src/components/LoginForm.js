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
      message.success('ログインに成功しました！');
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
        label="メールアドレス"
        name="email"
        rules={[
          { required: true, message: 'メールアドレスを入力してください！' },
          { type: 'email', message: 'メールアドレスの形式が正しくありません！' },
        ]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="メールアドレス" 
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="パスワード"
        name="password"
        rules={[{ required: true, message: 'パスワードを入力してください！' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="パスワード"
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
          ログイン
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        アカウントをお持ちでない方は{' '}
        <Button type="link" onClick={onSwitchToRegister}>
          新規登録
        </Button>
      </div>
    </Form>
  );
};

export default LoginForm;
