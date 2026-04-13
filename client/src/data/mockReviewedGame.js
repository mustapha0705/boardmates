import { Chess } from "chess.js";

let mockId = 0;

function node(fen, san = null, parent = null) {
  return {
    id: `mock-${++mockId}`,
    fen,
    san,
    ply: parent ? parent.ply + 1 : 0,
    comment: "",
    parent,
    children: [],
  };
}

function play(parent, san) {
  const game = new Chess(parent.fen);
  const move = game.move(san);
  if (!move) throw new Error(`Invalid move: ${san} from ${parent.fen}`);
  const child = node(game.fen(), move.san, parent);
  parent.children.push(child);
  return child;
}

export default function buildMockReviewedGame() {
  const root = node(new Chess().fen());

  // ── Mainline: Italian Game (Giuoco Piano) ──
  const e4 = play(root, "e4");
  const e5 = play(e4, "e5");
  const Nf3 = play(e5, "Nf3");
  const Nc6 = play(Nf3, "Nc6");
  const Bc4 = play(Nc6, "Bc4");
  const Bc5 = play(Bc4, "Bc5");
  const c3 = play(Bc5, "c3");
  const Nf6m = play(c3, "Nf6");
  const d4 = play(Nf6m, "d4");
  const exd4 = play(d4, "exd4");
  const cxd4 = play(exd4, "cxd4");
  const Bb4 = play(cxd4, "Bb4+");
  const Nc3 = play(Bb4, "Nc3");

  // ── Variation: Two Knights Defense (3…Nf6 instead of 3…Bc5) ──
  const Nf6v = play(Bc4, "Nf6");
  const Ng5 = play(Nf6v, "Ng5");
  const d5 = play(Ng5, "d5");
  const exd5 = play(d5, "exd5");
  const Na5 = play(exd5, "Na5");

  // ── Annotations ──
  e4.comment =
    "The King's Pawn opening. White stakes an immediate claim in the center and opens lines for both the queen and the bishop.";

  Nf3.comment =
    "Developing the knight to its most natural square, attacking e5 and preparing kingside castling.";

  Bc4.comment =
    "The Italian Game — targeting the vulnerable f7 square. One of the oldest and most classical openings in chess.";

  Bc5.comment =
    "The Giuoco Piano ('Quiet Game'). Black mirrors White's strategy by aiming the bishop at f2.";

  c3.comment =
    "Preparing the central advance d2-d4. A key positional move in the Giuoco Piano.";

  d4.comment =
    "White opens the center while Black's bishop sits on c5. The resulting tension defines the character of the middlegame.";

  Bb4.comment =
    "A disruptive check that aims to fragment White's coordination before the center fully stabilizes.";

  Nc3.comment =
    "Blocking the check while developing a piece toward the center. White accepts doubled pawns after a potential …Bxc3.";

  // Variation annotations
  Nf6v.comment =
    "The Two Knights Defense — a sharper, more combative response. Black invites tactical complications with 4.Ng5.";

  Ng5.comment =
    "Immediately lunging at f7. Looks dangerous, but Black has well-analyzed resources to equalize.";

  d5.comment =
    "The principled reply. Black strikes in the center rather than defending passively with …d6, seizing counterplay.";

  exd5.comment = "The only serious option — declining the pawn gives Black a strong center.";

  Na5.comment =
    "Chasing the bishop and preparing to recapture on d5 with the knight. The Morphy variation.";

  return {
    root,
    meta: {
      white: "Magnus Carlsen",
      black: "Ian Nepomniachtchi",
      event: "World Championship 2021 · Game 6",
      result: "1-0",
      reviewer: "GM Hikaru Nakamura",
    },
  };
}
