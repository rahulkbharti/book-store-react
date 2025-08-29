import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import BookStoreApp from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BookStoreApp />
  </StrictMode>
);
