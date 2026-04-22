import { Chess } from "chess.js";

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
