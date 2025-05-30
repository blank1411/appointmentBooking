import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider } from "@fluentui/react-components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MyTheme from "./Theme/MyTheme";
import App from "./App.tsx";
import "./main.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FluentProvider theme={MyTheme}>
        <App />
      </FluentProvider>
    </QueryClientProvider>
  </StrictMode>
);
