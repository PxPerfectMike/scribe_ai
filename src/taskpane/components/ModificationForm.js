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

      let resultText = result.data.choices[0].text.trim();
      let charArray = resultText.split("");

      await Word.run(context.context, async (newContext) => {
        const selection = newContext.document.getSelection();
        selection.insertText("", Word.InsertLocation.replace);
        await newContext.sync();

        for (let i = 0; i < charArray.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 10));
          selection.insertText(charArray[i], Word.InsertLocation.end);
          await newContext.sync();
        }
      });

      setProcessing(false);
      setIdle(false);
      setCommandOutput("Success!");
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
          onClick={(e) => handleClick("elaborate", e)}
          disabled={processing}
        >
          Elaborate
        </DefaultButton>
        <DefaultButton
          style={{ marginBottom: "6%", width: "100%" }}
          onClick={(e) => handleClick("shorten", e)}
          disabled={processing}
        >
          Shorten
        </DefaultButton>
        <DefaultButton
          style={{ marginBottom: "2%", width: "100%" }}
          onClick={(e) => handleClick("lengthen", e)}
          disabled={processing}
        >
          Lengthen
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
