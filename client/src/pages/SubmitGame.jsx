import React, { useState } from "react";
import "../styles/submit-game.css";

export default function SubmitGame() {
  const [activeTab, setActiveTab] = useState("upload");
  const [pgnText, setPgnText] = useState("");

  return (
    <div className="feed">
    <div className="page">
      <main className="container">
        {/* Title */}
        <div className="title-section">
          <h1>Submit a Game</h1>
          <p>Share your chess match for analysis or community review.</p>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "upload" ? "active" : ""}`}
              onClick={() => setActiveTab("upload")}
            >
              <span className="material-symbols-outlined">upload_file</span>
              Upload PGN
            </button>

            <button
              className={`tab ${activeTab === "paste" ? "active" : ""}`}
              onClick={() => setActiveTab("paste")}
            >
              <span className="material-symbols-outlined">content_paste</span>
              Paste PGN
            </button>
          </div>

          {/* Tab Content */}
          <div className="upload-area">
            {activeTab === "upload" && (
              <div className="upload-box">
                <div className="upload-icon">
                  <span className="material-symbols-outlined">
                    cloud_upload
                  </span>
                </div>

                <div className="upload-text">
                  <p className="bold">Drag and drop PGN file</p>
                  <p>or click to browse from your computer</p>
                </div>

                <input
                  type="file"
                  accept=".pgn"
                  id="fileInput"
                  hidden
                />

                <button
                  className="secondary-btn"
                  onClick={() =>
                    document.getElementById("fileInput").click()
                  }
                >
                  Select File
                </button>
              </div>
            )}

            {activeTab === "paste" && (
              <div className="paste-box">
                <textarea
                  className="pgn-textarea"
                  placeholder="Paste your PGN here..."
                  value={pgnText}
                  onChange={(e) => setPgnText(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="form-grid">
          <div className="form-group">
            <label>
              <span className="material-symbols-outlined">trending_up</span>
              Average Rating
            </label>
            <input type="number" placeholder="e.g. 1500" defaultValue="1200" />
          </div>

          <div className="form-group">
            <label>
              <span className="material-symbols-outlined">schedule</span>
              Time Control
            </label>
            <div className="select-wrapper">
              <select defaultValue="blitz">
                <option value="bullet">Bullet (1 min)</option>
                <option value="blitz">Blitz (3-5 min)</option>
                <option value="rapid">Rapid (10-30 min)</option>
                <option value="classical">Classical (&gt;30 min)</option>
                <option value="daily">Daily / Correspondence</option>
              </select>
              <span className="material-symbols-outlined dropdown-icon">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="form-group full">
          <label>
            <span className="material-symbols-outlined">comment</span>
            What parts of the game should be reviewed? (Optional)
          </label>
          <textarea placeholder="e.g. I'm unsure about the middle-game transition around move 15..." />
        </div>

        {/* Submit */}
        <div className="submit-section">
          <button className="primary-btn">
            <span className="material-symbols-outlined">send</span>
            Submit for Review
          </button>
          <p className="disclaimer">
            By submitting, you agree to our community guidelines and analysis terms.
          </p>
        </div>
      </main>
    </div></div>
  );
}