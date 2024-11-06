import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase"; // Assuming firebase config is in this file
import { useAuthState } from "react-firebase-hooks/auth"; // Firebase Auth state hook
import { TextField, IconButton, Avatar, CircularProgress } from "@mui/material";
import { SendOutlined } from "@mui/icons-material";
import "./Chat.css"; // Custom styles for chat UI

function Chat() {
	const { id } = useParams(); // The chat ID from the URL params
	const [messages, setMessages] = useState([]);
	const [messageText, setMessageText] = useState("");
	const [user, loading] = useAuthState(auth); // Firebase Auth state hook
	const [isTyping, setIsTyping] = useState(false);
	const [className, setClassName] = useState(""); // State to store the class name
	const [classLoading, setClassLoading] = useState(true); // State to track loading of class name

	// State for storing profile photos for senders
	const [profilePhotos, setProfilePhotos] = useState({});

	const endOfMessagesRef = useRef(null); // Reference to the bottom of the chat

	useEffect(() => {
		// Fetch class name and chat messages from Firestore
		const fetchClassName = async () => {
			try {
				const chatDoc = await db.collection("classes").doc(id).get(); // Fetch chat document by 'id'
				if (chatDoc.exists) {
					setClassName(chatDoc.data().name); // Assuming 'className' is the field that stores the class name
				}
			} catch (error) {
				console.error("Error fetching class name:", error);
			} finally {
				setClassLoading(false); // Set loading state to false after the operation
			}
		};

		// Fetch profile photo for sender
		const fetchProfilePhotos = async () => {
			const snapshot = await db
				.collection("chats")
				.doc(id)
				.collection("messages")
				.get();
			snapshot.docs.forEach(async (doc) => {
				const senderUid = doc.data().senderUid;
				if (senderUid) {
					const userDoc = await db.collection("users").doc(senderUid).get(); // Assuming user data is in 'users' collection
					if (userDoc.exists) {
						setProfilePhotos((prevPhotos) => ({
							...prevPhotos,
							[senderUid]: userDoc.data().photoURL, // Store profile photo URL by sender UID
						}));
					}
				}
			});
		};

		// Fetch class name and messages initially
		fetchClassName();
		fetchProfilePhotos();

		const unsubscribe = db
			.collection("chats")
			.doc(id)
			.collection("messages")
			.orderBy("timestamp")
			.onSnapshot((snapshot) => {
				setMessages(
					snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
				);
			});

		return () => unsubscribe(); // Cleanup on unmount
	}, [id]);

	useEffect(() => {
		// Scroll to the bottom of the chat whenever messages change
		endOfMessagesRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "end",
		});
	}, [messages]); // This runs whenever messages update

	// Handle sending a message
	const sendMessage = async () => {
		if (messageText.trim() && user) {
			try {
				await db.collection("chats").doc(id).collection("messages").add({
					text: messageText,
					sender: user.displayName,
					senderUid: user.uid,
					timestamp: new Date(),
				});
				setMessageText(""); // Clear input field
			} catch (err) {
				console.error("Error sending message:", err);
			}
		}
	};

	// Handle typing input
	const handleTyping = () => {
		setIsTyping(true);
		setTimeout(() => setIsTyping(false), 1000); // Typing indicator timeout
	};

	return (
		<div className="chat">
			<div className="chat__header">
				{classLoading ? (
					<CircularProgress /> // Show loading spinner while fetching class name
				) : (
					<h2>Chat for {className || "Class not found"}</h2> // Display class name or error message
				)}
			</div>

			<div className="chat__messages">
				{messages.map((message) => (
					<div
						key={message.id}
						className={`chat__message ${
							message.senderUid === user?.uid ? "chat__message--user" : ""
						}`}
					>
						<Avatar
							alt={message.sender}
							src={profilePhotos[message.senderUid] || ""} // Fetch sender's profile photo from state
							className="chat__messageAvatar"
						/>
						<div>
							<div className="chat__messageSender">
								{/* Display the sender's name */}
								{message.sender}
							</div>
							<div className="chat__messageContent">
								<div className="chat__messageText">{message.text}</div>
								<div className="chat__messageTimestamp">
									{/* Display timestamp in a readable format */}
									{new Date(
										message.timestamp.seconds * 1000
									).toLocaleTimeString()}
								</div>
							</div>
						</div>
					</div>
				))}
				<div ref={endOfMessagesRef} /> {/* Empty div to scroll to */}
			</div>

			{isTyping && <div className="chat__typing">Other user is typing...</div>}

			<div className="chat__inputArea">
				<TextField
					label="Type a message"
					fullWidth
					multiline
					rows={2}
					value={messageText}
					onChange={(e) => {
						setMessageText(e.target.value);
						handleTyping(); // Track if user is typing
					}}
					variant="outlined"
					className="chat__inputField"
				/>
				<IconButton onClick={sendMessage} disabled={!messageText.trim()}>
					<SendOutlined />
				</IconButton>
			</div>
		</div>
	);
}

export default Chat;
