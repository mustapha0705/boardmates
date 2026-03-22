import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Feed from "./pages/Feed.jsx";
import SubmitGame from "./pages/SubmitGame.jsx";
import Profile from "./pages/Profile.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import ReviewGame from "./pages/ReviewGame.jsx";
import GameDetail from "./pages/GameDetail.jsx";
import "./App.css";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Feed />} />
            <Route path="profile" element={<Profile />} />
            <Route path="submit" element={<SubmitGame />} />
            <Route path="/review-game/:id" element={<ReviewGame />}/>
            <Route path="/game-detail/:id" element={<GameDetail />} />
          </Route>
          <Route path="*" element={<PageNotFound />}/>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
