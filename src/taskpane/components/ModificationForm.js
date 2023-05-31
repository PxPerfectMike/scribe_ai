import React, { useState } from "react";
import axios from "axios";
import { DefaultButton } from "@fluentui/react";

/* global Word */

const ModificationForm = () => {
  const [response, setResponse] = useState("");
  const [commandOutput, setCommandOutput] = useState("");

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      // Get the highlighted text from Word
      const highlight = await Word.run(async (context) => {
        const highlight = context.document.getSelection();
        highlight.load("text");

        await context.sync();
        console.log(highlight.text);
        return highlight.text;
      });

      const result = await axios.post("https://us-central1-cindyai.cloudfunctions.net/openai-cindy-request", {
        prompt: `summarize this text:${highlight}`,
      });

      setResponse(result.data.choices[0].text.trim());
      setCommandOutput("Success!");
    } catch (error) {
      console.error(error);
      setResponse("An error occurred. Please try again.");
      setCommandOutput("Error!");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <textarea value={commandOutput} readOnly style={{ margin: "1%" }} />
      <textarea value={response} readOnly style={{ margin: "1%" }} />
      <DefaultButton onClick={handleClick}>Summarize</DefaultButton>
    </div>
  );
};

export default ModificationForm;
