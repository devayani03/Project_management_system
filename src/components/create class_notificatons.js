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
import { createDialogAtom } from "../utils/atoms";
import Notification from "./Notifications"; // Import the Notification component

function CreateClass() {
  const [user] = useAuthState(auth);
  const [open, setOpen] = useRecoilState(createDialogAtom);
  const [className, setClassName] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false); // State for notification
  const [notificationMessage, setNotificationMessage] = useState(""); // State for notification message

  const handleClose = () => setOpen(false);

  const handleNotificationClose = () => setNotificationOpen(false);

  const createClass = async () => {
    try {
      const newClass = await db.collection("classes").add({
        creatorUid: user.uid,
        name: className,
        creatorName: user.displayName,
        creatorPhoto: user.photoURL,
        posts: [],
      });

      // Log the class ID (document ID) to the console
      console.log("Class ID:", newClass.id);

      // Add to current user's class list
      const userRef = await db.collection("users").where("uid", "==", user.uid).get();
      const docId = userRef.docs[0].id;
      const userData = userRef.docs[0].data();
      let userClasses = userData.enrolledClassrooms || [];
      userClasses.push({
        id: newClass.id, // Use the generated class ID
        name: className,
        creatorName: user.displayName,
        creatorPhoto: user.photoURL,
      });
      const docRef = await db.collection("users").doc(docId);
      await docRef.update({
        enrolledClassrooms: userClasses,
      });

      // Display success notification for the creator
      setNotificationMessage("Classroom created successfully!");
      setNotificationOpen(true);

      // Notify all enrolled students about the new class
      const enrolledStudents = await db.collection("users").where("enrolledClassrooms.id", "==", newClass.id).get();
      enrolledStudents.forEach((studentDoc) => {
        const studentData = studentDoc.data();
        // You might want to implement a better notification system here
        console.log(`Notify ${studentData.displayName}: A new classroom "${className}" has been created by ${user.displayName}.`);
      });

      handleClose();
    } catch (err) {
      alert(`Cannot create class - ${err.message}`);
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the name of the group and we will create a group for you!
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={createClass} color="primary">
            Create
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

export default CreateClass;
