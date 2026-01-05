// frontend/src/components/AdminPromotionsList.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, message, Card, Tag, Input, Space } from 'antd';
import { DeleteOutlined, EditOutlined, SearchOutlined, GiftOutlined } from '@ant-design/icons';
import promotionService from '../services/promotionService';
import { useTranslation } from '../hooks/useTranslation';
import PromotionForm from './PromotionForm';

const { Search } = Input;

const AdminPromotionsList = () => {
  const { t } = useTranslation();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [search, setSearch] = useState('');
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPromotions();
  }, [pagination.current, search]);

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const offset = (pagination.current - 1) * pagination.pageSize;
      const data = await promotionService.getAllPromotions(pagination.pageSize, offset);
      
      let filtered = data.promotions || [];
      if (search) {
        filtered = filtered.filter(p => 
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.cafe_name?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      setPromotions(filtered);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0
      }));
    } catch (error) {
      message.error(error.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promotionId) => {
    try {
      await promotionService.deletePromotion(promotionId);
      message.success('Promotion deleted successfully');
      loadPromotions();
    } catch (error) {
      message.error(error.message || 'Failed to delete promotion');
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setEditingPromotion(null);
    setShowForm(false);
    loadPromotions();
  };

  const handleCancelEdit = () => {
    setEditingPromotion(null);
    setShowForm(false);
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const formatDiscount = (type, value) => {
    if (!value) return '-';
    switch (type) {
      case 'percentage':
        return `${value}%`;
      case 'fixed_amount':
        return `${value.toLocaleString('vi-VN')} VND`;
      case 'free_item':
        return `Free ${value} item(s)`;
      default:
        return value;
    }
  };

  const getStatusTag = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    
    if (!promotion.is_active) {
      return <Tag color="default">Inactive</Tag>;
    }
    if (now < startDate) {
      return <Tag color="blue">Upcoming</Tag>;
    }
    if (now > endDate) {
      return <Tag color="red">Expired</Tag>;
    }
    return <Tag color="green">Active</Tag>;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      fixed: 'left',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: {
        showTitle: true,
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: {
        showTitle: true,
      },
      render: (text) => text || '-',
    },
    {
      title: 'Cafe',
      key: 'cafe',
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.cafe_name || '-'}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.cafe_address || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Discount Type',
      dataIndex: 'discount_type',
      key: 'discount_type',
      width: 130,
      render: (type) => {
        const typeMap = {
          percentage: 'Percentage',
          fixed_amount: 'Fixed Amount',
          free_item: 'Free Item'
        };
        return typeMap[type] || type;
      },
    },
    {
      title: 'Discount Value',
      key: 'discount',
      width: 150,
      render: (_, record) => (
        <Tag color="orange" style={{ margin: 0 }}>
          {formatDiscount(record.discount_type, record.discount_value)}
        </Tag>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : '-',
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : '-',
    },
    {
      title: 'Status',
      key: 'status',
      width: 110,
      fixed: 'right',
      render: (_, record) => getStatusTag(record),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this promotion?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (showForm) {
    return (
      <Card 
        title={
          <span>
            <GiftOutlined style={{ marginRight: 8 }} />
            {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
          </span>
        }
        extra={
          <Button onClick={handleCancelEdit}>Cancel</Button>
        }
      >
        <PromotionForm 
          promotion={editingPromotion}
          onSuccess={handleFormSuccess}
          onCancel={handleCancelEdit}
        />
      </Card>
    );
  }

  return (
    <Card 
      title="Promotion Management"
      extra={
        <Button 
          type="primary" 
          icon={<GiftOutlined />}
          onClick={() => setShowForm(true)}
        >
          Create Promotion
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search by title, cafe name, or description"
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          style={{ width: 400 }}
        />
      </div>
      <div className="admin-promotions-table">
        <Table
          columns={columns}
          dataSource={promotions}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} promotions`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1500, y: 'calc(100vh - 400px)' }}
          size="middle"
          bordered
        />
      </div>
    </Card>
  );
};

export default AdminPromotionsList;

