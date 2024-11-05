import { useState, useEffect } from "react";
import { Button, TextField } from "@material-ui/core";
import { db } from "../firebase"; 
import { useParams } from "react-router-dom";
import Notification from "./Notification"; // Import Notification component
import "./Assignment.css";


function Assignments({ classData, user }) {
  const [assignmentName, setAssignmentName] = useState(""); // State for assignment name
  const [assignmentContent, setAssignmentContent] = useState(""); // State for assignment description
  const [dueDate, setDueDate] = useState(""); // State for due date
  const [assignments, setAssignments] = useState([]); // State for list of assignments
  const [notificationOpen, setNotificationOpen] = useState(false); // State for notification
  const [notificationMessage, setNotificationMessage] = useState(""); // State for notification message
  const { id } = useParams();

  const handleNotificationClose = () => setNotificationOpen(false);

  useEffect(() => {
    const unsubscribe = db.collection("classes")
      .doc(id)
      .onSnapshot((snapshot) => {
        const data = snapshot.data();
        setAssignments(data?.assignments || []); // Set assignments from the snapshot
      });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [id]);

  const createAssignment = async () => {
    if (!assignmentName || !assignmentContent || !dueDate) {
      setNotificationMessage("Please fill in all fields.");
      setNotificationOpen(true);
      return; // Exit if any field is empty
    }

    try {
      const classRef = db.collection("classes").doc(id);

      // Prepare the new assignment object
      const newAssignment = {
        id: Date.now().toString(), // Assign a unique ID for each assignment
        name: assignmentName,
        content: assignmentContent,
        dueDate: dueDate,
        date: new Date().toISOString(),
        postedBy: user.displayName,
        creatorId: user.uid,
        submissions: [], // Initialize empty submissions array
      };

      const newAssignments = [...(classData.assignments || []), newAssignment];
      await classRef.update({ assignments: newAssignments }); // Update Firestore with new assignment

      // Clear fields after posting
      setAssignmentName("");
      setAssignmentContent("");
      setDueDate("");

      // Show notification for successful assignment creation
      setNotificationMessage(`Assignment "${assignmentName}" posted successfully! Due Date: ${dueDate}`);
      setNotificationOpen(true);
    } catch (error) {
      console.error("Error posting assignment", error); // Log error to console
      setNotificationMessage("Error posting assignment. Please try again.");
      setNotificationOpen(true);
    }
  };

  const handleAssignmentSubmission = async (assignmentId, file) => {
    if (!file) return; // Exit if no file is provided

    try {
      const classRef = db.collection("classes").doc(id);
      const classSnapshot = await classRef.get();
      const classData = classSnapshot.data();

      const updatedAssignments = classData.assignments.map((assignment) => {
        if (assignment.id === assignmentId) {
          return {
            ...assignment,
            submissions: [
              ...assignment.submissions,
              {
                studentId: user.uid,
                studentName: user.displayName,
                fileUrl: '', // Placeholder for future file uploads
                fileName: file.name,
                submissionDate: new Date().toISOString(),
              },
            ],
          };
        }
        return assignment;
      });

      await classRef.update({ assignments: updatedAssignments });

      // Show notification for successful assignment submission
      const assignmentSubmitted = updatedAssignments.find(a => a.id === assignmentId);
      setNotificationMessage(`Assignment "${assignmentSubmitted.name}" submitted successfully!`);
      setNotificationOpen(true);
    } catch (error) {
      console.error("Error submitting assignment", error);
      setNotificationMessage("Error submitting assignment. Please try again.");
      setNotificationOpen(true);
    }
  };

  return (
    <div className="assignments">
      {/* Only allow the class creator to post assignments */}
      {classData.creatorUid === user.uid && (
        <div className="assignment-create">
          <TextField
            label="Assignment Name"
            value={assignmentName}
            onChange={(e) => setAssignmentName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Assignment Description"
            value={assignmentContent}
            onChange={(e) => setAssignmentContent(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            required
          />
          <Button onClick={createAssignment} color="primary">
            Post Assignment
          </Button>
        </div>
      )}

      <div className="assignments-list">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="assignment-item">
            <h4>{assignment.name}</h4>
            <p>{assignment.content}</p>
            <small>
              Due Date: {assignment.dueDate} | Posted by: {assignment.postedBy} on {assignment.date}
            </small>

            {/* Allow students (non-creators) to submit assignments */}
            {user.uid !== classData.creatorUid && (
              <div className="submit-assignment">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) =>
                    handleAssignmentSubmission(assignment.id, e.target.files[0])
                  }
                />
                <Button color="primary">Submit</Button>
              </div>
            )}

            {/* Only the class creator can view the submissions */}
            {user.uid === classData.creatorUid && (
              <div className="assignment-submissions">
                <h4>Submissions</h4>
                {assignment.submissions?.length > 0 ? (
                  assignment.submissions.map((submission, index) => (
                    <div key={index} className="submission-item">
                      <p>
                        {submission.studentName} submitted on{" "}
                        {submission.submissionDate}
                      </p>
                      <a
                        href={submission.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {submission.fileName}
                      </a>
                    </div>
                  ))
                ) : (
                  <p>No submissions yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Notification Component */}
      <Notification
        isVisible={notificationOpen}
        onClose={handleNotificationClose}
        message={notificationMessage}
      />
    </div>
  );
}

export default Assignments;

