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

function CreateClass() {
  const [user, loading, error] = useAuthState(auth);
  const [open, setOpen] = useRecoilState(createDialogAtom);
  const [className, setClassName] = useState("");
  const [classId, setClassId] = useState(""); // State to store the class ID

  const handleClose = () => {
    setOpen(false);
    setClassName("");
    setClassId(""); // Reset class ID when the dialog is closed
  };

  const createClass = async () => {
    try {
      // Create a new class document
      const newClass = await db.collection("classes").add({
        creatorUid: user.uid,
        name: className,
        creatorName: user.displayName,
        creatorPhoto: user.photoURL,
        posts: [],
      });

      console.log("Class ID:", newClass.id);
      setClassId(newClass.id); // Store the class ID in state

      // Create a chat room for the new class
      const chatRoom = await db.collection("chats").add({
        classId: newClass.id,
        className: className,
        createdBy: user.uid,
        members: [user.uid],
        messages: [],
      });

      console.log("Chat room created with ID:", chatRoom.id);

      // Update the class document to include the chat room ID
      await db.collection("classes").doc(newClass.id).update({
        chatRoomId: chatRoom.id,
      });

      // Add to current user's class list
      const userRef = await db
        .collection("users")
        .where("uid", "==", user.uid)
        .get();
      const docId = userRef.docs[0].id;
      const userData = userRef.docs[0].data();
      let userClasses = userData.enrolledClassrooms || [];
      userClasses.push({
        id: newClass.id,
        name: className,
        creatorName: user.displayName,
        creatorPhoto: user.photoURL,
        chatRoomId: chatRoom.id,
      });
      const docRef = await db.collection("users").doc(docId);
      await docRef.update({
        enrolledClassrooms: userClasses,
      });

      alert("Classroom and chat room created successfully!");
    } catch (err) {
      alert(`Cannot create class - ${err.message}`);
    }
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Create group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the name of the group, and we will create a group for you!
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
          {/* Conditionally render the Class ID if it exists */}
          {classId && (
            <div style={{ marginTop: "10px" }}>
              <strong>Class ID:</strong> {classId}
            </div>
          )}
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
    </div>
  );
}

export default CreateClass;
