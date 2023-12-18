// src/App.js
import React, { useState } from "react";
import MergeMultipleFiles from "./util/mergeMultipleFiles/MergeMultipleFiles";
import MyDropzone from "./components/myDropZone/MyDropzone";
import "./App.css";
import logo from "./assets/logo.png";
function App() {
  const [files, setFiles] = useState([]);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} />
      </header>
      <main className="main">
        <MyDropzone onDataChange={setFiles} className="myDropzone" />
        <MergeMultipleFiles files={files} />
      </main>
    </div>
  );
}

export default App;
