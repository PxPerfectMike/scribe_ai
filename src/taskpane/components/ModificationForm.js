import React, { useState } from "react";
import axios from "axios";
import { DefaultButton, Dropdown } from "@fluentui/react";

/* global Word */

const ModificationForm = () => {
  const [response, setResponse] = useState("");
  const [commandOutput, setCommandOutput] = useState("");
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
    { key: "turkish", text: "Turkish" },
    { key: "dutch", text: "Dutch" },
    { key: "polish", text: "Polish" },
    { key: "romanian", text: "Romanian" },
    { key: "greek", text: "Greek" },
    { key: "hungarian", text: "Hungarian" },
    { key: "czech", text: "Czech" },
    { key: "swedish", text: "Swedish" },
    { key: "danish", text: "Danish" },
    { key: "finnish", text: "Finnish" },
    { key: "norwegian", text: "Norwegian" },
    { key: "slovak", text: "Slovak" },
    { key: "bulgarian", text: "Bulgarian" },
    { key: "catalan", text: "Catalan" },
    { key: "croatian", text: "Croatian" },
    { key: "filipino", text: "Filipino" },
    { key: "hebrew", text: "Hebrew" },
    { key: "indonesian", text: "Indonesian" },
    { key: "lithuanian", text: "Lithuanian" },
    { key: "malay", text: "Malay" },
    { key: "persian", text: "Persian" },
    { key: "thai", text: "Thai" },
    { key: "ukrainian", text: "Ukrainian" },
    { key: "vietnamese", text: "Vietnamese" },
    { key: "welsh", text: "Welsh" },
    // Add other languages here...
  ];

  const handleClick = async (action, e) => {
    e.preventDefault();
    try {
      // Get the highlighted text from Word
      const context = await Word.run(async (context) => {
        const highlight = context.document.getSelection();
        highlight.load("text");

        await context.sync();
        console.log(highlight.text);
        return { highlight: highlight.text, context: context };
      });

      const prompt =
        action === "summarize"
          ? `summarize this text:${context.highlight}`
          : `translate this text:${context.highlight} to ${selectedLanguage}`;

      const result = await axios.post("https://us-central1-cindyai.cloudfunctions.net/openai-cindy-request", {
        prompt: prompt,
      });

      // Remove the initial highlight
      await Word.run(context.context, (newContext) => {
        const selection = newContext.document.getSelection();
        selection.insertText("", Word.InsertLocation.replace);
        return newContext.sync();
      });

      setCommandOutput("Success!");

      // Write out the response
      let charArray = result.data.choices[0].text.trim().split("");

      for (let i = 0; i < charArray.length; i++) {
        // This will create a pause before adding the next character
        await new Promise((resolve) => setTimeout(resolve, 10));

        await Word.run(context.context, (newContext) => {
          const body = newContext.document.body;
          body.insertText(charArray[i], Word.InsertLocation.end);
          return newContext.sync();
        });

        setResponse((prev) => prev + charArray[i]);
      }
      setCommandOutput("");
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
      <div
        style={{
          border: "1px solid black",
          // padding: "10px",
          width: "200px",
          textAlign: "center",
          marginTop: "10px",
          color: commandOutput === "Success!" ? "green" : "red",
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
        {commandOutput}
      </div>

      <DefaultButton style={{ marginBottom: "2%" }} onClick={(e) => handleClick("summarize", e)}>
        Summarize
      </DefaultButton>
      <Dropdown
        style={{ marginBottom: "5%" }}
        placeholder="Select a language"
        options={languageOptions}
        onChange={(_, option) => setSelectedLanguage(option.key)}
      />
      <DefaultButton onClick={(e) => handleClick("translate", e)} disabled={!selectedLanguage}>
        Translate
      </DefaultButton>
    </div>
  );
};

export default ModificationForm;
