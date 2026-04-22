import { useState, useCallback, useRef, useMemo, useLayoutEffect } from "react";
import { Chess } from "chess.js";
import {
  buildTreeFromAnalysisJson,
  buildTreeFromPgnWithComments,
  applyCommentsToTree,
  findNodeByFen,
  serializeAnalysisTreeNode,
} from "../utils/analysisTree";

let nodeId = 0;

function createNode(fen, san = null, parent = null) {
  nodeId += 1;
  return {
    id: nodeId,
    fen,
    san,
    ply: parent ? parent.ply + 1 : 0,
    comment: "",
    parent,
    children: [],
  };
}

export function getMoveLabel(node) {
  if (!node || node.ply === 0) return "Start";
  const num = Math.ceil(node.ply / 2);
  const dot = node.ply % 2 === 1 ? "." : "...";
  return `${num}${dot} ${node.san}`;
}

/**
 * @param {object} options
 * @param {string} [options.pgn]
 * @param {object | null} [options.serverAnalysisJson] — full saved tree from API (in_review or completed)
 * @param {Array} [options.serverComments] — review_comment rows (merged when building from PGN)
 */
export default function useAnalysisTree({ pgn, serverAnalysisJson, serverComments = [] } = {}) {
  const [treeRoot, setTreeRoot] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [treeVersion, setTreeVersion] = useState(0);
  /** Bumps on new sidelines only (for debounced draft save); not on text comments (those save on Save). */
  const [structureVersion, setStructureVersion] = useState(0);

  const currentFenRef = useRef(null);
  const currentRef = useRef(null);
  const rootDataRef = useRef(null);
  const lastServerSig = useRef(null);
  const serverSig = useMemo(() => {
    const jsonPart = JSON.stringify(serverAnalysisJson ?? null);
    const cPart = (serverComments || [])
      .map((c) => [c.id, c.ply, c.san, c.comment].join("·"))
      .join("|");
    return `${jsonPart}#${cPart}#${pgn || ""}`;
  }, [serverAnalysisJson, serverComments, pgn]);

  useLayoutEffect(() => {
    if (serverSig === lastServerSig.current) return;
    lastServerSig.current = serverSig;

    const preserveFen = currentFenRef.current;
    let root = null;

    if (serverAnalysisJson && typeof serverAnalysisJson === "object" && "fen" in serverAnalysisJson) {
      root = buildTreeFromAnalysisJson(serverAnalysisJson);
      if (root && (serverComments || []).length) {
        applyCommentsToTree(root, serverComments);
      }
    } else if (pgn) {
      root = buildTreeFromPgnWithComments(pgn, serverComments);
    } else {
      root = createNode(new Chess().fen());
    }

    if (!root) {
      root = createNode(new Chess().fen());
    }

    rootDataRef.current = root;
    setTreeRoot(root);

    if (preserveFen) {
      const at = findNodeByFen(root, preserveFen);
      if (at) {
        setCurrentNode(at);
        currentRef.current = at;
        return;
      }
    }
    setCurrentNode(root);
    currentRef.current = root;
  }, [serverSig]);

  useLayoutEffect(() => {
    currentRef.current = currentNode;
  }, [currentNode]);

  const setNodeAndFen = useCallback((node) => {
    if (node?.fen) currentFenRef.current = node.fen;
    setCurrentNode(node);
    currentRef.current = node;
  }, []);

  const makeMove = useCallback((from, to, promotion = "q") => {
    const node = currentRef.current;
    if (!node) return null;
    const game = new Chess(node.fen);
    let move;
    try {
      move = game.move({ from, to, promotion });
    } catch {
      return null;
    }
    if (!move) return null;

    const existing = node.children.find((c) => c.san === move.san);
    if (existing) {
      setNodeAndFen(existing);
      return existing;
    }

    const child = createNode(game.fen(), move.san, node);
    node.children.push(child);
    setNodeAndFen(child);
    setTreeVersion((v) => v + 1);
    setStructureVersion((v) => v + 1);
    return child;
  }, [setNodeAndFen]);

  const goToNode = useCallback(
    (node) => {
      setNodeAndFen(node);
    },
    [setNodeAndFen],
  );

  const goToFirst = useCallback(() => {
    const r = rootDataRef.current;
    if (r) setNodeAndFen(r);
  }, [setNodeAndFen]);

  const goToPrev = useCallback(() => {
    const node = currentRef.current;
    if (node?.parent) setNodeAndFen(node.parent);
  }, [setNodeAndFen]);

  const goToNext = useCallback(() => {
    const node = currentRef.current;
    if (node?.children.length > 0) setNodeAndFen(node.children[0]);
  }, [setNodeAndFen]);

  const goToLast = useCallback(() => {
    let node = currentRef.current;
    if (!node) return;
    while (node.children.length > 0) node = node.children[0];
    setNodeAndFen(node);
  }, [setNodeAndFen]);

  const setComment = useCallback((text) => {
    const node = currentRef.current;
    if (node) node.comment = text;
    setTreeVersion((v) => v + 1);
  }, []);

  const getSerializedTree = useCallback(() => serializeAnalysisTreeNode(rootDataRef.current), []);

  return {
    root: treeRoot,
    currentNode: currentNode || treeRoot,
    makeMove,
    goToNode,
    goToFirst,
    goToPrev,
    goToNext,
    goToLast,
    setComment,
    treeVersion,
    structureVersion,
    getSerializedTree,
  };
}
