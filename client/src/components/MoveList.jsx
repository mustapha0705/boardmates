export default function MoveList() {
  return (
    <div className="card">
      <div className="card-header">Move History</div>

      <div className="move-grid">
        <div className="move-row active">
          <span>45.</span>
          <span>Ng2</span>
          <span>...</span>
        </div>

        <div className="move-row">
          <span>44.</span>
          <span>g3</span>
          <span>Be7</span>
        </div>

        <div className="move-row">
          <span>43.</span>
          <span>Kh2</span>
          <span>Qd6</span>
        </div>
      </div>
    </div>
  );
}