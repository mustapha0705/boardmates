import { useState, useCallback, useReducer, useRef } from "react";
import { Chess } from "chess.js";

let nodeId = 0;

function createNode(fen, san = null, parent = null) {
  return {
    id: ++nodeId,
    fen,
    san,
    ply: parent ? parent.ply + 1 : 0,
    comment: "",
    nag: null,
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

export default function useAnalysisTree(startFen) {
  const rootRef = useRef(null);
  if (!rootRef.current) {
    rootRef.current = createNode(startFen || new Chess().fen());
  }
  const root = rootRef.current;

  const [currentNode, setCurrentNode] = useState(root);
  const [, bump] = useReducer((x) => x + 1, 0);

  const currentRef = useRef(currentNode);
  currentRef.current = currentNode;

  const makeMove = useCallback((from, to, promotion = "q") => {
    const node = currentRef.current;
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
      setCurrentNode(existing);
      return existing;
    }

    const child = createNode(game.fen(), move.san, node);
    node.children.push(child);
    setCurrentNode(child);
    bump();
    return child;
  }, []);

  const goToNode = useCallback((node) => setCurrentNode(node), []);

  const goToFirst = useCallback(() => setCurrentNode(rootRef.current), []);

  const goToPrev = useCallback(() => {
    const node = currentRef.current;
    if (node.parent) setCurrentNode(node.parent);
  }, []);

  const goToNext = useCallback(() => {
    const node = currentRef.current;
    if (node.children.length > 0) setCurrentNode(node.children[0]);
  }, []);

  const goToLast = useCallback(() => {
    let node = currentRef.current;
    while (node.children.length > 0) node = node.children[0];
    setCurrentNode(node);
  }, []);

  const setComment = useCallback((text) => {
    currentRef.current.comment = text;
    bump();
  }, []);

  const setNag = useCallback((nag) => {
    currentRef.current.nag = nag;
    bump();
  }, []);

  return {
    root,
    currentNode,
    makeMove,
    goToNode,
    goToFirst,
    goToPrev,
    goToNext,
    goToLast,
    setComment,
    setNag,
  };
}
