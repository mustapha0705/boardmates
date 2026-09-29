import Button from "../ui/Button.jsx";
import Dialog from "../ui/Dialog.jsx";

/**
 * Claim confirmation from the export's claim modal. States only what the deployed
 * server enforces: the claim is exclusive and publishing needs at least 3 move notes.
 */
export default function ClaimDialog({ game, viewerRating, pending, onConfirm, onClose }) {
  const question = String(game.reviewNotes ?? "").trim();
  const hasViewerRating = Number.isFinite(viewerRating) && viewerRating > 0;

  return (
    <Dialog
      title="Claim this review?"
      lead="Claiming locks the game to you. No one else can review it until you publish."
      onClose={pending ? undefined : onClose}
    >
      <dl className="bm-dialog__panel">
        <div className="bm-dialog__row">
          <dt>Game</dt>
          <dd>{game.title}</dd>
        </div>
        <div className="bm-dialog__row">
          <dt>Submitted by</dt>
          <dd>{game.author?.displayName ?? "Unknown"}</dd>
        </div>
        <div className="bm-dialog__row">
          <dt>Time control</dt>
          <dd className="bm-mono">{game.timeControl}</dd>
        </div>
        {game.averageRating ? (
          <div className="bm-dialog__row">
            <dt>Average rating</dt>
            <dd className="bm-mono">{game.averageRating}</dd>
          </div>
        ) : null}
        {hasViewerRating ? (
          <div className="bm-dialog__row">
            <dt>Your rating</dt>
            <dd className="bm-mono">{viewerRating} rapid</dd>
          </div>
        ) : null}
        <div className="bm-dialog__row">
          <dt>To publish</dt>
          <dd>At least 3 move notes</dd>
        </div>
      </dl>

      {question ? <p className="bm-dialog__quote">&ldquo;{question}&rdquo;</p> : null}

      <div className="bm-dialog__actions">
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm} loading={pending} disabled={pending}>
          {pending ? "Claiming…" : "Claim and start review"}
        </Button>
      </div>
    </Dialog>
  );
}
