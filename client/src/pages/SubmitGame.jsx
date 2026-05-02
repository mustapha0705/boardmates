import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGame } from "../services/api";
import "../styles/submit-game.css";

const TIME_CONTROL_LABELS = {
  bullet: "1+0",
  blitz: "3+2",
  rapid: "15+10",
  classical: "30m",
  daily: "1d",
};

export default function SubmitGame() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("upload");
  const [pgnText, setPgnText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [averageRating, setAverageRating] = useState("1200");
  const [timeControl, setTimeControl] = useState("blitz");
  const [customTitle, setCustomTitle] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [playerColor, setPlayerColor] = useState("white");
  const [gameResult, setGameResult] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const mutation = useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      navigate("/");
    },
    onError: (err) => {
      setError(err.message || "Failed to submit game");
    },
  });

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = (evt) => setFileContent(evt.target.result);
    reader.onerror = () => setError("Failed to read file. Please try again.");
    reader.readAsText(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pgn")) {
      setError("Please drop a .pgn file.");
      return;
    }
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = (evt) => setFileContent(evt.target.result);
    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleSubmit() {
    const pgn = activeTab === "paste" ? pgnText.trim() : fileContent.trim();

    if (!pgn) {
      setError(
        activeTab === "paste"
          ? "Please paste a PGN."
          : "Please upload a PGN file.",
      );
      return;
    }

    if (!gameResult) {
      setError("Choose your result: win, loss, or draw.");
      return;
    }

    setError("");
    const tc = TIME_CONTROL_LABELS[timeControl] || timeControl;

    mutation.mutate({
      title: customTitle.trim() || undefined,
      pgn,
      timeControl: tc,
      averageRating: Number(averageRating) || null,
      reviewNotes: reviewNotes.trim() || null,
      playerColor,
      gameResult,
    });
  }

  return (
    <div className="feed">
      <title>Boardmates | Submit Game</title>
      <div className="page">
        <main className="container">
          <div className="title-section">
            <h1>Submit a Game</h1>
            <p>Share your chess game for human review.</p>
          </div>

          {error && <div className="submit-error">{error}</div>}

          <div className="card">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "upload" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("upload");
                  setError("");
                }}
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
                onClick={() => {
                  setActiveTab("paste");
                  setError("");
                }}
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

            <div className="upload-area">
              {activeTab === "upload" && (
                <div
                  className="upload-box"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
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
                    {fileName ? (
                      <>
                        <p className="bold file-name">{fileName}</p>
                        <p>File loaded successfully</p>
                      </>
                    ) : (
                      <>
                        <p className="bold">Drag and drop PGN file</p>
                        <p>or click to browse from your computer</p>
                      </>
                    )}
                  </div>

                  <input
                    type="file"
                    accept=".pgn"
                    ref={fileInputRef}
                    hidden
                    onChange={handleFileChange}
                  />

                  <button
                    className="secondary-btn"
                    onClick={() => fileInputRef.current.click()}
                  >
                    {fileName ? "Change File" : "Select File"}
                  </button>
                </div>
              )}

              {activeTab === "paste" && (
                <div className="paste-box">
                  <textarea
                    className="pgn-textarea"
                    placeholder={`Paste your PGN here...\n\ne.g.\n[Event "Casual Game"]\n[White "Player1"]\n[Black "Player2"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6`}
                    value={pgnText}
                    onChange={(e) => {
                      setPgnText(e.target.value);
                      setError("");
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 7h16M4 12h12M4 17h9" />
                </svg>
                Custom Title (Optional)
              </label>
              <input
                type="text"
                placeholder="might help identify game"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                maxLength={120}
              />
            </div>

            <div className="form-group">
              <label>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                Average Rating
              </label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={averageRating}
                onChange={(e) => setAverageRating(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Time Control
              </label>
              <div className="select-wrapper">
                <select
                  value={timeControl}
                  onChange={(e) => setTimeControl(e.target.value)}
                >
                  <option value="bullet">Bullet (1 min)</option>
                  <option value="blitz">Blitz (3-5 min)</option>
                  <option value="rapid">Rapid (10-30 min)</option>
                  <option value="classical">Classical (&gt;30 min)</option>
                  <option value="daily">Daily / Correspondence</option>
                </select>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="form-group">
              <label>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                You played as
              </label>
              <div className="select-wrapper">
                <select
                  value={playerColor}
                  onChange={(e) => setPlayerColor(e.target.value)}
                >
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </select>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="form-group">
              <label>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 5 2-7L2 9h7z" />
                </svg>
                Your result
              </label>
              <div className="select-wrapper">
                <select
                  value={gameResult}
                  onChange={(e) => setGameResult(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select win / loss / draw
                  </option>
                  <option value="win">Win</option>
                  <option value="lose">Loss</option>
                  <option value="draw">Draw</option>
                </select>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="form-group full">
            <label>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              What parts of the game should be reviewed? (Optional)
            </label>
            <textarea
              placeholder="e.g. I'm unsure about the middle-game transition around move 15..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </div>

          <div className="submit-section">
            <button
              className="primary-btn"
              onClick={handleSubmit}
              disabled={mutation.isPending}
            >
              <svg xmlns="http://w3.org" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>
              {mutation.isPending ? "Submitting..." : "Submit for Review"}
            </button>
            <p className="disclaimer">
              By submitting, you agree to our community guidelines.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
