// frontend/src/components/AdminReviewsList.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, message, Card, Tag, Rate, Input } from 'antd';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import adminService from '../services/adminService';
import { useTranslation } from '../hooks/useTranslation';

const { Search } = Input;

const AdminReviewsList = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [cafeIdFilter, setCafeIdFilter] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [pagination.current, cafeIdFilter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await adminService.getReviews(
        pagination.current,
        pagination.pageSize,
        cafeIdFilter
      );
      setReviews(data.reviews || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0
      }));
    } catch (error) {
      message.error(error.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await adminService.deleteReview(reviewId);
      message.success('Review deleted successfully');
      loadReviews();
    } catch (error) {
      message.error(error.message || 'Failed to delete review');
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div>
          <div>{record.username}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Cafe',
      key: 'cafe',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.cafe_name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.cafe_address}</div>
        </div>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating) => (
        <div>
          <Rate disabled value={rating} style={{ fontSize: '14px' }} />
          <span style={{ marginLeft: 8 }}>{rating}/5</span>
        </div>
      ),
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true,
      render: (comment) => comment || <span style={{ color: '#999' }}>No comment</span>,
    },
    {
      title: 'Date',
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
          title="Are you sure you want to delete this review?"
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
    <Card title="All Reviews">
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Filter by Cafe ID (optional)"
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={(value) => {
            setCafeIdFilter(value ? parseInt(value) : null);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          style={{ width: 300 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={reviews}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};

export default AdminReviewsList;

