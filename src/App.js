import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./screens/Home";
import Dashboard from "./screens/Dashboard";
import Navbar from "./components/Navbar";
import Class from "./screens/Class";
import ProjectTrackingDashboard from "./screens/Projecttracker";
import TextEditor from "./components/TextEditor";
import Chat from "./screens/Chat"; // Import the Chat component

function App() {
	return (
		<div className="app">
			<Router>
				<Switch>
					<Route exact path="/">
						<Home />
					</Route>
					<Route exact path="/dashboard">
						<Navbar />
						<Dashboard />
					</Route>
					<Route exact path="/track">
						<Navbar />
						<ProjectTrackingDashboard />
					</Route>
					<Route exact path="/editor">
						<Navbar />
						<TextEditor />
					</Route>
					<Route exact path="/class/:id">
						<Navbar />
						<Class />
					</Route>
					<Route exact path="/class/:id/chat">
						<Navbar />
						<Chat /> {/* Render Chat component for class chat */}
					</Route>
				</Switch>
			</Router>
		</div>
	);
}

export default App;
