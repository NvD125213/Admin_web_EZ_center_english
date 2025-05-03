import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MuiThemeWrapper from "./context/ThemeMuiContext.tsx";
import { Provider } from "react-redux";
import { store } from "./stores/index.ts";
// Create a client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <MuiThemeWrapper>
        <AppWrapper>
          <QueryClientProvider client={queryClient}>
            <Provider store={store}>
              <App />
            </Provider>
          </QueryClientProvider>
        </AppWrapper>
      </MuiThemeWrapper>
    </ThemeProvider>
  </StrictMode>
);
