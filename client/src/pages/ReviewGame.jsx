import { Chessboard } from "react-chessboard";

export default function ReviewGame() {
  return (
    <>
      <div className="feed">
        <div>Review Game</div>
        <Chessboard position={"start"} />
      </div>
    </>
  );
}
