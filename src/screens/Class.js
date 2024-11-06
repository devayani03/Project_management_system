import React, { useState, useEffect } from "react";
import Announcement from "../components/Announcement";
import Assignments from "../components/Assignments";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useParams, useHistory } from "react-router-dom";
import moment from "moment";
import { IconButton, TextField, Button } from "@material-ui/core";
import { SendOutlined, Chat as ChatButton } from "@material-ui/icons"; // Added Chat icon
import "./Class.css";
import Chat from "./Chat";

function Class() {
	const [classData, setClassData] = useState({});
	const [announcementContent, setAnnouncementContent] = useState("");
	const [posts, setPosts] = useState([]);
	const [user, loading] = useAuthState(auth);
	const [chatVisible, setChatVisible] = useState(false); // State for chat visibility
	const { id } = useParams();
	const history = useHistory();

	useEffect(() => {
		db.collection("classes")
			.doc(id)
			.onSnapshot((snapshot) => {
				const data = snapshot.data();
				if (!data) history.replace("/");
				setClassData(data);
				setPosts(data?.posts?.reverse() || []);
			});
	}, [id, history]);

	const createPost = async () => {
		try {
			const classRef = db.collection("classes").doc(id);
			const newPosts = [
				...classData.posts,
				{
					authorId: user.uid,
					content: announcementContent,
					date: moment().format("MMM Do YY"),
					image: user.photoURL,
					name: user.displayName,
				},
			];
			await classRef.update({ posts: newPosts });
			setAnnouncementContent("");
		} catch (error) {
			console.error("Error posting announcement", error);
		}
	};

	const toggleChat = () => setChatVisible(!chatVisible); // Toggle chat visibility

	return (
		<div className="class">
			{/* Chat Toggle Icon */}

			<div
				className={`class__content ${
					chatVisible ? "class__content--shifted" : ""
				}`}
			>
				<div className="class__nameBox">
					<div className="class__name">{classData?.name}</div>
					<IconButton className="chat__icon" onClick={toggleChat}>
						<ChatButton />
					</IconButton>
				</div>

				{/* Announcement Section */}
				<div className="class__announce">
					<img
						src="https://res.cloudinary.com/dyxnmjtrg/image/upload/v1730742456/pfp-1_bsmdwc.png"
						alt="Profile"
					/>
					<TextField
						value={announcementContent}
						onChange={(e) => setAnnouncementContent(e.target.value)}
						placeholder="Announce something to your class"
						fullWidth
					/>
					<IconButton onClick={createPost}>
						<SendOutlined />
					</IconButton>
				</div>
				{posts.map((post, index) => (
					<Announcement
						key={index}
						authorId={post.authorId}
						content={post.content}
						date={post.date}
						image={post.image}
						name={post.name}
					/>
				))}

				{/* Pass classData as a prop to Assignments */}
				<Assignments classData={classData} user={user} />
			</div>

			{/* Chat Window (Initially hidden) */}
			{chatVisible && (
				<div className="chat__window">
					{/* Implement your chat window here */}
					<Chat />
				</div>
			)}
		</div>
	);
}

export default Class;
