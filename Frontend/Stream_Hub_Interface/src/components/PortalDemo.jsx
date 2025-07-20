import React, { useState } from "react";
import Modal from "./Modal";
import "./PortalDemo.css";

const PortalDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState("medium");

  const showToast = (type, message) => {
    if (window.showToast) {
      window.showToast(message, {
        type,
        duration: 4000,
        position: "top-right",
      });
    }
  };

  const showModal = (size = "medium") => {
    setModalSize(size);
    setIsModalOpen(true);
  };

  return (
    <div className="portal-demo">
      <h2>Portal Component Demo</h2>

      <div className="demo-section">
        <h3>Toast Notifications</h3>
        <div className="demo-buttons">
          <button
            className="demo-btn success"
            onClick={() =>
              showToast(
                "success",
                "Success! Your action was completed successfully."
              )
            }
          >
            Success Toast
          </button>
          <button
            className="demo-btn error"
            onClick={() =>
              showToast(
                "error",
                "Error! Something went wrong. Please try again."
              )
            }
          >
            Error Toast
          </button>
          <button
            className="demo-btn warning"
            onClick={() =>
              showToast(
                "warning",
                "Warning! Please check your input before proceeding."
              )
            }
          >
            Warning Toast
          </button>
          <button
            className="demo-btn info"
            onClick={() =>
              showToast("info", "Info: This is an informational message.")
            }
          >
            Info Toast
          </button>
        </div>
      </div>

      <div className="demo-section">
        <h3>Modal Dialogs</h3>
        <div className="demo-buttons">
          <button
            className="demo-btn primary"
            onClick={() => showModal("small")}
          >
            Small Modal
          </button>
          <button
            className="demo-btn primary"
            onClick={() => showModal("medium")}
          >
            Medium Modal
          </button>
          <button
            className="demo-btn primary"
            onClick={() => showModal("large")}
          >
            Large Modal
          </button>
          <button
            className="demo-btn primary"
            onClick={() => showModal("full")}
          >
            Full Screen Modal
          </button>
        </div>
      </div>

      {/* Modal Examples */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${
          modalSize.charAt(0).toUpperCase() + modalSize.slice(1)
        } Modal Example`}
        size={modalSize}
      >
        <div className="modal-demo-content">
          <p>This is a {modalSize} modal rendered in a portal!</p>
          <p>
            Portals allow you to render components outside the normal DOM
            hierarchy, which is perfect for modals, tooltips, and other
            overlays.
          </p>

          <div className="modal-features">
            <h4>Features:</h4>
            <ul>
              <li>✅ Renders outside normal DOM hierarchy</li>
              <li>✅ Prevents body scroll when open</li>
              <li>✅ Closes on Escape key</li>
              <li>✅ Closes on overlay click</li>
              <li>✅ Responsive design</li>
              <li>✅ Dark mode support</li>
              <li>✅ Accessibility features</li>
            </ul>
          </div>

          <div className="modal-actions">
            <button
              className="demo-btn success"
              onClick={() => {
                showToast("success", "Action completed in modal!");
                setIsModalOpen(false);
              }}
            >
              Complete Action
            </button>
            <button
              className="demo-btn secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Close Modal
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PortalDemo;
