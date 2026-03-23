// export default function MoveList() {
//   return (
//     <div className="card">
//       <div className="card-header">Move History</div>

//       <div className="move-grid">
//         <div className="move-row active">
//           <span>45.</span>
//           <span>Ng2</span>
//           <span>...</span>
//         </div>

//         <div className="move-row">
//           <span>44.</span>
//           <span>g3</span>
//           <span>Be7</span>
//         </div>

//         <div className="move-row">
//           <span>43.</span>
//           <span>Kh2</span>
//           <span>Qd6</span>
//         </div>
//       </div>
//     </div>
//   );
// }
const moves = [
  { num: 45, white: "Ng2", black: "..." },
  { num: 44, white: "g3",  black: "Be7" },
  { num: 43, white: "Kh2", black: "Qd6" },
  { num: 42, white: "Rf1", black: "Rd8" },
  { num: 41, white: "Qe2", black: "Nc6" },
];

export default function MoveList({ activeMove, onSelectMove }) {
  return (
    <div className="card">
      <div className="card-header">Move History</div>
      <div className="move-grid">
        {moves.map((m) => (
          <div
            key={m.num}
            className={`move-row ${activeMove === `Move ${m.num}` ? "active" : ""}`}
            onClick={() => onSelectMove(`Move ${m.num}`)}
          >
            <span className="move-num">{m.num}.</span>
            <span className="move-cell white">{m.white}</span>
            <span className="move-cell black">{m.black}</span>
          </div>
        ))}
      </div>
    </div>
  );
}