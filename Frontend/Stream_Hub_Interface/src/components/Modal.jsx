import React, { useEffect } from "react";
import Portal from "./Portal";
import "./Modal.css";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <Portal>
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className={`modal-container modal-${size}`}>
          {title && (
            <div className="modal-header">
              <h2 className="modal-title">{title}</h2>
              {showCloseButton && (
                <button
                  className="modal-close-btn"
                  onClick={onClose}
                  aria-label="Close modal"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 6L6 18M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className="modal-content">{children}</div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
