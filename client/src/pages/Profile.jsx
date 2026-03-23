import "../styles/profile.css";

const submittedGames = [
  {
    title: "Nebula Quest",
    subtitle: "Strategy • 2-4 Players",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDA1AGFe-o0PZ1kwvhypv3eMuiJQm-tAY4Lkl7kznb7yy_LpO2ylOf_A0TeUma-BYcI_JwjV_qdG0mM46v_00si2UC_P85j2abWHFr3tMEqES-4nmDZ9tOeKgq_yqHmFtHga7DsNRmXeYdjLIzEPImJUE1PSKIQScs5K6VPat9DlIXxvdSmeViRhZ6i__fD156TvFjiE391e0LP5AzoaQusV80loSx0dwLhgh33WtKHAoaEVZCpbw-k1m6wDNQjM5GEWKCVRFHdd7_0",
  },
  {
    title: "Forest Guardians",
    subtitle: "Co-op • 1-5 Players",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXTKS2Fi6crmUMcJ20bbrdcoA7UtMYxa4U4Uwqk9rPvTFXFnnBLi8f3R8C2UdXe5BhCvj5w0Xt4ZGaUKCWJogfF90opJcinLhbZ9DzrxDIebVp63qMBBUmg8e8juEd9YFkWgksM-W_xEBZOl92BS_hmUmrtXjgKoxnBC4O6SBmBnaLl0AmJTwgsIdj62Oska9fplY9I7tNCWRI9DZ23gqh7Euzhc1Up_uhGX3wMzxWbk2A1eESKSTuHyv4jbZnISe6ZCLe33shlGxr",
  },
  {
    title: "Prism Towers",
    subtitle: "Puzzle • 2 Players",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjDgn0VHASZY_kZ1uv_GcSrdtlliad-_0cTATATm_VqcOOYfJvJTJeozMyLkfuVmQImcHjKQ0qQSELtWS1HEaT1Ot2xTMsQZCXgFFa594GXFEfhQA1YaoOnC60Xh8cXUUM_7mgOEG3ZM1TOvXcA79BAAla9nq1Zo9FjVuVDP4G9SAF9egTPo19S51w3Vr4tDncIjNvg670AK7yUWM7C2QfEv7mDdA7o3gz41jxVdoubspjuWii4TY5OVknduqgdF330Sm5IV2YMDRT",
  },
];

const reviews = [
  {
    title: "Cyber City 2077",
    text: "Incredible production value. The mechanics are tight and the cyberpunk aesthetic is executed perfectly...",
    rating: 5,
    time: "Reviewed 2 days ago",
  },
  {
    title: "Mechs & Minions",
    text: "A bit complex for new players, but highly rewarding once you grasp the programming aspect...",
    rating: 4,
    time: "Reviewed 1 week ago",
  },
  {
    title: "Dungeon Crawler",
    text: "Found some issues with the rulebook, but the gameplay loop itself is very nostalgic and fun...",
    rating: 3,
    time: "Reviewed 3 weeks ago",
  },
];

export default function Profile() {
  return (
    <div className="feed">
    <div className="profile-page">
      <main className="profile-container">
        {/* Header */}
        <section className="profile-header">
          <div
            className="avatar"
            style={{
              backgroundImage:
                "url(https://lh3.googleusercontent.com/aida-public/AB6AXuA_Ez6-2j81ku8fKQ5t-LsJvBFbPg74TAoikRWMSaB0wTzO0rEKeBXeHz11akiBqEkMU3QTmCdVlEslsNl0SlQLJvZIjAQAbrk7tZzPT-25CUNv-6h-hGbsOxFhQ0kkHtLvFwQ5U0DvVSfhMJ2b5HIhoLINN9UAI3MasZzP3Ay3nBskDnw9YMmTzB9AMmSFPEdHf6_aYKOeSQW5-pETexbYBaOcUs_dI0PCkFiqqzsbUXQ5uxmUCT1K6yHTgRXpKxsN5ekKb5rCuYEB)",
            }}
          />

          <div className="profile-info">
            <div className="top-row">
              <div>
                <h1>AlexRivers</h1>
                <p className="subtitle">Board Game Enthusiast & Designer</p>
                <p className="member">
                  <span className="material-symbols-outlined">
                    calendar_today
                  </span>
                  Member since 2023
                </p>
              </div>

              <div className="rating">
                <h2>4.8</h2>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined"
                      style={{
                        fontVariationSettings: i <= 4 ? '"FILL" 1' : '"FILL" 0',
                      }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p>Global Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sections */}
        <div className="grid">
          {/* Submitted */}
          <div>
            <div className="section-header">
              <h2>
                <span className="material-symbols-outlined">upload_file</span>
                Games Submitted
              </h2>
              <span className="badge">12 Games</span>
            </div>

            {submittedGames.map((game, i) => (
              <div className="game-card" key={i}>
                <img src={game.img} alt="" />
                <div>
                  <h3>{game.title}</h3>
                  <p>{game.subtitle}</p>
                </div>
                <span className="material-symbols-outlined arrow">
                  chevron_right
                </span>
              </div>
            ))}
          </div>

          {/* Reviews */}
          <div>
            <div className="section-header">
              <h2>
                <span className="material-symbols-outlined">rate_review</span>
                Games Reviewed
              </h2>
              <span className="badge">48 Reviews</span>
            </div>

            {reviews.map((r, i) => (
              <div className="review-card" key={i}>
                <div className="review-top">
                  <h3>{r.title}</h3>
                  <div className="stars small">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className="material-symbols-outlined"
                        style={{
                          fontVariationSettings:
                            n <= r.rating ? '"FILL" 1' : '"FILL" 0',
                        }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                </div>
                <p className="review-text">{r.text}</p>
                <span className="review-time">{r.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div></div>
  );
}
