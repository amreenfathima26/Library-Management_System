import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Database, FileText, Shield, Download, Upload, RefreshCw, Trash2 } from 'lucide-react';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('backups'); // 'backups', 'logs', 'security'

  const handleBackup = () => {
    // Placeholder for backup functionality
    alert('Backup functionality will be implemented');
  };

  const handleRestore = () => {
    // Placeholder for restore functionality
    alert('Restore functionality will be implemented');
  };

  const handleDownloadLogs = () => {
    // Placeholder for download logs
    alert('Log download functionality will be implemented');
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      alert('Log clearing functionality will be implemented');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Manage system backups, logs, and security settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('backups')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'backups'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Database className="w-4 h-4 inline mr-2" />
            Backups
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Logs
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Security
          </button>
        </nav>
      </div>

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          <Card title="Database Backups">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Regular backups ensure data safety. It's recommended to create backups before major updates.
                </p>
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleBackup}>
                  <Database className="w-4 h-4 mr-2" />
                  Create Backup
                </Button>
                <Button onClick={handleRestore} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Restore Backup
                </Button>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Recent Backups</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">Backup_2025-12-13_18-00-00.sql</p>
                        <p className="text-sm text-gray-500">Created on December 13, 2025 at 6:00 PM</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center py-4">
                    No other backups available
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <Card title="System Logs">
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Logs help track system activities and troubleshoot issues. Logs are automatically rotated.
                </p>
              </div>
              <div className="flex space-x-4">
                <Button onClick={handleDownloadLogs} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Logs
                </Button>
                <Button onClick={handleClearLogs} variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Logs
                </Button>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Recent Log Entries</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="space-y-1">
                    <div>[2025-12-13 18:15:23] INFO - User admin logged in successfully</div>
                    <div>[2025-12-13 18:14:45] INFO - Student record created: STU20250002</div>
                    <div>[2025-12-13 18:13:12] INFO - Fee payment processed: RCP2025000001</div>
                    <div>[2025-12-13 18:10:30] INFO - Database backup completed successfully</div>
                    <div>[2025-12-13 18:05:15] WARN - High memory usage detected: 85%</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card title="Security Settings">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Password Policy</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Minimum Password Length</p>
                      <p className="text-sm text-gray-500">Require passwords to be at least 8 characters</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Password Complexity</p>
                      <p className="text-sm text-gray-500">Require uppercase, lowercase, numbers, and special characters</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Password Expiry</p>
                      <p className="text-sm text-gray-500">Passwords expire after 90 days</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Disabled
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Session Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-gray-500">Automatically log out after 30 minutes of inactivity</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Concurrent Sessions</p>
                      <p className="text-sm text-gray-500">Allow multiple sessions per user</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Enabled
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Access Control</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">IP Whitelist</p>
                      <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Disabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Disabled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;

