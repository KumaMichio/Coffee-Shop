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
      message.success('新規登録に成功しました！');
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
        label="ユーザー名"
        name="username"
        rules={[
          { required: true, message: 'ユーザー名を入力してください！' },
          { min: 3, message: 'ユーザー名は3文字以上である必要があります！' },
          { max: 50, message: 'ユーザー名は50文字以内である必要があります！' },
        ]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="ユーザー名" 
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="メールアドレス"
        name="email"
        rules={[
          { required: true, message: 'メールアドレスを入力してください！' },
          { type: 'email', message: 'メールアドレスの形式が正しくありません！' },
        ]}
      >
        <Input 
          prefix={<MailOutlined />} 
          placeholder="メールアドレス" 
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="パスワード"
        name="password"
        rules={[
          { required: true, message: 'パスワードを入力してください！' },
          { min: 6, message: 'パスワードは6文字以上である必要があります！' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="パスワード"
          size="large"
        />
      </Form.Item>

      <Form.Item
        label="パスワード確認"
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'パスワードを確認してください！' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('パスワードが一致しません！'));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="パスワード確認"
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
          新規登録
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        すでにアカウントをお持ちの方は{' '}
        <Button type="link" onClick={onSwitchToLogin}>
          ログイン
        </Button>
      </div>
    </Form>
  );
};

export default RegisterForm;
