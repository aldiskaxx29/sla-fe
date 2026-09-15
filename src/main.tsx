import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./plugins/redux";
import { AppEntryPoint } from "./app/ui/index.ts";
import { ToastContainer } from "react-toastify";
import { AppQueryProvider } from "./plugins/react-query";
import "mapbox-gl/dist/mapbox-gl.css";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
    // <BrowserRouter basename="/devqosmo">
    <BrowserRouter>
      {/* Redux, Persist, and Router */}
      <Provider store={store}>
        <AppQueryProvider>
          <AppEntryPoint />
        </AppQueryProvider>
      </Provider>
      <ToastContainer />
    </BrowserRouter>
  // </StrictMode>
);
