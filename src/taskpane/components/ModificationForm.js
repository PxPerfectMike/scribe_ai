import React, { useState } from "react";
import axios from "axios";
import { DefaultButton, Dropdown } from "@fluentui/react";
import Header from "./Header";
import logo from "../../../assets/full_logo.png";

const ModificationForm = () => {
  const [status, setStatus] = useState({ state: "idle", message: "Waiting..." });
  const [selectedLanguage, setSelectedLanguage] = useState(null);

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

  const fetchAndProcessText = async (action, context) => {
    let prompt = getPromptForAction(action, context.highlight);
    const result = await axios.post("https://us-central1-cindyai.cloudfunctions.net/openai-cindy-request", { prompt });
    return result.data.choices[0].text.trim();
  };

  const getPromptForAction = (action, text) => {
    switch (action) {
      case "summarize":
        return `summarize the following text:\n ${text}`;
      case "translate":
        return `translate this text: \n ${text} /n/n to ${selectedLanguage}`;
      case "elaborate":
        return `elaborate this text by adding context and intricacy:\n ${text}`;
      case "shorten":
        return `shorten this text by half its length:\n ${text}`;
      case "lengthen":
        return `lengthen this text by 50% its current length:\n ${text}`;
      default:
        return "";
    }
  };

  const handleClick = async (action, e) => {
    e.preventDefault();
    setStatus({ state: "processing", message: "" });

    try {
      const context = await Word.run(async (context) => {
        const highlight = context.document.getSelection();
        highlight.load("text");
        await context.sync();
        return { highlight: highlight.text, context: context };
      });

      if (context.highlight.length === 0 || context.highlight.length > 5200) {
        setStatus({ state: "error", message: "Invalid text length" });
        return;
      }

      const resultText = await fetchAndProcessText(action, context);
      console.log("Result Text: " + resultText);

      await Word.run(context.context, async (newContext) => {
        const selection = newContext.document.getSelection();
        selection.insertText("", Word.InsertLocation.replace);
        await newContext.sync();

        // Typing out the text character by character
        for (let char of resultText) {
          await new Promise((resolve) => setTimeout(resolve, 2)); // Adjust the timeout to control typing speed
          selection.insertText(char, Word.InsertLocation.end);
          await newContext.sync();
        }
      });

      statusSetter("idle", "Success!");
      doAfterTime(3000, () => {
        statusSetter("idle", "Waiting...");
      });
    } catch (error) {
      console.error(error);
      statusSetter("error", "Error");
    }
  };

  function statusSetter(state, message) {
    setStatus({ state: state, message: message });
  }

  function doAfterTime(time, callback) {
    setTimeout(callback, time);
  }

  const renderStatus = () => {
    switch (status.state) {
      case "processing":
        return "Processing...";
      case "idle":
        return status.message;
      case "error":
        return status.message;
      default:
        return "";
    }
  };

  return (
    <div
      className="top-level-container"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(#00a1ff, #f5f5f5, #f5f5f5, #08A04B)",
        height: "100%", // used to be 100vh and might need to go back to that
      }}
    >
      <div className="header">
        <Header logo={logo} />
      </div>
      <div
        style={{
          border: "1px solid black",
          width: "200px",
          textAlign: "center",
          marginTop: "10px",
          color:
            status.state === "idle" && status.message === "Success!"
              ? "green"
              : status.state === "processing"
              ? "black"
              : status.state === "error"
              ? "red"
              : "black",
          borderRadius: "2px",
          margin: "2%",
          width: "90%",
          backgroundColor: "#f5f5f5",
        }}
      >
        <strong
          style={{
            color: "white",
            float: "left",
            width: "20%",
            margin: 0,
            backgroundColor: "gray",
          }}
        >
          Status:{" "}
        </strong>
        <p className="status-output" style={{ margin: 0, textAlign: "center" }}>
          {renderStatus()}
        </p>
      </div>
      <h4>Formatting</h4>
      <div className="formatting-section" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <div
          className="restructure-buttons"
          style={{
            paddingY: "2%",
            display: "flex",
            flexDirection: "column",
            width: "auto",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DefaultButton
            style={{ marginBottom: "6%", width: "50%" }}
            onClick={(e) => handleClick("summarize", e)}
            disabled={status.state === "processing"}
          >
            Summarize
          </DefaultButton>
          <DefaultButton
            style={{ marginBottom: "2%", width: "50%" }}
            onClick={(e) => handleClick("elaborate", e)}
            disabled={status.state === "processing"}
          >
            Elaborate
          </DefaultButton>
        </div>
        <div
          className="length-buttons"
          style={{
            paddingY: "2%",
            display: "flex",
            flexDirection: "column",
            width: "auto",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DefaultButton
            style={{ marginBottom: "6%", width: "50%" }}
            onClick={(e) => handleClick("shorten", e)}
            disabled={status.state === "processing"}
          >
            Shorten
          </DefaultButton>
          <DefaultButton
            style={{ marginBottom: "2%", width: "50%" }}
            onClick={(e) => handleClick("lengthen", e)}
            disabled={status.state === "processing"}
          >
            Lengthen
          </DefaultButton>
        </div>
      </div>
      <div className="translate-section" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h4>Translation</h4>
        <Dropdown
          style={{ marginBottom: "5%" }}
          placeholder="Select a language"
          options={languageOptions}
          onChange={(_, option) => setSelectedLanguage(option.key)}
        />
        <DefaultButton onClick={(e) => handleClick("translate", e)} disabled={status.state === "processing"}>
          Translate
        </DefaultButton>
      </div>
    </div>
  );
};

export default ModificationForm;
