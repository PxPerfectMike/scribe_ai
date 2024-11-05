import React, { useState, useCallback, useEffect } from "react";
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
  Text,
  TeachingBubble,
} from "@fluentui/react";
import Header from "./Header";
import logo from "../../../assets/full_logo.png";
import { calculateMaxChars, estimateTokens, AVAILABLE_TOKENS, languageTokenMultipliers } from "./tokenUtils";

const ModificationForm = () => {
  // Constants
  const TYPING_SPEED = 2;
  const API_ENDPOINT = "https://us-central1-cindyai.cloudfunctions.net/openai-cindy-request";

  // State management
  const [status, setStatus] = useState({ state: "idle", message: "Ready" });
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [error, setError] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [showTeachingBubble, setShowTeachingBubble] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [maxChars, setMaxChars] = useState(calculateMaxChars("english"));

  const languageOptions = Object.keys(languageTokenMultipliers).map((lang) => ({
    key: lang,
    text: lang
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));

  // Effect to monitor selected text
  useEffect(() => {
    const checkSelection = async () => {
      try {
        await Word.run(async (context) => {
          const selection = context.document.getSelection();
          selection.load("text");
          await context.sync();

          const text = selection.text;
          setSelectedText(text);
          setCharCount(text.length);
        });
      } catch (error) {
        console.error("Error checking selection:", error);
      }
    };

    const interval = setInterval(checkSelection, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update character limit when language changes
  useEffect(() => {
    const newMaxChars = calculateMaxChars(selectedLanguage);
    setMaxChars(newMaxChars);
  }, [selectedLanguage]);

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

    const totalChars = text.length;
    let processedChars = 0;

    for (let char of text) {
      await new Promise((resolve) => setTimeout(resolve, TYPING_SPEED));
      selection.insertText(char, Word.InsertLocation.end);
      await newContext.sync();

      processedChars++;
      setProcessingProgress(Math.round((processedChars / totalChars) * 100));
    }
  };

  const handleClick = async (action, e) => {
    e.preventDefault();
    setError(null);
    setProcessingProgress(0);
    setStatus({ state: "processing", message: "Processing your request..." });

    try {
      if (!selectedText) {
        throw new Error("Please select some text first");
      }

      const actionMaxChars = calculateMaxChars(selectedLanguage, action);
      if (charCount > actionMaxChars) {
        throw new Error(
          `Selected text is too long. Maximum length is ${actionMaxChars.toLocaleString()} characters for ${
            selectedLanguage || "English"
          } (current: ${charCount.toLocaleString()})`
        );
      }

      const tokens = estimateTokens(selectedText, selectedLanguage);
      if (tokens > AVAILABLE_TOKENS) {
        throw new Error(`Selected text is too long. Please select less text.`);
      }

      if (action === "translate" && !selectedLanguage) {
        setShowTeachingBubble(true);
        throw new Error("Please select a target language");
      }

      const response = await axios.post(API_ENDPOINT, {
        prompt: getPromptForAction(action, selectedText),
      });

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error("Invalid response from API");
      }

      const resultText = response.data.choices[0].message.content.trim();

      await Word.run(async (context) => {
        await processText(resultText, context);
      });

      setStatus({ state: "success", message: "Changes applied successfully!" });
      setTimeout(() => setStatus({ state: "idle", message: "Ready" }), 3000);
    } catch (error) {
      console.error("Operation failed:", error);
      const errorMessage = error.response?.data?.error || error.message || "An unexpected error occurred";
      setError(errorMessage);
      setStatus({ state: "error", message: "Error" });

      if (process.env.NODE_ENV === "development") {
        console.log("Token debug info:", {
          estimatedTokens: estimateTokens(selectedText, selectedLanguage),
          maxTokens: AVAILABLE_TOKENS,
          language: selectedLanguage,
          textLength: selectedText.length,
        });
      }
    }
  };

  const renderStatusIndicator = () => (
    <Stack tokens={{ childrenGap: 10 }} style={{ width: "90%" }}>
      <div
        className="status-container"
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "0.5rem",
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

      {status.state === "processing" && (
        <Stack.Item>
          <div style={{ width: "100%", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
            <div
              style={{
                width: `${processingProgress}%`,
                height: "4px",
                backgroundColor: "#0078d4",
                borderRadius: "4px",
                transition: "width 0.3s ease-in-out",
              }}
            />
          </div>
          <Text variant="small" style={{ textAlign: "center" }}>
            {processingProgress}% complete
          </Text>
        </Stack.Item>
      )}

      <Stack.Item>
        <Text
          variant="small"
          style={{
            color: charCount > maxChars ? "red" : charCount > maxChars * 0.8 ? "orange" : "black",
          }}
        >
          Characters: {charCount.toLocaleString()} / {maxChars.toLocaleString()}
        </Text>
      </Stack.Item>
    </Stack>
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

      {showTeachingBubble && (
        <TeachingBubble
          target=".translate-section"
          headline="Select a Language"
          onDismiss={() => setShowTeachingBubble(false)}
        >
          Please select a target language before translating
        </TeachingBubble>
      )}
    </div>
  );
};

export default ModificationForm;
