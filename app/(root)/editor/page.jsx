"use client";
import React, { useEffect, useState } from "react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

function EditorPage() {
  const [content, setContent] = useState("");
  useEffect(()=>{
    console.log(content);
  },[content])
  return (
    <div className="p-4">
      <SimpleEditor
        onUpdate={({ editor }) => {
          setContent(editor.getHTML()); // get content as HTML
        }}
      />

      {/* Display Output */}
      <div className="mt-6 p-4 border rounded">
        <h2 className="font-bold mb-2">Output:</h2>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}

export default EditorPage;