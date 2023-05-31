import React, { useState } from "react";
import axios from "axios";
import { DefaultButton, Dropdown } from "@fluentui/react";

/* global Word */

const ModificationForm = () => {
  const [response, setResponse] = useState("");
  const [commandOutput, setCommandOutput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [idle, setIdle] = useState(true);

  const languageOptions = [
    { key: "chinese-simplified", text: "Chinese (Simplified)" },
    { key: "chinese-traditional", text: "Chinese (Traditional)" },
    { key: "english", text: "English" },
    { key: "spanish", text: "Spanish" },
    { key: "french", text: "French" },
    { key: "german", text: "German" },
    { key: "italian", text: "Italian" },
    { key: "portuguese", text: "Portuguese" },
    { key: "russian", text: "Russian" },
    { key: "japanese", text: "Japanese" },
    { key: "korean", text: "Korean" },
    { key: "arabic", text: "Arabic" },
    { key: "hindi", text: "Hindi" },
    { key: "hebrew", text: "Hebrew" },
    { key: "vietnamese", text: "Vietnamese" },
    // Add other languages here...
  ];

  const handleClick = async (action, e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const context = await Word.run(async (context) => {
        const highlight = context.document.getSelection();
        highlight.load("text");

        await context.sync();
        console.log(highlight.text);
        return { highlight: highlight.text, context: context };
      });

      const prompt =
        action === "summarize"
          ? `summarize this text ${context.highlight}`
          : "translate"
          ? `translate this text ${context.highlight} to ${selectedLanguage}`
          : `elaborate this text ${context.highlight}`;

      const result = await axios.post("https://us-central1-cindyai.cloudfunctions.net/openai-cindy-request", {
        prompt: prompt,
      });

      await Word.run(context.context, (newContext) => {
        const selection = newContext.document.getSelection();
        selection.insertText("", Word.InsertLocation.replace);
        return newContext.sync();
      });
      setProcessing(false);
      setIdle(false);
      setCommandOutput("Success!");

      let charArray = result.data.choices[0].text.trim().split("");

      for (let i = 0; i < charArray.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10));

        await Word.run(context.context, (newContext) => {
          const body = newContext.document.body;
          body.insertText(charArray[i], Word.InsertLocation.end);
          return newContext.sync();
        });
      }
      setCommandOutput("");
      setIdle(true);
    } catch (error) {
      console.error(error);
      setCommandOutput("Error!");
    } finally {
      setProcessing(false);
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
      <div
        style={{
          border: "1px solid black",
          width: "200px",
          textAlign: "center",
          marginTop: "10px",
          color: commandOutput === "Success!" ? "green" : "Processing..." ? "black" : "red",
          borderRadius: "2px",
          margin: "2% auto",
        }}
      >
        <strong
          style={{
            color: "white",
            float: "left",
            width: "30%",
            margin: 0,
            backgroundColor: "gray",
          }}
        >
          Status:{" "}
        </strong>
        {processing ? "Processing..." : idle ? "Idle" : commandOutput}
      </div>
      <div className="formatting-section" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h4>Formatting</h4>
        <DefaultButton
          style={{ marginBottom: "6%", width: "100%" }}
          onClick={(e) => handleClick("summarize", e)}
          disabled={processing}
        >
          Summarize
        </DefaultButton>
        <DefaultButton
          style={{ marginBottom: "2%", width: "100%" }}
          onClick={(e) => handleClick("summarize", e)}
          disabled={processing}
        >
          Elaborate
        </DefaultButton>
      </div>
      <div className="translate-section" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h4>Translation</h4>
        <Dropdown
          style={{ marginBottom: "5%" }}
          placeholder="Select a language"
          options={languageOptions}
          onChange={(_, option) => setSelectedLanguage(option.key)}
        />
        <DefaultButton onClick={(e) => handleClick("translate", e)} disabled={!selectedLanguage || processing}>
          Translate
        </DefaultButton>
      </div>
    </div>
  );
};

export default ModificationForm;
