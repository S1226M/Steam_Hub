import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Portal = ({ children, containerId = "portal-root" }) => {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    // Find existing portal container or create new one
    let portalContainer = document.getElementById(containerId);

    if (!portalContainer) {
      portalContainer = document.createElement("div");
      portalContainer.id = containerId;
      portalContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(portalContainer);
    }

    setContainer(portalContainer);

    // Cleanup function
    return () => {
      if (portalContainer && portalContainer.childNodes.length === 0) {
        document.body.removeChild(portalContainer);
      }
    };
  }, [containerId]);

  if (!container) {
    return null;
  }

  return createPortal(children, container);
};

export default Portal;
