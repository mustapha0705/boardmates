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
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <polyline points="12 18 12 12" />
                  <polyline points="9 15 12 12 15 15" />
                </svg>
                Upload PGN
              </button>

              <button
                className={`tab ${activeTab === "paste" ? "active" : ""}`}
                onClick={() => setActiveTab("paste")}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="2" width="6" height="4" rx="1" />
                  <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="9" y1="16" x2="13" y2="16" />
                </svg>
                Paste PGN
              </button>
            </div>

            {/* Tab Content */}
            <div className="upload-area">
              {activeTab === "upload" && (
                <div className="upload-box">
                  <div className="upload-icon">
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                  </div>

                  <div className="upload-text">
                    <p className="bold">Drag and drop PGN file</p>
                    <p>or click to browse from your computer</p>
                  </div>

                  <input type="file" accept=".pgn" id="fileInput" hidden />

                  <button
                    className="secondary-btn"
                    onClick={() => document.getElementById("fileInput").click()}
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
              <input
                type="number"
                placeholder="e.g. 1500"
                defaultValue="1200"
              />
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
              By submitting, you agree to our community guidelines and analysis
              terms.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
