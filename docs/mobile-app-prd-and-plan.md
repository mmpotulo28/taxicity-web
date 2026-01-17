# Mobile Application PRD & Implementation Plan

## 1. Product Requirements Document (PRD)

### 1.1 Overview

The goal is to expand the TaxiCity platform to mobile devices (iOS and Android) by wrapping the existing Next.js web applications (Driver and User portals) into native mobile applications using React Native and Expo 53. This "Hybrid WebView" approach allows for rapid deployment, code reusability, and instant updates for web-content changes.

### 1.2 Product Components

1.  **TaxiCity User App** (Consumer facing)
    - Wraps `apps/user`
    - Target Launch: Android Play Store, Apple App Store
2.  **TaxiCity Driver App** (Service provider facing)
    - Wraps `apps/driver`
    - Target Launch: Android Play Store, Apple App Store

### 1.3 Key Features & Requirements

#### Core WebView Functionality

- **Full-Screen WebView**: The app must render the responsive web application as the primary interface.
- **State Persistence**: Cookies and LocalStorage must persist between app sessions to keep users logged in (via Clerk).
- **Loading States**: A native loading spinner/shimmer must appear while the web content initializes.
- **Error Handling**: A native "No Internet Connection" or "Server Error" screen with a retry button.

#### Native Integrations (Phase 1)

- **Geolocation**: Request native location permissions and pass coordinates to the web view if native-level precision is required, or allow the WebView to request standard HTML5 Geolocation permissions.
- **Deep Linking**: Handle universal links (e.g., `taxicity.com/trip/123`) to open the app directly to the correct page.
- **Safe Area Handling**: Ensure content does not overlap with status bars or standard device notches (using `react-native-safe-area-context`).

#### Native Integrations (Phase 2 - Future)

- **Push Notifications**: Integrate Expo Notifications to receive alerts for trip updates, driver arrivals, etc.
- **Biometrics**: Native FaceID/Fingerprint for quicker re-authentication.

### 1.4 Technical Constraints

- **Framework**: Expo SDK 53
- **Language**: TypeScript
- **Monorepo Integration**: Must live within the existing `apps/` directory and work with Turborepo and pnpm.

---

## 2. Implementation Plan

### 2.1 Directory Structure

We will create two new directories in the `apps/` folder:

- `apps/mobile-user`: The React Native Expo app for users.
- `apps/mobile-driver`: The React Native Expo app for drivers.

### 2.2 Tech Stack

- **Exopo SDK**: 53 (Latest stable)
- **React Native**: 0.74+
- **WebView Component**: `react-native-webview`
- **Navigation**: `expo-router` (Lightweight file-based routing) or standard `react-navigation`.

### 2.3 Step-by-Step Execution

#### Step 1: Workspace Preparation

1.  Verify `pnpm-workspace.yaml` includes `apps/*` (Already verified).
2.  Create new Expo projects using the bare minimum template or managed workflow.

#### Step 2: Project Initialization

Run the initialization commands for both apps.
_Note: Since we are in a monorepo, we need to configure Metro bundler to look for dependencies in the root `node_modules`._

#### Step 3: Shared Configuration

Create a `metro.config.js` in each mobile app that extends the default Expo config to handle the monorepo structure (resolving symlinks and workspace packages).

#### Step 4: WebView Implementation

Implement the primary screen in `App.tsx` (or `app/index.tsx` if using Expo Router).

```typescript
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <WebView
      source={{ uri: 'https://staging.taxicity.com' }} // Env var dependent
      style={{ flex: 1 }}
    />
  );
}
```

#### Step 5: Turbo Integration

Update `turbo.json` (if necessary) or ensure the `package.json` scripts in mobile apps match the global usage (e.g., `dev`, `build`, `lint`).

#### Step 6: Environment Variables

Configure `expo-constants` to inject the correct target URL (Localhost for dev, Vercel URL for prod) into the app.

---

## 3. Deployment Strategy

- **Development**: Use Expo Go for quick testing.
- **Staging**: Build `.apk` and `.ipa` using EAS Build pointing to the Staging Web URL.
- **Production**: Submit binaries to stores pointing to the Production Web URL.

## 4. Immediate Next Actions

1.  Generate the `apps/mobile-user` and `apps/mobile-driver` skeletons.
2.  Install `react-native-webview`.
3.  Configure monorepo resolution (Metro Config).
4.  Commit and push changes.
