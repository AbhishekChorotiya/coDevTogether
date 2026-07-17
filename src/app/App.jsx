import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LobbyPage } from "../features/lobby/LobbyPage";

const RoomPage = lazy(() =>
  import("../features/room/RoomPage").then((module) => ({
    default: module.RoomPage,
  })),
);

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route
          path="/:roomId"
          element={
            <Suspense fallback={<div className="grid min-h-dvh place-items-center">Loading workspace…</div>}>
              <RoomPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
