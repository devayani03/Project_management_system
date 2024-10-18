import React, { useState, useEffect } from "react";
import Announcement from "../components/Announcement";
import Assignments from "../components/Assignments";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useParams, useHistory } from "react-router-dom";
import moment from "moment";
import { IconButton, TextField, Button } from "@material-ui/core";
import { SendOutlined } from "@material-ui/icons";
import "./Class.css";

function Class() {
  const [classData, setClassData] = useState({});
  const [announcementContent, setAnnouncementContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [user, loading] = useAuthState(auth);
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

  return (
    <div className="class">
      <div className="class__nameBox">
        <div className="class__name">{classData?.name}</div>
      </div>

      {/* Announcement Section */}
      <div className="class__announce">
        <img src={user?.photoURL} alt="Profile" />
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
  );
}

export default Class;
