import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCircle2, Download, FileText, RefreshCw, X } from 'lucide-react';
import { downloadPrescriptionPdf, fetchPrescriptions, triggerPdfDownload } from '../api/prescriptions';

const NOTIFICATIONS_STORAGE_KEY = 'mediconnect_patient_notifications';
const DISMISSED_PRESCRIPTION_NOTIFICATIONS_KEY = 'mediconnect_patient_dismissed_prescription_notifications';

function loadNotifications() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
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

function loadDismissedPrescriptionNotificationIds() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(DISMISSED_PRESCRIPTION_NOTIFICATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDismissedPrescriptionNotificationIds(ids) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      DISMISSED_PRESCRIPTION_NOTIFICATIONS_KEY,
      JSON.stringify(Array.from(new Set(ids)))
    );
  } catch {}
}

function upsertNotification(notification) {
  const notifications = loadNotifications();
  const existingIndex = notifications.findIndex((item) => item.id === notification.id);

  if (existingIndex === -1) {
    const updated = [notification, ...notifications];
    saveNotifications(updated);
    window.dispatchEvent(new CustomEvent('mediconnect:notification', { detail: notification }));
    return;
  }

  const existing = notifications[existingIndex];
  const updated = notifications.map((item) =>
    item.id === notification.id
      ? {
          ...notification,
          read: existing.read
        }
      : item
  );
  saveNotifications(updated);
  window.dispatchEvent(new CustomEvent('mediconnect:notification', { detail: notification }));
}

export function addRefundNotification({ doctorName, appointmentId, appointmentDate }) {
  const notificationId = `refund-${appointmentId}`;
  const notifications = loadNotifications();

  if (notifications.some((item) => item.id === notificationId)) {
    return;
  }

  upsertNotification({
    id: notificationId,
    type: 'refund',
    title: 'Refund Initiated',
    message: `Your doctor${doctorName ? ` (${doctorName})` : ''} did not join the consultation. If any amount was deducted, it will be refunded to your account within 2-3 working days.`,
    doctorName: doctorName || 'Unknown Doctor',
    appointmentId,
    appointmentDate,
    createdAt: new Date().toISOString(),
    read: false
  });
}

export function addPrescriptionNotification({ prescriptionId, appointmentId, doctorName, issuedAt }) {
  const notificationId = `prescription-${prescriptionId}`;
  const dismissedIds = loadDismissedPrescriptionNotificationIds();

  if (dismissedIds.includes(notificationId)) {
    return;
  }

  upsertNotification({
    id: notificationId,
    type: 'prescription',
    title: 'Prescription Ready',
    message: `${doctorName || 'Your doctor'} has uploaded your prescription PDF for this consultation.`,
    doctorName: doctorName || 'Doctor',
    appointmentId,
    prescriptionId,
    createdAt: issuedAt || new Date().toISOString(),
    read: false
  });
}

