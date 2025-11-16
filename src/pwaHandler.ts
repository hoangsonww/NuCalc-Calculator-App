/**
 * PWA Update Handler
 * Manages service worker registration and update notifications
 */

import { registerSW } from "virtual:pwa-register";

/**
 * Shows a notification to the user about app updates
 * @param updateSW - Function to trigger the service worker update
 */
function showUpdateNotification(updateSW: (reloadPage?: boolean) => Promise<void>): void {
  const notification = document.createElement("div");
  notification.id = "pwa-update-notification";
  notification.className = "pwa-notification";
  notification.setAttribute("role", "alert");
  notification.setAttribute("aria-live", "polite");

  notification.innerHTML = `
    <div class="pwa-notification-content">
      <span class="pwa-notification-text">A new version is available!</span>
      <div class="pwa-notification-actions">
        <button id="pwa-update-btn" class="pwa-btn pwa-btn-primary">Update</button>
        <button id="pwa-dismiss-btn" class="pwa-btn pwa-btn-secondary">Later</button>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Add event listeners
  document.getElementById("pwa-update-btn")?.addEventListener("click", () => {
    updateSW(true); // Update and reload
  });

  document.getElementById("pwa-dismiss-btn")?.addEventListener("click", () => {
    notification.remove();
  });

  // Auto-dismiss after 30 seconds if user doesn't interact
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 30000);
}

/**
 * Shows an offline notification
 */
function showOfflineNotification(): void {
  const notification = document.createElement("div");
  notification.id = "pwa-offline-notification";
  notification.className = "pwa-notification pwa-offline";
  notification.setAttribute("role", "alert");
  notification.setAttribute("aria-live", "polite");

  notification.innerHTML = `
    <div class="pwa-notification-content">
      <span class="pwa-notification-text">📱 You're offline - App is working in offline mode</span>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-dismiss when back online
  window.addEventListener("online", () => {
    notification.remove();
  });
}

/**
 * Shows an online notification
 */
function showOnlineNotification(): void {
  const notification = document.createElement("div");
  notification.id = "pwa-online-notification";
  notification.className = "pwa-notification pwa-online";
  notification.setAttribute("role", "status");
  notification.setAttribute("aria-live", "polite");

  notification.innerHTML = `
    <div class="pwa-notification-content">
      <span class="pwa-notification-text">✅ You're back online!</span>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Initializes PWA functionality
 */
export function initializePWA(): void {
  // Register service worker with update handler
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log("New version available");
      showUpdateNotification(updateSW);
    },
    onOfflineReady() {
      console.log("App is ready to work offline");
    },
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      console.log("Service Worker registered:", registration);
    },
    onRegisterError(error: Error) {
      console.error("Service Worker registration failed:", error);
    },
  });

  // Handle offline/online events
  window.addEventListener("offline", () => {
    console.log("App is offline");
    showOfflineNotification();
  });

  window.addEventListener("online", () => {
    console.log("App is back online");
    // Remove offline notification if it exists
    document.getElementById("pwa-offline-notification")?.remove();
    showOnlineNotification();
  });

  // Show installation prompt for desktop
  let deferredPrompt: BeforeInstallPromptEvent | null = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e as BeforeInstallPromptEvent;

    // Show install button/banner
    showInstallPrompt();
  });

  function showInstallPrompt(): void {
    const installBtn = document.createElement("button");
    installBtn.id = "pwa-install-btn";
    installBtn.className = "pwa-install-button";
    installBtn.textContent = "📱 Install App";
    installBtn.setAttribute("aria-label", "Install NuCalc Pro as an app");

    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;

      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);

      // Clear the deferredPrompt for reuse
      deferredPrompt = null;

      // Hide the install button
      installBtn.remove();
    });

    document.body.appendChild(installBtn);
  }

  // Handle app installed event
  window.addEventListener("appinstalled", () => {
    console.log("PWA was installed");
    deferredPrompt = null;
    document.getElementById("pwa-install-btn")?.remove();
  });

  // Log initial online/offline status
  console.log(`App is ${navigator.onLine ? "online" : "offline"}`);
}

// Type definition for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
