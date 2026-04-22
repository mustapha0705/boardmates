import { Chess } from "chess.js";

let pgnNodeId = 0;

/** Mainline from PGN + optional flat comment rows; same node shape as useAnalysisTree. */
export function buildTreeFromPgnWithComments(pgn, commentRows = []) {
  pgnNodeId = 0;
  const commentMap = new Map();
  for (const c of commentRows || []) {
    commentMap.set(`${c.ply}:${c.san == null || c.san === "" ? "" : c.san}`, c.comment);
  }

  function createPgnNode(fen, san = null, parent = null) {
    pgnNodeId += 1;
    return {
      id: `pgn-${pgnNodeId}`,
      fen,
      san,
      ply: parent ? parent.ply + 1 : 0,
      comment: "",
      parent,
      children: [],
    };
  }

  const root = createPgnNode(new Chess().fen());
  try {
    const game = new Chess();
    game.loadPgn(pgn);
    const moves = game.history({ verbose: true });
    let current = root;
    const replay = new Chess(root.fen);
    for (const move of moves) {
      replay.move(move.san);
      const child = createPgnNode(replay.fen(), move.san, current);
      const key = `${child.ply}:${child.san || ""}`;
      if (commentMap.has(key)) child.comment = commentMap.get(key);
      current.children.push(child);
      current = child;
    }
  } catch {
    // keep root only
  }
  return root;
}

/**
 * Merges API comment rows into an existing tree (BFS) by (ply, san).
 * Later rows with same key overwrite; never deletes existing node comments.
 */
export function applyCommentsToTree(root, commentRows) {
  if (!root || !commentRows?.length) return;
  for (const c of commentRows) {
    const n = findNodeByPlySan(root, c.ply, c.san);
    if (n) n.comment = c.comment;
  }
}

function findNodeByPlySan(root, ply, san) {
  const wantSan = san == null || san === "" ? null : san;
  const q = [root];
  while (q.length) {
    const n = q.shift();
    const nSan = n.san == null || n.san === "" ? null : n.san;
    if (n.ply === ply && nSan === wantSan) return n;
    for (const ch of n.children) q.push(ch);
  }
  return null;
}

export function findNodeByFen(root, fen) {
  if (!root || !fen) return null;
  const q = [root];
  while (q.length) {
    const n = q.shift();
    if (n.fen === fen) return n;
    for (const ch of n.children) q.push(ch);
  }
  return null;
}

/** @returns {object|null} JSON-safe tree (no parent refs, no client ids) */
export function serializeAnalysisTreeNode(node) {
  if (!node) return null;
  return {
    fen: node.fen,
    san: node.san ?? null,
    ply: node.ply,
    comment: node.comment || "",
    children: (node.children || []).map(serializeAnalysisTreeNode),
  };
}

let buildId = 0;

/**
 * @param {object} data - from serializeAnalysisTreeNode / API
 * @param {object|null} parent
 */
function deserializeNode(data, parent) {
  if (!data) return null;
  buildId += 1;
  const n = {
    id: `at-${buildId}`,
    fen: data.fen,
    san: data.san ?? null,
    ply: data.ply,
    comment: data.comment || "",
    parent,
    children: [],
  };
  for (const ch of data.children || []) {
    n.children.push(deserializeNode(ch, n));
  }
  return n;
}

/** Rebuilds the tree used by MoveList / CommentList (same shape as useAnalysisTree). */
export function buildTreeFromAnalysisJson(data) {
  if (!data || typeof data.fen !== "string") return null;
  buildId = 0;
  try {
    new Chess(data.fen);
  } catch {
    return null;
  }
  return deserializeNode(data, null);
}
