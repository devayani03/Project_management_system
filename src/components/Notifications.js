import React from "react";
import "./Notifications.css"; // Make sure to create this CSS file

function Notification({ message, isVisible, onClose }) {
  if (!isVisible) return null;

  return (
    <div className="notification">
      <p>{message}</p>
      <button className="close-button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

export default Notification;
