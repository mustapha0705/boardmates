import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGame } from "../services/api";
import { validatePlayablePgn } from "../utils/pgnValidation";
import { formatPlayedOn, readPgnMetadata } from "../adapters/pgnMetadata";
import { useAuth } from "../context/useAuth";
import Button from "../components/ui/Button.jsx";
import Callout from "../components/ui/Callout.jsx";
import Card from "../components/ui/Card.jsx";
import MiniBoard from "../components/ui/MiniBoard.jsx";
import { SelectField, TextAreaField, TextField } from "../components/ui/Fields.jsx";
import "../styles/submit.css";

/** The server stores these presets, not the real clock; unchanged from the previous form. */
const TIME_CONTROL_LABELS = {
  bullet: "1+0",
  blitz: "3+2",
  rapid: "15+10",
  classical: "30m",
  daily: "1d",
};

const TIME_CONTROL_OPTIONS = [
  { value: "bullet", label: "Bullet (1 min)" },
  { value: "blitz", label: "Blitz (3-5 min)" },
  { value: "rapid", label: "Rapid (10-30 min)" },
  { value: "classical", label: "Classical (>30 min)" },
  { value: "daily", label: "Daily / Correspondence" },
];

const STEPS = ["Import", "Confirm details", "Your question", "Submit"];

const RESULT_LABELS = { win: "Win", lose: "Loss", draw: "Draw" };
const COLOR_LABELS = { white: "White", black: "Black" };

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <polyline points="9 15 12 12 15 15" />
      <line x1="12" y1="12" x2="12" y2="18" />
    </svg>
  );
}

function PasteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Stepper({ step, onGo }) {
  return (
    <div className="bm-stepper-wrap">
      <ol className="bm-stepper" aria-label="Submission steps">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const state = number < step ? "done" : number === step ? "current" : "upcoming";
          const content = (
            <>
              <span className="bm-stepper__mark">{state === "done" ? <CheckIcon /> : number}</span>
              <span className="bm-stepper__label">{label}</span>
            </>
          );
          return (
            <li key={label} className={`bm-stepper__item is-${state}`} aria-current={state === "current" ? "step" : undefined}>
              {state === "done" ? (
                <button type="button" className="bm-stepper__button" onClick={() => onGo(number)}>
                  {content}
                  <span className="bm-visually-hidden"> (completed, go back)</span>
                </button>
              ) : (
                <span className="bm-stepper__button">{content}</span>
              )}
            </li>
          );
        })}
      </ol>
      {/* Small screens hide the step labels; this caption repeats the current one visually. */}
      <p className="bm-stepper__caption" aria-hidden="true">
        Step {step} of {STEPS.length}: {STEPS[step - 1]}
      </p>
    </div>
  );
}

