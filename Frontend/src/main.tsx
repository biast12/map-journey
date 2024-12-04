import App from "./App";
import { ProviderContextProvider } from "./hooks/ProviderContext";
import { I18nextProvider } from "react-i18next";
import i18n from "./utils/i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { defineCustomElements } from "@ionic/pwa-elements/loader";

defineCustomElements(window);
const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <ProviderContextProvider>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </ProviderContextProvider>
);
