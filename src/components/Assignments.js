import { useState, useEffect } from "react";
import { Button, TextField } from "@material-ui/core";
import { db, storage } from "../firebase"; // Ensure you have firebase storage for file uploads
import { useParams } from "react-router-dom";
import "./Assignment.css";

function Assignments({ classData, user }) {
  const [assignmentContent, setAssignmentContent] = useState("");
  const [assignments, setAssignments] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    db.collection("classes")
      .doc(id)
      .onSnapshot((snapshot) => {
        const data = snapshot.data();
        setAssignments(data?.assignments || []);
      });
  }, [id]);

  const createAssignment = async () => {
    try {
      const classRef = db.collection("classes").doc(id);

      // Ensure classData.assignments is an array or fallback to an empty array
      const newAssignments = [
        ...(classData.assignments || []),
        {
          id: Date.now().toString(), // Assign a unique ID for each assignment
          content: assignmentContent,
          date: new Date().toISOString(),
          postedBy: user.displayName,
          creatorId: user.uid,
          submissions: [], // Initialize empty submissions array
        },
      ];

      await classRef.update({ assignments: newAssignments });
      setAssignmentContent(""); // Clear the input field after posting
    } catch (error) {
      console.error("Error posting assignment", error);
    }
  };

  const handleAssignmentSubmission = async (assignmentId, file) => {
    if (!file) return;

    try {
      // Upload file to Firebase Storage
      const storageRef = storage.ref();
      const fileRef = storageRef.child(
        `assignments/${id}/${assignmentId}/${user.uid}-${file.name}`
      );
      await fileRef.put(file);

      const fileUrl = await fileRef.getDownloadURL();

      // Update the specific assignment's submissions in Firestore
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
                fileUrl,
                fileName: file.name,
                submissionDate: new Date().toISOString(),
              },
            ],
          };
        }
        return assignment;
      });

      await classRef.update({ assignments: updatedAssignments });
    } catch (error) {
      console.error("Error submitting assignment", error);
    }
  };

  return (
    <div className="assignments">
      {/* Only allow the class creator to post assignments */}
      {classData.creatorUid === user.uid && (
        <div className="assignment-create">
          <TextField
            label="Assignment Description"
            value={assignmentContent}
            onChange={(e) => setAssignmentContent(e.target.value)}
            fullWidth
          />
          <Button onClick={createAssignment} color="primary">
            Post Assignment
          </Button>
        </div>
      )}

      <div className="assignments-list">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="assignment-item">
            <p>{assignment.content}</p>
            <small>
              Posted by: {assignment.postedBy} on {assignment.date}
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
    </div>
  );
}

export default Assignments;
