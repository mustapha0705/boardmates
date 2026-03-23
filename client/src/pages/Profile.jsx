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
    title: "MagnusCarlsen vs. HikaruNakamura",
    text: "Blitz (3+2)",
    time: "Reviewed 2 days ago",
  },
  {
    title: "AlirezaFirouzja vs. FabianoCaruana",
    text: "Rapid (15+10)",
    time: "Reviewed 4 days ago",
  },
  {
    title: "DingLiren vs. IanNepomniachtchi",
    text: "Classical (90+30)",
    time: "Reviewed 1 week ago",
  },
  {
    title: "LevyRozman vs. GothamFan99",
    text: "Bullet (1+0)",
    time: "Reviewed 2 weeks ago",
  },
  {
    title: "JuditPolgar vs. AnishGiri",
    text: "Rapid (10+5)",
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
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Member since 2023
                  </p>
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
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Games Submitted
                </h2>
                <span className="badge">12 Games</span>
              </div>

              {submittedGames.map((game, i) => (
                <div className="game-card" key={i}>
                  <div>
                    <h3>{game.title}</h3>
                    <p>{game.subtitle}</p>
                  </div>
                  <svg
                    className="arrow"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div>
              <div className="section-header">
                <h2>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Games Reviewed
                </h2>
                <span className="badge">48 Reviews</span>
              </div>

              {reviews.map((r, i) => (
                <div className="review-card" key={i}>
                  <div className="review-top">
                    <h3>{r.title}</h3>
                  </div>
                  <p className="review-text">{r.text}</p>
                  <span className="review-time">{r.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
