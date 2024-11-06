import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import { auth, db } from "../firebase";
import { joinDialogAtom } from "../utils/atoms";
import Notification from "./Notifications"; // Import the Notification component

function JoinClass() {
  const [open, setOpen] = useRecoilState(joinDialogAtom);
  const [user] = useAuthState(auth);
  const [classId, setClassId] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false); // State for notification
  const [notificationMessage, setNotificationMessage] = useState(""); // State for notification message

  const handleClose = () => {
    setOpen(false);
  };

  const handleNotificationClose = () => setNotificationOpen(false);

  const joinClass = async () => {
    try {
      // Check if class exists
      const classRef = await db.collection("classes").doc(classId).get();
      if (!classRef.exists) {
        setNotificationMessage("Class doesn't exist, please provide correct ID");
        setNotificationOpen(true);
        return;
      }

      const classData = classRef.data();

      // Add class to user
      const userRef = await db.collection("users").where("uid", "==", user.uid).get();
      const userData = userRef.docs[0].data();
      let tempClassrooms = userData.enrolledClassrooms || []; // Ensure it's an array

      // Check if the user is already enrolled in the class
      if (tempClassrooms.some((classroom) => classroom.id === classId)) {
        setNotificationMessage("You are already enrolled in this class.");
        setNotificationOpen(true);
        return;
      }

      tempClassrooms.push({
        creatorName: classData.creatorName,
        creatorPhoto: classData.creatorPhoto,
        id: classId,
        name: classData.name,
      });

      await userRef.docs[0].ref.update({
        enrolledClassrooms: tempClassrooms,
      });

      // Display success notification
      setNotificationMessage(`Enrolled in ${classData.name} successfully!`);
      setNotificationOpen(true);

      handleClose();
    } catch (err) {
      console.error(err);
      // Display error notification
      setNotificationMessage(`Error: ${err.message}`);
      setNotificationOpen(true);
    }
  };

  return (
    <div className="joinClass">
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Join group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter ID of the group to join the group
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Class ID"
            type="text"
            fullWidth
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={joinClass} color="primary">
            Join
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Component */}
      <Notification
        open={notificationOpen}
        handleClose={handleNotificationClose}
        message={notificationMessage}
      />
    </div>
  );
}

export default JoinClass;
