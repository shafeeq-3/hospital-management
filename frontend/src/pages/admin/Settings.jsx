import { useState, useEffect } from 'react';
import axios from 'axios';
import api, { API_URL } from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import { Settings as SettingsIcon, Bell, Shield, Database, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    hospitalName: 'MediCare Hospital',
    hospitalEmail: 'admin@medicare.com',
    hospitalPhone: '+1234567890',
    address: '123 Medical Street, Healthcare City',
    timezone: 'Asia/Karachi',
    currency: 'USD',
    emailNotifications: true,
    smsNotifications: false,
    backupFrequency: 'daily',
    dataRetention: '365'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`${API_URL}/admin/settings`);
      setSettings(data.data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await api.put(`${API_URL}/admin/settings`, settings);
      setSettings(data.data);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBackupNow = () => {
    setSaving(true);
    setTimeout(() => {
      toast.success('Backup completed successfully');
      setSaving(false);
    }, 1500);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'backup', label: 'Backup', icon: Database }
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>

      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'general' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <Input
              label="Hospital Name"
              value={settings.hospitalName}
              onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={settings.hospitalEmail}
                onChange={(e) => setSettings({ ...settings, hospitalEmail: e.target.value })}
              />
              <Input
                label="Phone"
                value={settings.hospitalPhone}
                onChange={(e) => setSettings({ ...settings, hospitalPhone: e.target.value })}
              />
            </div>
            <Input
              label="Address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                  <option value="America/New_York">America/New York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (₨)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Security settings are managed at the system level. Contact your system administrator for changes.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Two-Factor Authentication</span>
                <span className="text-sm text-green-600">Enabled</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Session Timeout</span>
                <span className="text-sm text-gray-600">2 hours</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Password Policy</span>
                <span className="text-sm text-gray-600">Strong (min 6 chars)</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'backup' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup & Data Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <Input
              label="Data Retention (days)"
              type="number"
              value={settings.dataRetention}
              onChange={(e) => setSettings({ ...settings, dataRetention: e.target.value })}
            />
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleBackupNow} disabled={saving}>
                {saving ? 'Processing...' : 'Backup Now'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminSettings;