function sortNotifications(notifications) {
  return [...notifications].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    setNotifications(sortNotifications(loadNotifications()));
  }, []);

  useEffect(() => {
    const handler = () => {
      setNotifications(sortNotifications(loadNotifications()));
    };

    const storageHandler = (event) => {
      if (
        event.key === NOTIFICATIONS_STORAGE_KEY ||
        event.key === DISMISSED_PRESCRIPTION_NOTIFICATIONS_KEY
      ) {
        handler();
      }
    };

    window.addEventListener('mediconnect:notification', handler);
    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener('mediconnect:notification', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncPrescriptionNotifications = async () => {
      try {
        const prescriptions = await fetchPrescriptions();
        if (cancelled) {
          return;
        }

        const currentNotifications = loadNotifications();
        const currentMap = new Map(currentNotifications.map((item) => [item.id, item]));
        const dismissedIds = loadDismissedPrescriptionNotificationIds();

        const syncedPrescriptionNotifications = (Array.isArray(prescriptions) ? prescriptions : [])
          .map((prescription) => {
            const id = `prescription-${prescription.id}`;
            if (dismissedIds.includes(id)) {
              return null;
            }

            const existing = currentMap.get(id);

            return {
              id,
              type: 'prescription',
              title: 'Prescription Ready',
              message: `${prescription.doctorName || 'Your doctor'} has uploaded your prescription PDF for appointment #${prescription.appointmentId}.`,
              doctorName: prescription.doctorName || 'Doctor',
              appointmentId: prescription.appointmentId,
              prescriptionId: prescription.id,
              createdAt: prescription.issuedAt || new Date().toISOString(),
              read: existing?.read ?? false
            };
          })
          .filter(Boolean);

        const nonPrescriptionNotifications = currentNotifications.filter(
          (notification) => notification.type !== 'prescription'
        );

        const merged = sortNotifications([
          ...syncedPrescriptionNotifications,
          ...nonPrescriptionNotifications
        ]);

        setNotifications(merged);
        saveNotifications(merged);
      } catch {
        // Keep the bell usable even if prescription sync fails.
      }
    };

    void syncPrescriptionNotifications();
    const intervalId = window.setInterval(() => {
      void syncPrescriptionNotifications();
    }, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markAllAsRead = useCallback(() => {
    const updated = notifications.map((notification) => ({ ...notification, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  }, [notifications]);

  const dismissNotification = useCallback((notificationId) => {
    const notification = notifications.find((item) => item.id === notificationId);
    if (notification?.type === 'prescription') {
      saveDismissedPrescriptionNotificationIds([
        ...loadDismissedPrescriptionNotificationIds(),
        notificationId
      ]);
    }

    const updated = notifications.filter((item) => item.id !== notificationId);
    setNotifications(updated);
    saveNotifications(updated);
  }, [notifications]);

  const clearAll = useCallback(() => {
    const dismissedPrescriptionIds = notifications
      .filter((notification) => notification.type === 'prescription')
      .map((notification) => notification.id);

    if (dismissedPrescriptionIds.length > 0) {
      saveDismissedPrescriptionNotificationIds([
        ...loadDismissedPrescriptionNotificationIds(),
        ...dismissedPrescriptionIds
      ]);
    }

    setNotifications([]);
    saveNotifications([]);
  }, [notifications]);

  const handleDownloadPrescription = useCallback(async (notification) => {
    if (!notification?.prescriptionId) {
      return;
    }

    setDownloadingId(notification.id);
    try {
      const { blob, fileName } = await downloadPrescriptionPdf(notification.prescriptionId);
      triggerPdfDownload(blob, fileName);
    } finally {
      setDownloadingId('');
    }
  }, []);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
          if (!isOpen && unreadCount > 0) {
            markAllAsRead();
          }
        }}
        className="relative p-2.5 rounded-xl bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all shadow-sm group"
        title="Notifications"
      >
        <Bell size={18} strokeWidth={2} className="text-stone-600 group-hover:text-stone-800 transition-colors" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-lg shadow-rose-200 animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <>
          <style>{`
            @keyframes notifSlideIn {
              from { opacity: 0; transform: translateY(-8px) scale(0.97); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          <div
            className="absolute right-0 top-full mt-3 w-[400px] max-h-[520px] bg-white rounded-2xl border border-stone-200 shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ animation: 'notifSlideIn 0.25s ease-out' }}
          >
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div>
                <h3 className="text-sm font-extrabold text-stone-900">Notifications</h3>
                <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                  {notifications.length === 0 ? 'No notifications' : `${notifications.length} notification${notifications.length > 1 ? 's' : ''}`}
                </p>
              </div>
              {notifications.length > 0 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] font-bold text-stone-400 hover:text-rose-500 transition-colors uppercase tracking-wider"
                >
                  Clear All
                </button>
              ) : null}
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                  <Bell size={32} strokeWidth={1.5} className="mb-3 text-stone-300" />
                  <p className="text-sm font-semibold">All caught up!</p>
                  <p className="text-xs mt-1">No notifications at the moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-5 py-4 hover:bg-stone-50 transition-colors relative group ${!notification.read ? 'bg-teal-50/30' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => dismissNotification(notification.id)}
                        className="absolute top-3 right-3 p-1 rounded-full text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>

                      <div className="flex gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            notification.type === 'refund'
                              ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-100'
                              : notification.type === 'prescription'
                              ? 'bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-100'
                              : 'bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-100'
                          }`}
                        >
                          {notification.type === 'refund' ? (
                            <RefreshCw size={16} className="text-white" />
                          ) : notification.type === 'prescription' ? (
                            <FileText size={16} className="text-white" />
                          ) : (
                            <CheckCircle2 size={16} className="text-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 pr-6">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-bold text-stone-900">{notification.title}</span>
                            {!notification.read ? (
                              <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                            ) : null}
                          </div>
                          <p className="text-[12px] text-stone-500 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-[11px] text-stone-400 mt-2 font-medium">
                            {formatTime(notification.createdAt)}
                          </p>

                          {notification.type === 'prescription' ? (
                            <button
                              type="button"
                              onClick={() => void handleDownloadPrescription(notification)}
                              disabled={downloadingId === notification.id}
                              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Download size={12} />
                              {downloadingId === notification.id ? 'Downloading...' : 'Download PDF'}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
