import { IconButton } from "@material-ui/core";
import { Menu, MoreVert } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import "./Announcement.css";
import Notification from "./Notification"; // Import Notification component

function Announcement({ image, name, date, content, authorId }) {
  const [notificationOpen, setNotificationOpen] = useState(false); // State for notification
  const [notificationMessage, setNotificationMessage] = useState(""); // State for notification message

  const handleNotificationClose = () => setNotificationOpen(false);

  useEffect(() => {
    // Trigger notification when a new announcement is received
    setNotificationMessage("New announcement posted!");
    setNotificationOpen(true);
  }, [content]);

  return (
    <div className="announcement">
      <div className="announcement__informationContainer">
        <div className="announcement__infoSection">
          <div className="announcement__imageContainer">
            <img src="https://res.cloudinary.com/dyxnmjtrg/image/upload/v1730742456/pfp-1_bsmdwc.png" alt="Profile photo" />
          </div>
          <div className="announcement__nameAndDate">
            <div className="announcement__name">{name}</div>
            <div className="announcement__date">{date}</div>
          </div>
        </div>
        <div className="announcement__infoSection">
          <IconButton>
            <MoreVert />
          </IconButton>
        </div>
      </div>
      <div className="announcement__content">{content}</div>

      {/* Notification Component */}
      <Notification
        message={notificationMessage}
        isVisible={notificationOpen}
        onClose={handleNotificationClose}
      />
    </div>
  );
}

export default Announcement;
