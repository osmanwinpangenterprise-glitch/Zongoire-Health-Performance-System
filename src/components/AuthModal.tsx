import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Key,
  Lock,
  X,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole, userEmail?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectRole(selectedRole, email || 'me.officer@ghs.gov.gh');
    setSuccessMsg(`Authenticated successfully as ${selectedRole.toUpperCase()}. Access permissions updated.`);
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              ZSHPMS System Authentication & User Roles
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Select access role or enter official GHS credentials.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-3 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Select Operating Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'admin', label: 'Administrator', desc: 'Full upload & edit rights' },
                { id: 'me_officer', label: 'M&E Officer', desc: 'Analytics & review reports' },
                { id: 'in_charge', label: 'Facility In-Charge', desc: 'Facility statistics' },
                { id: 'viewer', label: 'Viewer', desc: 'Read-only dashboard' },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id as UserRole)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedRole === role.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-600/30'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{role.label}</span>
                    {selectedRole === role.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                    {role.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Official Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. officer@ghs.gov.gh"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-lg shadow-md transition-colors text-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Lock className="w-4 h-4 text-amber-300" />
            <span>Confirm Role & Login</span>
          </button>
        </form>
      </div>
    </div>
  );
};
