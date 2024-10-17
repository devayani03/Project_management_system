import React from "react";
import "./ProjectCard.css"; // Assume you have styles for the card

// Helper function to calculate progress
function calculateProgress(milestones) {
  const total = milestones.length;
  const completed = milestones.filter(m => m.status === "Completed").length;
  return Math.round((completed / total) * 100);
}

function ProjectCard({ name, deadline, milestones, status, style }) {
  const progress = calculateProgress(milestones);

  return (
    <div className="projectCard" style={style}>
      <h2>{name}</h2>
      <p><strong>Deadline:</strong> {deadline}</p>
      <p><strong>Status:</strong> {status}</p>

      <h3>Milestones:</h3>
      <ul>
        {milestones.map((milestone, index) => (
          <li key={index}>
            {milestone.name}: {milestone.status}
          </li>
        ))}
      </ul>

      {/* Progress Bar */}
      <div className="progressBarContainer">
        <div className="progressBar" style={{ width: `${progress}%` }}></div>
      </div>
      <p><strong>Progress:</strong> {progress}%</p>
    </div>
  );
}

export default ProjectCard;
