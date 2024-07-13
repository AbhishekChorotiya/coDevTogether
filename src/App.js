import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import CodeScreen from "./components/CodeScreen";
import LandingPage from "./components/LandingPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/:roomId" element={<CodeScreen />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
