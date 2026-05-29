"use client";

import { useEffect } from "react";

// Module-level singletons to prevent multiple script loads and initialize() calls
let scriptLoaded = false;
let initialized = false;
let activeCallback = null;

function loadScript() {
  if (scriptLoaded) return Promise.resolve();

  const existing = document.querySelector('script[src*="accounts.google.com/gsi"]');
  if (existing) {
    scriptLoaded = true;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    document.body.appendChild(script);
  });
}

export function useGoogleSignIn({ onCredential, buttonContainerId = "google-btn", buttonOptions = {} }) {
  useEffect(() => {
    activeCallback = onCredential;

    loadScript().then(() => {
      if (!window.google) return;

      if (!initialized) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: (response) => activeCallback?.(response),
        });
        initialized = true;
      }

      const btnContainer = document.getElementById(buttonContainerId);
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: "outline",
          size: "large",
          width: "320",
          shape: "pill",
          ...buttonOptions,
        });
      }
    });

    return () => {
      activeCallback = null;
    };
  }, []);

  // Keep activeCallback in sync with latest closure (e.g. when router/state changes)
  useEffect(() => {
    activeCallback = onCredential;
  }, [onCredential]);
}
