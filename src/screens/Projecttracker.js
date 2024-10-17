import React from "react";
import "./Dashboard.css"; // Assume you have relevant CSS styles
import ProjectCard from "../components/ProjectCard"; // Placeholder for the card component

function ProjectTrackingDashboard() {
  // Static project data
  const projects = [
    {
      id: "project1",
      name: "B.Tech Project Management System",
      deadline: "2024-12-01",
      milestones: [
        { name: "Requirement Analysis", status: "Completed" },
        { name: "Design", status: "In Progress" },
        { name: "Development", status: "Pending" }
      ],
      status: "In Progress",
    },
    {
      id: "project2",
      name: "AI-Based Completion Predictor",
      deadline: "2024-11-20",
      milestones: [
        { name: "Research", status: "Completed" },
        { name: "Model Training", status: "In Progress" },
        { name: "Deployment", status: "Pending" }
      ],
      status: "In Progress",
    },
    {
      id: "project3",
      name: "Meeting Scheduler Integration",
      deadline: "2024-10-30",
      milestones: [
        { name: "API Setup", status: "Completed" },
        { name: "UI Design", status: "Completed" },
        { name: "Integration", status: "Pending" }
      ],
      status: "Pending",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__projectContainer">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            name={project.name}
            deadline={project.deadline}
            milestones={project.milestones}
            status={project.status}
            style={{ marginRight: 30, marginBottom: 30 }}
          />
        ))}
      </div>
    </div>
  );
}

export default ProjectTrackingDashboard;
