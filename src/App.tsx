import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/store/LoginPage';
import RegisterPage from './pages/store/RegisterPage';
import MissionsHistoryCustomerPage from './pages/store/MissionsHistoryCustomerPage';
import MissionWatchCustomerPage from './pages/store/MissionWatchCustomerPage';
import PolicyCustomerPage from './pages/store/PolicyCustomerPage';
import ProfileCustomerPage from './pages/store/ProfileCustomerPage';
import UserAdminPage from './pages/admin/UserAdminPage';
import DashboardAdminPage from './pages/admin/DashboardAdminPage';
import MissionAdminPage from './pages/admin/MissionAdminPage';
import AchievementAdminPage from './pages/admin/AchievementAdminPage';
import UserMissionAdminPage from './pages/admin/UserMissionAdminPage';
import ItemAdminPage from './pages/admin/ItemAdminPage';
import UserOrdersAdminPage from './pages/admin/UserOrdersAdminPage';
import LandingPage from './pages/public/LandingPage';
import AboutUsPage from './pages/public/AboutUsPage';
import ShopCustomerPage from './pages/store/ShopCustomerPage';
import QuestsHubPage from './pages/store/QuestsHubPage';
import InventoryCustomerPage from './pages/store/InventoryCustomerPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/policy" element={<PolicyCustomerPage />} />
          <Route path="/about" element={<AboutUsPage />} />
        </Route>

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/shop" element={<ShopCustomerPage />} />
            <Route path="/inventory" element={<InventoryCustomerPage />} />
            <Route path="/quests" element={<QuestsHubPage />} />
            <Route path="/missions/watch/:userMissionId" element={<MissionWatchCustomerPage />} />
            <Route path="/missions" element={<Navigate to="/quests" replace />} />
            <Route path="/achievements" element={<Navigate to="/quests?tab=achievements" replace />} />
            <Route path="/history" element={<MissionsHistoryCustomerPage />} />
            <Route path="/profile" element={<ProfileCustomerPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/admin" element={<DashboardAdminPage />} />
            <Route path="/admin/users" element={<UserAdminPage />} />
            <Route path="/admin/missions" element={<MissionAdminPage />} />
            <Route path="/admin/achievements" element={<AchievementAdminPage />} />
            <Route path="/admin/items" element={<ItemAdminPage />} />
            <Route path="/admin/orders" element={<UserOrdersAdminPage />} />
            <Route path="/admin/tracking" element={<UserMissionAdminPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
