import { Settings, User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-white">Settings</h1>
        <p className="text-sm text-white/40 mt-1">
          Manage your account and application settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-light">Profile</h3>
              <p className="text-xs text-white/40">
                Manage your profile information
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 block mb-1">
                Display Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-white font-light">Notifications</h3>
              <p className="text-xs text-white/40">
                Manage notification preferences
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-white/60">Email on new order</span>
              <input
                type="checkbox"
                className="accent-white w-4 h-4"
                defaultChecked
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-white/60">
                Email on new inquiry
              </span>
              <input
                type="checkbox"
                className="accent-white w-4 h-4"
                defaultChecked
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-white/60">Weekly summary</span>
              <input type="checkbox" className="accent-white w-4 h-4" />
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-light">Security</h3>
              <p className="text-xs text-white/40">Manage security settings</p>
            </div>
          </div>
          <div className="space-y-4">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white/60 hover:border-white/20 transition-colors">
              Change Password
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-white/60 hover:border-white/20 transition-colors">
              Two-Factor Authentication
            </button>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Palette className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-light">Appearance</h3>
              <p className="text-xs text-white/40">
                Customize the look and feel
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 block mb-2">Theme</label>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20">
                  Dark
                </button>
                <button className="px-4 py-2 rounded-lg bg-white/[0.03] text-white/40 text-sm border border-white/10 cursor-not-allowed">
                  Light (Coming soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-red-400" />
          <h3 className="text-red-400 font-light">Danger Zone</h3>
        </div>
        <p className="text-sm text-white/40 mb-4">
          These actions are irreversible. Please proceed with caution.
        </p>
        <button className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20 hover:bg-red-500/20 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
