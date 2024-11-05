import React, { useState, useCallback } from "react";
import axios from "axios";
import {
  DefaultButton,
  Dropdown,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Stack,
  StackItem,
} from "@fluentui/react";
import Header from "./Header";
import logo from "../../../assets/full_logo.png";

const ModificationForm = () => {
  // Constants
  const MAX_TEXT_LENGTH = 5200;
  const TYPING_SPEED = 2;
  const API_ENDPOINT = "https://us-central1-cindyai.cloudfunctions.net/openai-cindy-request";

  // State management
  const [status, setStatus] = useState({ state: "idle", message: "Ready" });
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);

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
  ];

  const getPromptForAction = useCallback(
    (action, text) => {
      const prompts = {
        summarize: `Generate a concise summary of this text, maintaining key points and main ideas: ${text}`,
        translate: `Translate this text to ${selectedLanguage}, maintaining the original tone and meaning: ${text}`,
        elaborate: `Expand and enhance this text with additional details and context while maintaining its core message: ${text}`,
        shorten: `Create a shorter version of this text while preserving its essential meaning: ${text}`,
        lengthen: `Thoughtfully expand this text by adding relevant details and context: ${text}`,
      };
      return prompts[action] || "";
    },
    [selectedLanguage]
  );

  const processText = async (text, newContext) => {
    const selection = newContext.document.getSelection();
    selection.insertText("", Word.InsertLocation.replace);
    await newContext.sync();

    for (let char of text) {
      await new Promise((resolve) => setTimeout(resolve, TYPING_SPEED));
      selection.insertText(char, Word.InsertLocation.end);
      await newContext.sync();
    }
  };

  const handleClick = async (action, e) => {
    e.preventDefault();
    setError(null);
    setStatus({ state: "processing", message: "Processing your request..." });

    try {
      // Get selected text
      const context = await Word.run(async (context) => {
        const highlight = context.document.getSelection();
        highlight.load("text");
        await context.sync();
        return { highlight: highlight.text, context };
      });

      // Validate text selection
      if (!context.highlight) {
        throw new Error("Please select some text first");
      }

      if (context.highlight.length > MAX_TEXT_LENGTH) {
        throw new Error(`Selected text must be less than ${MAX_TEXT_LENGTH} characters`);
      }

      if (action === "translate" && !selectedLanguage) {
        throw new Error("Please select a target language");
      }

      // Make API request
      const response = await axios.post(API_ENDPOINT, {
        prompt: getPromptForAction(action, context.highlight),
      });

      // Extract the response text from the GPT-3.5 response
      const resultText = response.data.choices[0].message.content.trim();

      // Apply changes to document
      await Word.run(context.context, async (newContext) => {
        await processText(resultText, newContext);
      });

      setStatus({ state: "success", message: "Changes applied successfully!" });
      setTimeout(() => setStatus({ state: "idle", message: "Ready" }), 3000);
    } catch (error) {
      console.error("Operation failed:", error);
      let errorMessage = "An error occurred while processing your request";

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setStatus({ state: "error", message: "Error" });
    }
  };

  const renderStatusIndicator = () => (
    <div
      className="status-container"
      style={{
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "0.5rem",
        marginBottom: "1rem",
        width: "90%",
        backgroundColor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <span style={{ fontWeight: "bold" }}>Status: </span>
        <span
          style={{
            color: status.state === "success" ? "green" : status.state === "error" ? "red" : "black",
          }}
        >
          {status.message}
        </span>
      </div>
      {status.state === "processing" && <Spinner size={SpinnerSize.small} />}
    </div>
  );

  return (
    <div
      className="top-level-container"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        background: "linear-gradient(#00a1ff, #f5f5f5, #f5f5f5, #08A04B)",
        height: "100%",
        padding: "1rem",
        overflow: "auto",
      }}
    >
      <Header logo={logo} />

      {error && (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={false}
          dismissButtonAriaLabel="Close"
          onDismiss={() => setError(null)}
          style={{ marginBottom: "1rem", width: "90%" }}
        >
          {error}
        </MessageBar>
      )}

      {renderStatusIndicator()}

      <Stack tokens={{ childrenGap: 20 }}>
        <StackItem>
          <h4 style={{ textAlign: "center", margin: "0 0 10px 0" }}>Text Modification</h4>
          <div
            className="formatting-section"
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <DefaultButton
              text="Summarize"
              onClick={(e) => handleClick("summarize", e)}
              disabled={status.state === "processing"}
              styles={{
                root: { width: "120px", margin: "5px" },
              }}
            />
            <DefaultButton
              text="Elaborate"
              onClick={(e) => handleClick("elaborate", e)}
              disabled={status.state === "processing"}
              styles={{
                root: { width: "120px", margin: "5px" },
              }}
            />
            <DefaultButton
              text="Shorten"
              onClick={(e) => handleClick("shorten", e)}
              disabled={status.state === "processing"}
              styles={{
                root: { width: "120px", margin: "5px" },
              }}
            />
            <DefaultButton
              text="Lengthen"
              onClick={(e) => handleClick("lengthen", e)}
              disabled={status.state === "processing"}
              styles={{
                root: { width: "120px", margin: "5px" },
              }}
            />
          </div>
        </StackItem>

        <StackItem>
          <h4 style={{ textAlign: "center", margin: "0 0 10px 0" }}>Translation</h4>
          <div
            className="translate-section"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Dropdown
              style={{ width: "200px" }}
              placeholder="Select a language"
              options={languageOptions}
              onChange={(_, option) => setSelectedLanguage(option.key)}
              disabled={status.state === "processing"}
            />
            <DefaultButton
              text="Translate"
              onClick={(e) => handleClick("translate", e)}
              disabled={!selectedLanguage || status.state === "processing"}
              styles={{
                root: { width: "120px" },
              }}
            />
          </div>
        </StackItem>
      </Stack>
    </div>
  );
};

export default ModificationForm;
