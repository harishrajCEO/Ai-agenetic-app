function AlertsPanel({ alerts = [], onResolve }) {
  try {
    const getAlertIcon = (type) => {
      switch (type) {
        case 'critical':
          return <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>;
        case 'warning':
          return <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>;
        case 'info':
          return <i className="fas fa-info-circle text-blue-500 mr-2"></i>;
        case 'success':
          return <i className="fas fa-check-circle text-green-500 mr-2"></i>;
        default:
          return <i className="fas fa-bell text-slate-500 mr-2"></i>;
      }
    };
    
    const handleResolve = (e, alertId) => {
      e.stopPropagation();
      onResolve(alertId);
    };
    
    if (alerts.length === 0) {
      return (
        <div data-name="no-alerts" className="text-center p-4">
          <i className="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
          <p data-name="no-alerts-message" className="text-slate-500 dark:text-slate-400">
            No active alerts at this time.
          </p>
        </div>
      );
    }
    
    return (
      <div data-name="alerts-panel">
        {alerts.map(alert => (
          <div 
            data-name="alert-item" 
            key={alert.id}
            className={`alert-item alert-${alert.type}`}
          >
            <div data-name="alert-content" className="flex justify-between items-start">
              <div data-name="alert-message" className="flex items-start">
                {getAlertIcon(alert.type)}
                <div data-name="alert-text">
                  <div data-name="alert-message" className="text-sm font-medium">
                    {alert.message}
                  </div>
                  <div data-name="alert-time" className="text-xs text-slate-500 mt-1">
                    {formatDate(alert.timestamp)}
                  </div>
                </div>
              </div>
              
              <button
                data-name="resolve-button"
                className="ml-2 text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                onClick={(e) => handleResolve(e, alert.id)}
                title="Mark as resolved"
              >
                <i className="fas fa-check"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('AlertsPanel render error:', error);
    reportError(error);
    return <div data-name="alerts-error" className="text-red-600 p-4">Error loading alerts.</div>;
  }
}
