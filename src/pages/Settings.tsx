import { useState } from 'react'
import { 
  Save, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Palette, 
  Globe, 
  FileText,
  Mail,
  Smartphone,
  Clock,
  Eye,
  EyeOff,
  Check,
  X,
  Calendar,
  CreditCard,
  BarChart3
} from 'lucide-react'

interface SettingsSection {
  id: string
  title: string
  icon: any
  description: string
}

const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    title: 'General Settings',
    icon: User,
    description: 'Hospital information and basic configuration'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    description: 'Email and push notification preferences'
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    description: 'Password, authentication, and privacy settings'
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: Palette,
    description: 'Theme, language, and display preferences'
  },
  {
    id: 'system',
    title: 'System',
    icon: Database,
    description: 'Backup, maintenance, and technical settings'
  }
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    hospitalName: 'City General Hospital',
    address: '123 Medical Center Dr, Healthcare City, HC 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@citygeneralhospital.com',
    website: 'www.citygeneralhospital.com',
    timezone: 'America/New_York',
    currency: 'USD'
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    billingAlerts: true,
    systemUpdates: false,
    marketingEmails: false,
    reminderTime: '24',
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5',
    ipWhitelist: '',
    auditLogging: true
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    compactMode: false,
    showAvatars: true
  })

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: '30',
    maintenanceMode: false,
    debugMode: false,
    analytics: true
  })

  const handleSave = async (section: string) => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // Show success message
    console.log(`${section} settings saved`)
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hospital Name
          </label>
          <input
            type="text"
            value={generalSettings.hospitalName}
            onChange={(e) => setGeneralSettings({...generalSettings, hospitalName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={generalSettings.phone}
            onChange={(e) => setGeneralSettings({...generalSettings, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={generalSettings.email}
            onChange={(e) => setGeneralSettings({...generalSettings, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={generalSettings.website}
            onChange={(e) => setGeneralSettings({...generalSettings, website: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={generalSettings.timezone}
            onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={generalSettings.currency}
            onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          value={generalSettings.address}
          onChange={(e) => setGeneralSettings({...generalSettings, address: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
        <div className="space-y-3">
          {[
            { key: 'emailNotifications', label: 'Enable email notifications', icon: Mail },
            { key: 'appointmentReminders', label: 'Appointment reminders', icon: Calendar },
            { key: 'billingAlerts', label: 'Billing alerts', icon: CreditCard },
            { key: 'systemUpdates', label: 'System updates', icon: Database },
            { key: 'marketingEmails', label: 'Marketing emails', icon: FileText }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center">
                <item.icon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <button
                onClick={() => setNotificationSettings({
                  ...notificationSettings,
                  [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings]
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings[item.key as keyof typeof notificationSettings] 
                    ? 'bg-primary-600' 
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings[item.key as keyof typeof notificationSettings] 
                      ? 'translate-x-6' 
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
            <span className="text-sm text-gray-700">Enable push notifications</span>
          </div>
          <button
            onClick={() => setNotificationSettings({
              ...notificationSettings,
              pushNotifications: !notificationSettings.pushNotifications
            })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationSettings.pushNotifications ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Reminder Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Time (hours before)
            </label>
            <select
              value={notificationSettings.reminderTime}
              onChange={(e) => setNotificationSettings({...notificationSettings, reminderTime: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Quiet Hours</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-3" />
            <span className="text-sm text-gray-700">Enable quiet hours</span>
          </div>
          <button
            onClick={() => setNotificationSettings({
              ...notificationSettings,
              quietHours: { ...notificationSettings.quietHours, enabled: !notificationSettings.quietHours.enabled }
            })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationSettings.quietHours.enabled ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationSettings.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {notificationSettings.quietHours.enabled && (
          <div className="grid grid-cols-2 gap-4 ml-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={notificationSettings.quietHours.start}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  quietHours: { ...notificationSettings.quietHours, start: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={notificationSettings.quietHours.end}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  quietHours: { ...notificationSettings.quietHours, end: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Authentication</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Two-factor authentication</span>
            </div>
            <button
              onClick={() => setSecuritySettings({
                ...securitySettings,
                twoFactorAuth: !securitySettings.twoFactorAuth
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                securitySettings.twoFactorAuth ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Password Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Expiry (days)
            </label>
            <select
              value={securitySettings.passwordExpiry}
              onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Security Options</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Audit logging</span>
            </div>
            <button
              onClick={() => setSecuritySettings({
                ...securitySettings,
                auditLogging: !securitySettings.auditLogging
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                securitySettings.auditLogging ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  securitySettings.auditLogging ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">IP Whitelist</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed IP Addresses (one per line)
          </label>
          <textarea
            value={securitySettings.ipWhitelist}
            onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
            rows={3}
            placeholder="192.168.1.1&#10;10.0.0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="mt-1 text-sm text-gray-500">Leave empty to allow all IP addresses</p>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={appearanceSettings.theme}
            onChange={(e) => setAppearanceSettings({...appearanceSettings, theme: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={appearanceSettings.language}
            onChange={(e) => setAppearanceSettings({...appearanceSettings, language: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={appearanceSettings.dateFormat}
            onChange={(e) => setAppearanceSettings({...appearanceSettings, dateFormat: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Format
          </label>
          <select
            value={appearanceSettings.timeFormat}
            onChange={(e) => setAppearanceSettings({...appearanceSettings, timeFormat: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="12">12-hour</option>
            <option value="24">24-hour</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Display Options</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Palette className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Compact mode</span>
            </div>
            <button
              onClick={() => setAppearanceSettings({
                ...appearanceSettings,
                compactMode: !appearanceSettings.compactMode
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                appearanceSettings.compactMode ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  appearanceSettings.compactMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Show avatars</span>
            </div>
            <button
              onClick={() => setAppearanceSettings({
                ...appearanceSettings,
                showAvatars: !appearanceSettings.showAvatars
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                appearanceSettings.showAvatars ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  appearanceSettings.showAvatars ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Backup Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Automatic backups</span>
            </div>
            <button
              onClick={() => setSystemSettings({
                ...systemSettings,
                autoBackup: !systemSettings.autoBackup
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                systemSettings.autoBackup ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  systemSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        {systemSettings.autoBackup && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
              <select
                value={systemSettings.backupFrequency}
                onChange={(e) => setSystemSettings({...systemSettings, backupFrequency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
              <select
                value={systemSettings.retentionPeriod}
                onChange={(e) => setSystemSettings({...systemSettings, retentionPeriod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">System Options</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Maintenance mode</span>
            </div>
            <button
              onClick={() => setSystemSettings({
                ...systemSettings,
                maintenanceMode: !systemSettings.maintenanceMode
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                systemSettings.maintenanceMode ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Debug mode</span>
            </div>
            <button
              onClick={() => setSystemSettings({
                ...systemSettings,
                debugMode: !systemSettings.debugMode
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                systemSettings.debugMode ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  systemSettings.debugMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm text-gray-700">Analytics</span>
            </div>
            <button
              onClick={() => setSystemSettings({
                ...systemSettings,
                analytics: !systemSettings.analytics
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                systemSettings.analytics ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  systemSettings.analytics ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'security':
        return renderSecuritySettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'system':
        return renderSystemSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your hospital management system preferences and configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <section.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    activeSection === section.id ? 'text-primary-600' : 'text-gray-400'
                  }`}
                />
                <div className="text-left">
                  <div className="font-medium">{section.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{section.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {settingsSections.find(s => s.id === activeSection)?.title}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {settingsSections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
            
            <div className="p-6">
              {renderSectionContent()}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave(activeSection)}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}