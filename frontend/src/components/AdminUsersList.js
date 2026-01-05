// frontend/src/components/AdminUsersList.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, message, Card, Input, Avatar } from 'antd';
import { DeleteOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import adminService from '../services/adminService';
import { useTranslation } from '../hooks/useTranslation';

const { Search } = Input;

const AdminUsersList = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, [pagination.current, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(
        pagination.current,
        pagination.pageSize,
        search
      );
      setUsers(data.users || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0
      }));
    } catch (error) {
      message.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      message.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      message.error(error.message || 'Failed to delete user');
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Avatar',
      key: 'avatar',
      width: 80,
      render: (_, record) => (
        <Avatar
          src={record.avatar_url}
          icon={<UserOutlined />}
          size={40}
        />
      ),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this user?"
          description="This will also delete all their reviews and favorites."
          onConfirm={() => handleDelete(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card title="User Management">
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search by username or email"
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default AdminUsersList;

