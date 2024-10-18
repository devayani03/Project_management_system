import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Quill's snow theme
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

function TextEditor() {
  const [editorContent, setEditorContent] = useState("");

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

  const saveContent = async () => {
    try {
      const editor = document.querySelector(".ql-editor"); // Quill editor content container

      // Use html2canvas to capture the content of the editor
      const canvas = await html2canvas(editor);

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate the width/height ratio and resize the image
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      pdf.save("text-editor-content.pdf"); // Save the PDF with the specified filename
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="text-editor">
      <ReactQuill
        value={editorContent}
        onChange={handleEditorChange}
        placeholder="Write something amazing..."
      />
      <button onClick={saveContent}>Save as PDF</button>
    </div>
  );
}

export default TextEditor;
