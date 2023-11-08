import React, { useState } from "react";
import axios from "axios";
import { DefaultButton, Dropdown } from "@fluentui/react";
import Header from "./Header";
import logo from "../../../assets/full_logo.png";

const ModificationForm = () => {
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

      if (context.highlight.length === 0) {
        setCommandOutput("No text selected");
        setIdle(false);
        setProcessing(false);
        return;
      }

      if (context.highlight.length > 5200) {
        setCommandOutput(`Character count ${context.highlight.length} (max 5200)`);
        setIdle(false);
        setProcessing(false);
        return;
      }

      let prompt = "";
      // Change the prompt based on the action
      switch (action) {
        case "summarize":
          prompt = `summarize the following text:\n ${context.highlight}`;
          break;
        case "translate":
          prompt = `translate this text: \n ${context.highlight} /n/n to ${selectedLanguage}`;
          break;
        case "elaborate":
          prompt = `elaborate this text by adding context and intricacy:\n ${context.highlight}`;
          break;
        case "shorten":
          prompt = `shorten this text by half its length:\n ${context.highlight}`;
          break;
        case "lengthen":
          prompt = `lengthen this text by 50% its current length:\n ${context.highlight}`;
          break;
        default:
          break;
      }

      console.log(prompt);

      const result = await axios.post("https://us-central1-cindyai.cloudfunctions.net/openai-cindy-request", {
        prompt: prompt,
      });

      // it would be a good idea to combine the following two lines into one function by adding split to the result text and replace all the charArray with resultText
      let resultText = result.data.choices[0].text.trim();
      let charArray = resultText.split("");

      await Word.run(context.context, async (newContext) => {
        const selection = newContext.document.getSelection();
        selection.insertText("", Word.InsertLocation.replace);
        await newContext.sync();

        // reduce app state to one function that has finite state
        setProcessing(false);
        setIdle(false);
        setCommandOutput("Success!");

        // this is a hacky way to get the text to type out one character at a time
        for (let i = 0; i < charArray.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 10));
          selection.insertText(charArray[i], Word.InsertLocation.end);
          await newContext.sync();
        }
      });

      setIdle(true);
      setCommandOutput("");
    } catch (error) {
      console.error(error);
      setCommandOutput("Error!");
    } finally {
      setProcessing(false);
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
        height: "100vh",
      }}
    >
      <div className="header">
        <Header message="Fionn Scribe" logo={logo} />
      </div>
      <div
        style={{
          border: "1px solid black",
          width: "200px",
          textAlign: "center",
          marginTop: "10px",
          color: commandOutput === "Success!" ? "green" : "Processing..." ? "black" : "red",
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
          {processing ? "Processing..." : idle ? "Idle" : commandOutput}
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
            disabled={processing}
          >
            Summarize
          </DefaultButton>
          <DefaultButton
            style={{ marginBottom: "2%", width: "50%" }}
            onClick={(e) => handleClick("elaborate", e)}
            disabled={processing}
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
            disabled={processing}
          >
            Shorten
          </DefaultButton>
          <DefaultButton
            style={{ marginBottom: "2%", width: "50%" }}
            onClick={(e) => handleClick("lengthen", e)}
            disabled={processing}
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
        <DefaultButton onClick={(e) => handleClick("translate", e)} disabled={!selectedLanguage || processing}>
          Translate
        </DefaultButton>
      </div>
    </div>
  );
};

export default ModificationForm;