function Fact({ label, children }) {
  return (
    <div className="bm-submit__fact">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function GuestActions({ location }) {
  return (
    <div className="bm-submit__guest-actions">
      <Button as={Link} to="/signup" state={{ from: location }} variant="primary" size="sm">
        Create account
      </Button>
      <Button as={Link} to="/login" state={{ from: location }} variant="secondary" size="sm">
        Sign in
      </Button>
    </div>
  );
}

export default function SubmitGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const [step, setStep] = useState(1);
  const [source, setSource] = useState("upload");
  const [pgnText, setPgnText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [dragging, setDragging] = useState(false);
  const [averageRating, setAverageRating] = useState("");
  const [timeControl, setTimeControl] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [playerColor, setPlayerColor] = useState("");
  const [gameResult, setGameResult] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const headingRef = useRef(null);
  const firstRender = useRef(true);

  const pgn = source === "paste" ? pgnText.trim() : fileContent.trim();
  const pgnCheck = useMemo(() => (pgn ? validatePlayablePgn(pgn) : null), [pgn]);
  const metadata = useMemo(
    () => (pgnCheck?.ok ? readPgnMetadata(pgn, { chessUsername: user?.chessUsername }) : null),
    [pgn, pgnCheck, user?.chessUsername],
  );

  // Move focus to the new step's heading so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const mutation = useMutation({
    mutationFn: createGame,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      if (created?.id) {
        navigate(`/game-detail/${created.id}`, { state: { justSubmitted: true } });
      } else {
        navigate("/");
      }
    },
    onError: (err) => {
      const fromApi = err?.body?.errors?.[0]?.message;
      setError(fromApi || err.message || "Failed to submit game");
    },
  });

  function readFile(file) {
    setFileName(file.name);
    setError("");
    const reader = new FileReader();
    reader.onload = (evt) => setFileContent(evt.target.result);
    reader.onerror = () => setError("Failed to read file. Please try again.");
    reader.readAsText(file);
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) readFile(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pgn")) {
      setError("Please drop a .pgn file.");
      return;
    }
    setSource("upload");
    readFile(file);
  }

  function goTo(nextStep) {
    setError("");
    setStep(nextStep);
  }

  function continueFromImport() {
    if (!pgn) {
      setError(source === "paste" ? "Please paste a PGN." : "Please upload a PGN file.");
      return;
    }
    if (!pgnCheck?.ok) {
      setError(pgnCheck?.message ?? "That doesn’t look like valid PGN.");
      return;
    }

    // Fill only empty fields, so going back and forth never overwrites the player's choices.
    let filled = false;
    if (metadata) {
      if (!playerColor && metadata.guessedColor) {
        setPlayerColor(metadata.guessedColor);
        filled = true;
      }
      if (!gameResult && metadata.guessedOutcome) {
        setGameResult(metadata.guessedOutcome);
        filled = true;
      }
      if (!timeControl && metadata.category) {
        setTimeControl(metadata.category);
        filled = true;
      }
      if (!String(averageRating).trim() && metadata.averageRating) {
        setAverageRating(String(metadata.averageRating));
        filled = true;
      }
    }
    if (filled) setPrefilled(true);
    goTo(2);
  }

  function validateDetails() {
    if (!gameResult) return "Choose your result: win, loss, or draw.";
    if (!playerColor) return "Choose whether you played as White or Black.";
    if (!timeControl) return "Choose a time control.";
    const ratingStr = String(averageRating).trim();
    if (!ratingStr) return "Enter the average rating of both players.";
    const ratingNum = Number(ratingStr);
    if (!Number.isFinite(ratingNum) || ratingNum <= 0 || !Number.isInteger(ratingNum)) {
      return "Enter a valid average rating (whole number).";
    }
    return "";
  }

  function continueFromDetails() {
    const message = validateDetails();
    if (message) {
      setError(message);
      return;
    }
    goTo(3);
  }

  function handleSubmit() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    const detailsError = validateDetails();
    if (detailsError) {
      setError(detailsError);
      return;
    }
    const check = validatePlayablePgn(pgn);
    if (!check.ok) {
      setError(check.message);
      return;
    }

    setError("");
    mutation.mutate({
      title: customTitle.trim() || undefined,
      pgn,
      timeControl: TIME_CONTROL_LABELS[timeControl] || timeControl,
      averageRating: Number(String(averageRating).trim()),
      reviewNotes: reviewNotes.trim() || null,
      playerColor,
      gameResult,
      isPrivate,
    });
  }

  const errorCallout = error ? (
    <Callout tone="error" role="alert" title="Check this before continuing">
      {error}
    </Callout>
  ) : null;

  const timeControlLabel = TIME_CONTROL_OPTIONS.find((option) => option.value === timeControl)?.label;
  const question = reviewNotes.trim();

  return (
    <div className="bm-submit">
      <title>Boardmates | Submit Game</title>

      {!isAuthenticated ? (
        <Callout tone="info" title="Sign in to submit a game">
          You can look through the form first. Submitting needs a free account.
        </Callout>
      ) : null}

      <Stepper step={step} onGo={goTo} />

      {step === 1 ? (
        <section className="bm-submit__step" aria-labelledby="submit-step-heading">
          <div className="bm-submit__intro">
            <h1 className="bm-h1" id="submit-step-heading" ref={headingRef} tabIndex={-1}>
              Import the game
            </h1>
            <p className="bm-body">Upload a .pgn file or paste the PGN text. What we can read from it is filled in for you on the next step.</p>
          </div>

          <div
            className={`bm-submit__import ${dragging ? "is-dragging" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="bm-submit__options" role="radiogroup" aria-label="How to add your game">
              <button
                type="button"
                role="radio"
                aria-checked={source === "upload"}
                className={`bm-submit__option ${source === "upload" ? "is-selected" : ""}`}
                onClick={() => {
                  setSource("upload");
                  setError("");
                }}
              >
                <span className="bm-submit__option-icon">
                  <UploadIcon />
                </span>
                <span className="bm-submit__option-title">Upload a .pgn file</span>
                <span className="bm-submit__option-hint">Or drag it onto this panel</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={source === "paste"}
                className={`bm-submit__option ${source === "paste" ? "is-selected" : ""}`}
                onClick={() => {
                  setSource("paste");
                  setError("");
                }}
              >
                <span className="bm-submit__option-icon">
                  <PasteIcon />
                </span>
                <span className="bm-submit__option-title">Paste PGN text</span>
                <span className="bm-submit__option-hint">Straight from the clipboard</span>
              </button>
            </div>

            {source === "upload" ? (
              <div className="bm-submit__drop">
                <input type="file" accept=".pgn" ref={fileInputRef} hidden onChange={handleFileChange} />
                <p className="bm-body bm-body--strong">
                  {fileName ? (
                    <>
                      Loaded <span className="bm-mono">{fileName}</span>
                    </>
                  ) : (
                    "Drag and drop a .pgn file here, or browse for one."
                  )}
                </p>
                <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  {fileName ? "Choose a different file" : "Browse files"}
                </Button>
              </div>
            ) : (
              <TextAreaField
                label="PGN"
                className="bm-submit__pgn"
                rows={8}
                spellCheck={false}
                placeholder={`[Event "Casual Game"]\n[White "Player1"]\n[Black "Player2"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6`}
                value={pgnText}
                onChange={(event) => {
                  setPgnText(event.target.value);
                  setError("");
                }}
              />
            )}
          </div>

          {pgn && pgnCheck ? (
            pgnCheck.ok && metadata ? (
              <div className="bm-submit__read" role="status">
                <span className="bm-submit__read-icon">
                  <CheckIcon />
                </span>
                <span>
                  Read <span className="bm-mono">{metadata.plyCount}</span> half-moves
                  {metadata.white && metadata.black ? ` · ${metadata.white} vs ${metadata.black}` : ""}
                </span>
              </div>
            ) : (
              <Callout tone="error" role="alert" title="We couldn’t read that PGN">
                {pgnCheck.message}
              </Callout>
            )
          ) : null}

          {errorCallout}

          <div className="bm-submit__actions">
            <Button variant="primary" onClick={continueFromImport}>
              Continue
            </Button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="bm-submit__step" aria-labelledby="submit-step-heading">
          <div className="bm-submit__intro">
            <h1 className="bm-h1" id="submit-step-heading" ref={headingRef} tabIndex={-1}>
              Confirm what we read
            </h1>
            <p className="bm-body">Check the details below and change anything that looks wrong.</p>
          </div>

          <div className="bm-submit__confirm">
            {metadata ? (
              <Card className="bm-submit__board">
                <MiniBoard
                  fen={metadata.finalFen}
                  flipped={playerColor === "black"}
                  label={`Final position after ${metadata.lastMove}`}
                />
                <p className="bm-meta bm-mono bm-submit__board-caption">
                  Final position · {metadata.lastMove}
                  {metadata.result ? ` · ${metadata.result}` : ""}
                </p>
              </Card>
            ) : null}

            <div className="bm-submit__details">
              {metadata ? (
                <Card className="bm-submit__facts-card">
                  <dl className="bm-submit__facts">
                    {metadata.white ? (
                      <Fact label="White">
                        {metadata.white}
                        {metadata.whiteElo ? <span className="bm-submit__fact-aside"> {metadata.whiteElo}</span> : null}
                      </Fact>
                    ) : null}
                    {metadata.black ? (
                      <Fact label="Black">
                        {metadata.black}
                        {metadata.blackElo ? <span className="bm-submit__fact-aside"> {metadata.blackElo}</span> : null}
                      </Fact>
                    ) : null}
                    {metadata.result ? (
                      <Fact label="Result">
                        <span className="bm-mono">{metadata.result}</span>
                      </Fact>
                    ) : null}
                    {metadata.clock ? (
                      <Fact label="Clock in file">
                        <span className="bm-mono">{metadata.clock}</span>
                      </Fact>
                    ) : null}
                    {metadata.opening || metadata.eco ? (
                      <Fact label="Opening">
                        {metadata.opening ?? ""}
                        {metadata.eco ? <span className="bm-submit__fact-aside bm-mono"> {metadata.eco}</span> : null}
                      </Fact>
                    ) : null}
                    <Fact label="Length">
                      <span className="bm-mono">{metadata.moveCount} moves</span>
                    </Fact>
                    {metadata.playedOn ? <Fact label="Played">{formatPlayedOn(metadata.playedOn)}</Fact> : null}
                    <Fact label="Source">{source === "paste" ? "Pasted PGN" : "Uploaded file"}</Fact>
                  </dl>
                </Card>
              ) : null}

              {prefilled ? (
                <p className="bm-meta">Some answers below were filled in from the file. Check each one.</p>
              ) : null}

              <div className="bm-submit__fields">
                <SelectField label="You played as" value={playerColor} onChange={(event) => setPlayerColor(event.target.value)} required>
                  <option value="" disabled>
                    Select White or Black
                  </option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </SelectField>
                <SelectField label="Your result" value={gameResult} onChange={(event) => setGameResult(event.target.value)} required>
                  <option value="" disabled>
                    Select win / loss / draw
                  </option>
                  <option value="win">Win</option>
                  <option value="lose">Loss</option>
                  <option value="draw">Draw</option>
                </SelectField>
                <SelectField
                  label="Time control"
                  value={timeControl}
                  onChange={(event) => {
                    setTimeControl(event.target.value);
                    setError("");
                  }}
                  required
                >
                  <option value="" disabled>
                    Select time control
                  </option>
                  {TIME_CONTROL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>
                <TextField
                  label="Average rating of both players"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 1500"
                  value={averageRating}
                  onChange={(event) => {
                    setAverageRating(event.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
            </div>
          </div>

          {errorCallout}

          <div className="bm-submit__actions">
            <Button variant="secondary" onClick={() => goTo(1)}>
              Back
            </Button>
            <Button variant="primary" onClick={continueFromDetails}>
              This is right — continue
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="bm-submit__step bm-submit__step--narrow" aria-labelledby="submit-step-heading">
          <div className="bm-submit__intro">
            <h1 className="bm-h1" id="submit-step-heading" ref={headingRef} tabIndex={-1}>
              What would you like help understanding?
            </h1>
            <p className="bm-body">This is the most useful thing you can give your reviewer. Mention specific moves if you can.</p>
          </div>

          <TextAreaField
            label="Your question for the reviewer"
            labelAside={<span className="bm-meta">Optional</span>}
            rows={5}
            placeholder="e.g. I'm unsure about the middlegame transition around move 15…"
            value={reviewNotes}
            onChange={(event) => setReviewNotes(event.target.value)}
          />

          <TextField
            label="Title"
            labelAside={<span className="bm-meta">Optional</span>}
            hint="Leave it blank and we name the game after its opening when we recognise it."
            maxLength={120}
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
          />

          <fieldset className="bm-submit__visibility">
            <legend className="bm-field__label">Who can see this game</legend>
            <label className="bm-submit__radio">
              <input type="radio" name="visibility" checked={!isPrivate} onChange={() => setIsPrivate(false)} />
              <span>
                <span className="bm-submit__radio-title">Public</span>
                <span className="bm-submit__radio-hint">
                  Appears in the list of games waiting for a reviewer, and the finished review can be read by anyone.
                </span>
              </span>
            </label>
            <label className="bm-submit__radio">
              <input type="radio" name="visibility" checked={isPrivate} onChange={() => setIsPrivate(true)} />
              <span>
                <span className="bm-submit__radio-title">Private</span>
                <span className="bm-submit__radio-hint">
                  Not shown in public lists while it waits for a review. Anyone with the link can open it and claim it.
                </span>
              </span>
            </label>
          </fieldset>

          {errorCallout}

          <div className="bm-submit__actions">
            <Button variant="secondary" onClick={() => goTo(2)}>
              Back
            </Button>
            <Button variant="primary" onClick={() => goTo(4)}>
              Continue
            </Button>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="bm-submit__step bm-submit__step--narrow" aria-labelledby="submit-step-heading">
          <div className="bm-submit__intro">
            <h1 className="bm-h1" id="submit-step-heading" ref={headingRef} tabIndex={-1}>
              Ready to submit
            </h1>
            <p className="bm-body">A stronger player claims your game and writes move-by-move notes. Nothing is published without a person.</p>
          </div>

          <Card className="bm-submit__summary">
            <p className="bm-h3">{customTitle.trim() || "Named after the opening, if we recognise it"}</p>
            <p className="bm-meta bm-mono">
              {[
                timeControlLabel,
                averageRating ? `avg ${String(averageRating).trim()}` : null,
                COLOR_LABELS[playerColor],
                RESULT_LABELS[gameResult],
                metadata ? `${metadata.moveCount} moves` : null,
                isPrivate ? "Private" : "Public",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <div className="bm-submit__summary-question">
              <span className="bm-overline">Your question</span>
              <p className="bm-body bm-body--strong">{question || "No question added. The reviewer will look at the whole game."}</p>
            </div>
          </Card>

          {errorCallout}

          {isAuthenticated ? (
            <>
              <div className="bm-submit__actions">
                <Button variant="secondary" onClick={() => goTo(3)} disabled={mutation.isPending}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="bm-submit__submit"
                  onClick={handleSubmit}
                  loading={mutation.isPending}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Submitting…" : "Submit for review"}
                </Button>
              </div>
              <p className="bm-meta">By submitting, you agree to our community guidelines. You can follow the game’s status in My Games.</p>
            </>
          ) : (
            <>
              <Callout tone="info" title="Create an account to submit">
                Submitting needs a free account, and it only takes a minute.
              </Callout>
              <div className="bm-submit__actions">
                <Button variant="secondary" onClick={() => goTo(3)}>
                  Back
                </Button>
                <GuestActions location={location} />
              </div>
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
