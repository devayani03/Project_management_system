import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import "./TextEditor.css"; // Importing the new CSS file

function TextEditor() {
  const [editorContent, setEditorContent] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [apiCalls, setApiCalls] = useState(0);

  useEffect(() => {
    const resetApiCalls = setInterval(() => setApiCalls(0), 60000);
    return () => clearInterval(resetApiCalls);
  }, []);

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

  const checkGrammar = async () => {
    if (apiCalls >= 15) return;

    setIsChecking(true);
    try {
      const response = await axios.post(
        "https://api.languagetool.org/v2/check",
        new URLSearchParams({
          text: editorContent,
          language: "en-US",
        })
      );

      const errors = response.data.matches.map((match) => ({
        incorrectText: editorContent.slice(match.offset, match.offset + match.length),
        description: match.message,
        replacements: match.replacements.map((r) => r.value),
      }));

      setSuggestions(errors);
      setApiCalls((prevCount) => prevCount + 1);
    } catch (error) {
      console.error("Grammar check error:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const saveContent = async () => {
    try {
      const editor = document.querySelector(".ql-editor");

      const canvas = await html2canvas(editor);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("text-editor-content.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="text-editor-container">
      
      <div className="text-editor">
        
        <ReactQuill
          value={editorContent}
          onChange={handleEditorChange}
          placeholder="Write something amazing..."
        />
        
      </div>

      <div className="suggestions-sidebar">
      <div className="button-group">
          <button className="save-button" onClick={saveContent}>Save as PDF</button>
          <button className="grammar-button" onClick={checkGrammar} disabled={isChecking || apiCalls >= 15}>
            {isChecking ? "Checking..." : apiCalls >= 15 ? "Limit reached" : "Check Grammar"}
          </button>
        </div>
        <h4>Grammar Suggestions</h4>
        <ul>
          {suggestions.length === 0 ? (
            <li>No suggestions found</li>
          ) : (
            suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                <strong>Incorrect:</strong> "{suggestion.incorrectText}"<br />
                <strong>Issue:</strong> {suggestion.description} <br />
                <strong>Suggested correction:</strong>{" "}
                {suggestion.replacements.join(", ")}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default TextEditor;
