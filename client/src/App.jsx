import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Feed from "./pages/Feed.jsx";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Feed />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Layout />
    </>
  );
}

export default App;
