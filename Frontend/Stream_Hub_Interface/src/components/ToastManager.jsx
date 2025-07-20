import React, { useState, useCallback } from "react";
import Toast from "./Toast";

const ToastManager = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toastConfig) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toastConfig };

    setToasts((prev) => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      return addToast({
        message,
        onClose: () => removeToast(options.id),
        ...options,
      });
    },
    [addToast, removeToast]
  );

  // Expose methods globally for easy access
  React.useEffect(() => {
    window.showToast = showToast;
    window.addToast = addToast;
    window.removeToast = removeToast;

    return () => {
      delete window.showToast;
      delete window.addToast;
      delete window.removeToast;
    };
  }, [showToast, addToast, removeToast]);

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          showIcon={toast.showIcon}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export default ToastManager;
