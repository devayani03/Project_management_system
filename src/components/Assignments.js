import { useState, useEffect } from "react";
import { Button, TextField, CircularProgress } from "@material-ui/core";
import { db, storage } from "../firebase"; // Ensure you have firebase storage for file uploads
import { useParams } from "react-router-dom";
import "./Assignment.css";

function Assignments({ classData, user }) {
	const [assignmentContent, setAssignmentContent] = useState("");
	const [assignments, setAssignments] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { id } = useParams();

	useEffect(() => {
		setLoading(true);
		const unsubscribe = db
			.collection("classes")
			.doc(id)
			.onSnapshot(
				(snapshot) => {
					const data = snapshot.data();
					setAssignments(data?.assignments || []);
					setLoading(false);
				},
				(error) => {
					console.error("Error fetching assignments:", error);
					setError("Failed to load assignments");
					setLoading(false);
				}
			);

		// Cleanup listener on component unmount
		return () => unsubscribe();
	}, [id]);

	const createAssignment = async () => {
		if (!assignmentContent.trim()) return; // Prevent creating assignment with empty content

		setLoading(true);
		try {
			const classRef = db.collection("classes").doc(id);

			const newAssignments = [
				...(classData.assignments || []),
				{
					id: Date.now().toString(),
					content: assignmentContent,
					date: new Date().toISOString(),
					postedBy: user.displayName,
					creatorId: user.uid,
					submissions: [],
				},
			];

			await classRef.update({ assignments: newAssignments });
			setAssignmentContent(""); // Clear input after posting
		} catch (error) {
			console.error("Error posting assignment", error);
			setError("Failed to post assignment");
		} finally {
			setLoading(false);
		}
	};

	const handleAssignmentSubmission = async (assignmentId, file) => {
		if (!file) return;

		setLoading(true);
		try {
			// File type validation
			if (file.type !== "application/pdf") {
				alert("Only PDF files are allowed.");
				return;
			}

			// Upload to Firebase Storage
			const storageRef = storage.ref();
			const fileRef = storageRef.child(
				`assignments/${id}/${assignmentId}/${user.uid}-${file.name}`
			);
			await fileRef.put(file);

			const fileUrl = await fileRef.getDownloadURL();

			// Update assignment's submissions in Firestore
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
			setError("Failed to submit assignment");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="assignments">
			{/* Display errors if any */}
			{error && <p className="error-message">{error}</p>}

			{/* Only allow the class creator to post assignments */}
			{classData.creatorUid === user.uid && (
				<div className="assignment-create">
					<TextField
						label="Assignment Description"
						value={assignmentContent}
						onChange={(e) => setAssignmentContent(e.target.value)}
						fullWidth
						disabled={loading}
					/>
					<Button onClick={createAssignment} color="primary" disabled={loading}>
						{loading ? <CircularProgress size={24} /> : "Post Assignment"}
					</Button>
				</div>
			)}

			<div className="assignments-list">
				{loading ? (
					<CircularProgress /> // Loading state for assignments
				) : (
					assignments.map((assignment) => (
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
											handleAssignmentSubmission(
												assignment.id,
												e.target.files[0]
											)
										}
										disabled={loading}
									/>
									<Button
										color="primary"
										onClick={(e) =>
											handleAssignmentSubmission(
												assignment.id,
												e.target.files[0]
											)
										}
										disabled={loading}
									>
										Submit
									</Button>
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
					))
				)}
			</div>
		</div>
	);
}

export default Assignments;
