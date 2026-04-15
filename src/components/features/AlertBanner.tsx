import { useState } from 'react';
import { TriangleAlert, X, AlertCircle, Info } from 'lucide-react';

export interface SmartAlertData {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
}

interface AlertBannerProps {
  alerts: SmartAlertData[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter(a => !dismissedIds.has(a.id));

  if (visibleAlerts.length === 0) return null;

  const dismiss = (id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div className="mb-6 flex flex-col gap-2 animate-slide-down">
      {visibleAlerts.map(alert => {
        let colorClasses = "border-amber-200 bg-amber-50 text-amber-800";
        let iconColor = "text-amber-600";
        let hoverBg = "hover:bg-amber-100";
        let Icon = TriangleAlert;

        if (alert.type === 'critical') {
            colorClasses = "border-rose-200 bg-rose-50 text-rose-800";
            iconColor = "text-rose-600";
            hoverBg = "hover:bg-rose-100";
            Icon = AlertCircle;
        } else if (alert.type === 'info') {
            colorClasses = "border-sky-200 bg-sky-50 text-sky-800";
            iconColor = "text-sky-600";
            hoverBg = "hover:bg-sky-100";
            Icon = Info;
        }

        return (
          <div key={alert.id} className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${colorClasses}`}>
            <div className="flex items-center gap-2">
              <Icon size={18} className={iconColor} />
              <p className="text-sm font-medium">
                {alert.message}
              </p>
            </div>
            <button
              onClick={() => dismiss(alert.id)}
              className={`p-1 rounded-md transition-colors ${iconColor} ${hoverBg}`}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
