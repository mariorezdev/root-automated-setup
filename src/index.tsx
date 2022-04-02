import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

import { Provider } from "react-redux";
import { store } from "./components/store";
import { Fallback } from "./components/fallback";

import * as serviceWorker from "./serviceWorker";

// Since we have to suspend for i18next anyway, may as well lazy load the app itself
const App = React.lazy(
  () => import(/* webpackPreload: true */ "./components/app")
);

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: process.env.NODE_ENV !== "production",
    ns: "auset",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: "/locales/{{ns}}-{{lng}}.json",
    },
  });

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Suspense fallback={<Fallback />}>
        <App />
      </Suspense>
    </Provider>
  </React.StrictMode>
);

serviceWorker.register();
