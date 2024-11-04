import { Avatar, IconButton, MenuItem, Menu, Button } from "@material-ui/core";
import { Add, Apps, Home } from "@material-ui/icons";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import { auth, logout } from "../firebase";
import { createDialogAtom, joinDialogAtom } from "../utils/atoms";
import CreateClass from "./CreateClass";
import JoinClass from "./JoinClass";
import "./Navbar.css";
import { useHistory } from "react-router-dom";

function Navbar() {
  const [user, loading, error] = useAuthState(auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [createOpened, setCreateOpened] = useRecoilState(createDialogAtom);
  const [joinOpened, setJoinOpened] = useRecoilState(joinDialogAtom);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openHome = () => {
    history.push("/"); 
  };

  const openMeet = () => {
    window.open("https://meet.google.com", "_blank");
  };

  const history = useHistory();

  const openTextEditor = () => {
    history.push("/editor");
  };

  const openGoogleDocs = () => {
    window.open("https://docs.google.com", "_blank");
  };

  return (
    <>
      <CreateClass />
      <JoinClass />
      <nav className="navbar">
        <div className="navbar__left">
        <img
          src="https://res.cloudinary.com/dyxnmjtrg/image/upload/v1729241256/book_logo_tvwpqi.png"
          alt="logo
          "
          className="home__image"
        />
          <span>myProject</span>
        </div>
        <div className="navbar__right">
        <IconButton onClick={openHome}> 
            <Home /> 
          </IconButton>
          <IconButton
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
          <Add />
          </IconButton>
          <IconButton onClick={openMeet}>Meet</IconButton>
          <IconButton onClick={openTextEditor}>Text Editor</IconButton>
          <IconButton onClick={openGoogleDocs}>Google Docs</IconButton>
          <IconButton onClick={logout}>
            <Avatar src={user?.photoURL} />
          </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem
              onClick={() => {
                setCreateOpened(true);
                handleClose();
              }}
            >
              Create group
            </MenuItem>
            <MenuItem
              onClick={() => {
                setJoinOpened(true);
                handleClose();
              }}
            >
              Join group
            </MenuItem>
          </Menu>
        </div>
      </nav>
    </>
  );
}

export default Navbar;