// frontend/src/components/PromotionForm.js
import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Switch, Button, message, Card, Space } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import promotionService from '../services/promotionService';
import adminService from '../services/adminService';
import { useTranslation } from '../hooks/useTranslation';

const { TextArea } = Input;
const { Option } = Select;

const PromotionForm = ({ promotion, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cafes, setCafes] = useState([]);
  const [searchingCafes, setSearchingCafes] = useState(false);
  const isEditMode = !!promotion;

  useEffect(() => {
    loadCafes();
    if (promotion) {
      // Set form values for edit mode
      form.setFieldsValue({
        cafe_id: promotion.cafe_id,
        title: promotion.title,
        description: promotion.description,
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        start_date: promotion.start_date ? dayjs(promotion.start_date) : null,
        end_date: promotion.end_date ? dayjs(promotion.end_date) : null,
        is_active: promotion.is_active
      });
    }
  }, [promotion]);

  const loadCafes = async (search = '') => {
    try {
      setSearchingCafes(true);
      const data = await adminService.getCafes(search);
      setCafes(data.cafes || []);
    } catch (error) {
      console.error('Error loading cafes:', error);
    } finally {
      setSearchingCafes(false);
    }
  };

  const handleSearchCafe = (value) => {
    if (value) {
      loadCafes(value);
    } else {
      loadCafes();
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const promotionData = {
        cafe_id: values.cafe_id,
        title: values.title,
        description: values.description,
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
        is_active: values.is_active !== false
      };

      if (isEditMode) {
        await promotionService.updatePromotion(promotion.id, promotionData);
        message.success('Promotion updated successfully!');
      } else {
        await promotionService.createPromotion(promotionData);
        message.success('Promotion created successfully!');
        form.resetFields();
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} promotion`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        discount_type: 'percentage',
        is_active: true
      }}
    >
        <Form.Item
          label="Cafe"
          name="cafe_id"
          rules={[{ required: true, message: 'Please select a cafe' }]}
        >
          <Select
            showSearch
            placeholder="Search and select a cafe"
            optionFilterProp="children"
            onSearch={handleSearchCafe}
            loading={searchingCafes}
            filterOption={false}
          >
            {cafes.map((cafe) => (
              <Option key={cafe.id} value={cafe.id}>
                {cafe.name} - {cafe.address}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter promotion title' }]}
        >
          <Input placeholder="e.g., 20% Off All Drinks" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
        >
          <TextArea rows={3} placeholder="Promotion description..." />
        </Form.Item>

        <Form.Item
          label="Discount Type"
          name="discount_type"
          rules={[{ required: true, message: 'Please select discount type' }]}
        >
          <Select>
            <Option value="percentage">Percentage (%)</Option>
            <Option value="fixed_amount">Fixed Amount (VND)</Option>
            <Option value="free_item">Free Item</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Discount Value"
          name="discount_value"
          rules={[{ required: true, message: 'Please enter discount value' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            placeholder="Enter discount value"
          />
        </Form.Item>

        <Form.Item
          label="Start Date"
          name="start_date"
          rules={[{ required: true, message: 'Please select start date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            showTime
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Form.Item>

        <Form.Item
          label="End Date"
          name="end_date"
          rules={[{ required: true, message: 'Please select end date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            showTime
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Form.Item>

        <Form.Item
          label="Active"
          name="is_active"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditMode ? 'Update Promotion' : 'Create Promotion'}
            </Button>
            {onCancel && (
              <Button onClick={onCancel}>
                Cancel
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
  );
};

export default PromotionForm;

