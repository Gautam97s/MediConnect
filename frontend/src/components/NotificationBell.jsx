import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, X, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

const NOTIFICATIONS_STORAGE_KEY = 'mediconnect_patient_notifications';

function loadNotifications() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch {}
}

export function addRefundNotification({ doctorName, appointmentId, appointmentDate }) {
  const notifications = loadNotifications();

  // Prevent duplicate for the same appointment
  const alreadyExists = notifications.some(
    (n) => n.appointmentId === appointmentId && n.type === 'refund'
  );
  if (alreadyExists) {
    return;
  }

  const newNotification = {
    id: `refund-${appointmentId}-${Date.now()}`,
    type: 'refund',
    title: 'Refund Initiated',
    message: `Your doctor${doctorName ? ` (${doctorName})` : ''} did not join the consultation. If any amount was deducted, it will be refunded to your account within 2–3 working days.`,
    doctorName: doctorName || 'Unknown Doctor',
    appointmentId,
    appointmentDate,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const updated = [newNotification, ...notifications];
  saveNotifications(updated);

  // Dispatch a custom event so the bell picks it up in real-time
  window.dispatchEvent(new CustomEvent('mediconnect:notification', { detail: newNotification }));
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load on mount
  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  // Listen for new notifications dispatched from ConsultationCallPanel
  useEffect(() => {
    const handler = () => {
      setNotifications(loadNotifications());
    };

    window.addEventListener('mediconnect:notification', handler);
    // Also listen to storage events from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === NOTIFICATIONS_STORAGE_KEY) {
        handler();
      }
    });

    return () => {
      window.removeEventListener('mediconnect:notification', handler);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  }, [notifications]);

  const dismissNotification = useCallback((notifId) => {
    const updated = notifications.filter((n) => n.id !== notifId);
    setNotifications(updated);
    saveNotifications(updated);
  }, [notifications]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen && unreadCount > 0) {
            markAllAsRead();
          }
        }}
        className="relative p-2.5 rounded-xl bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all shadow-sm group"
        title="Notifications"
      >
        <Bell size={18} strokeWidth={2} className="text-stone-600 group-hover:text-stone-800 transition-colors" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-lg shadow-rose-200 animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <style>{`
            @keyframes notifSlideIn {
              from { opacity: 0; transform: translateY(-8px) scale(0.97); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          <div
            className="absolute right-0 top-full mt-3 w-[380px] max-h-[480px] bg-white rounded-2xl border border-stone-200 shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ animation: 'notifSlideIn 0.25s ease-out' }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div>
                <h3 className="text-sm font-extrabold text-stone-900">Notifications</h3>
                <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                  {notifications.length === 0 ? 'No notifications' : `${notifications.length} notification${notifications.length > 1 ? 's' : ''}`}
                </p>
              </div>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] font-bold text-stone-400 hover:text-rose-500 transition-colors uppercase tracking-wider"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                  <Bell size={32} strokeWidth={1.5} className="mb-3 text-stone-300" />
                  <p className="text-sm font-semibold">All caught up!</p>
                  <p className="text-xs mt-1">No notifications at the moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-5 py-4 hover:bg-stone-50 transition-colors relative group ${!notif.read ? 'bg-teal-50/30' : ''}`}
                    >
                      {/* Dismiss button */}
                      <button
                        type="button"
                        onClick={() => dismissNotification(notif.id)}
                        className="absolute top-3 right-3 p-1 rounded-full text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>

                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          notif.type === 'refund'
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-100'
                            : 'bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-100'
                        }`}>
                          {notif.type === 'refund' ? (
                            <RefreshCw size={16} className="text-white" />
                          ) : (
                            <CheckCircle2 size={16} className="text-white" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-6">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-bold text-stone-900">{notif.title}</span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[12px] text-stone-500 leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="text-[11px] text-stone-400 mt-2 font-medium">
                            {formatTime(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
