import { IconButton } from "@material-ui/core";
import {
	AssignmentIndOutlined,
	FolderOpenOutlined,
	ChatBubbleOutline,
} from "@material-ui/icons";
import React from "react";
import { useHistory } from "react-router-dom";
import "./ClassCard.css";

function ClassCard({ name, creatorName, creatorPhoto, id, style }) {
	const history = useHistory();

	const goToClass = () => {
		history.push(`/class/${id}`);
	};

	const goToChat = (e) => {
		e.stopPropagation(); // Prevents triggering goToClass when clicking the chat icon
		history.push(`/class/${id}/chat`);
	};

	return (
		<div className="classCard" style={style} onClick={goToClass}>
			<div className="classCard__upper">
				<div className="classCard__className">{name}</div>
				<div className="classCard__creatorName">{creatorName}</div>
				<img
					src={creatorPhoto}
					alt="Creator"
					className="classCard__creatorPhoto"
				/>
			</div>
			<div className="classCard__middle"></div>
			<div className="classCard__lower">
				<IconButton>
					<FolderOpenOutlined />
				</IconButton>
				<IconButton>
					<AssignmentIndOutlined />
				</IconButton>
				<IconButton onClick={goToChat}>
					<ChatBubbleOutline />
				</IconButton>
			</div>
		</div>
	);
}

export default ClassCard;
