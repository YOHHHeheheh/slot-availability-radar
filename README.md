# Visa / Tatkal Slot Availability Radar

An intelligent browser automation agent designed to monitor appointment and booking portals for newly opened or cancelled slots, execute rapid autofill, and safely pause for human OTP verification.

## 🚀 Key Features
- **API & XHR Network Interception:** Monitors background network responses directly to detect slot openings with sub-second latency.
- **Stealth & Anti-Fingerprinting:** Patches automation flags (`navigator.webdriver`) and employs humanized typing delays.
- **Session Persistence:** Saves authenticated cookies (`session_state.json`) to prevent repeated manual logins.
- **Human-in-the-Loop Safety:** Halts completely at the OTP and payment gateway to ensure zero automated financial risk.

## 🛠️ Quickstart

### 1. Install Dependencies
```bash
pip install -r requirements.txt
playwright install chromium
