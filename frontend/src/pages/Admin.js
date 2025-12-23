// frontend/src/pages/Admin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Card, Statistic, Row, Col, Spin } from 'antd';
import { 
  GiftOutlined, 
  UserOutlined, 
  StarOutlined, 
  ShopOutlined,
  HomeOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import AdminPromotionsList from '../components/AdminPromotionsList';
import AdminReviewsList from '../components/AdminReviewsList';
import AdminUsersList from '../components/AdminUsersList';
import adminService from '../services/adminService';
import authService from '../services/authService';
import { useTranslation } from '../hooks/useTranslation';
import './Admin.css';

const { TabPane } = Tabs;

function Admin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('promotions');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/auth');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <h1 className="admin-title">
              <span className="coffee-icon">☕</span>
              Admin Dashboard
            </h1>
          </div>
          <div className="admin-header-right">
            <button className="admin-nav-btn" onClick={handleGoHome}>
              <HomeOutlined /> Home
            </button>
            <button className="admin-nav-btn" onClick={handleLogout}>
              <LogoutOutlined /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Users"
                    value={stats?.total_users || 0}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Reviews"
                    value={stats?.total_reviews || 0}
                    prefix={<StarOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Active Promotions"
                    value={stats?.active_promotions || 0}
                    prefix={<GiftOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Cafes"
                    value={stats?.total_cafes || 0}
                    prefix={<ShopOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Tabs */}
            <Card>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                type="card"
              >
                <TabPane
                  tab={
                    <span>
                      <GiftOutlined />
                      Promotions
                    </span>
                  }
                  key="promotions"
                >
                  <AdminPromotionsList onSuccess={loadStats} />
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <StarOutlined />
                      Reviews
                    </span>
                  }
                  key="reviews"
                >
                  <AdminReviewsList />
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <UserOutlined />
                      Users
                    </span>
                  }
                  key="users"
                >
                  <AdminUsersList />
                </TabPane>
              </Tabs>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

export default Admin;

