# 🚆 Train Ticket Slot Availability Radar

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)
![Webcmd](https://img.shields.io/badge/Engine-Webcmd-orange?style=for-the-badge)
![Automation](https://img.shields.io/badge/Automation-Human--In--The--Loop-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

**An event-driven browser automation agent built with Python and `webcmd` to monitor high-demand train ticket slots in real time, rapidly execute profile & payload autofill, and trigger instant audio notifications for seamless human handoff.**

</div>

---

## 📖 Overview

High-demand train ticket slots (e.g., Tatkal / quota releases) sell out within seconds. Manual booking often fails due to slow typing and network latency, while full payment automation poses massive financial and security risks. 

**Train Ticket Slot Availability Radar** solves this by maintaining a background network watch, instantly injecting pre-configured passenger, travel, and card details, and firing an **audible alarm signal** the precise millisecond the portal requests the **CVV**—allowing the user to complete verification safely and instantly.

---

## ✨ Key Features

* ⚡ **Sub-Second Network Interception:** Listens directly to background `API` & `XHR` responses to detect slot openings instantly—bypassing heavy DOM re-rendering delays.
* ⚡ **Automated Data Injection Pipeline:** Pre-fills complex passenger profiles, itinerary parameters, and card credentials in milliseconds upon slot detection.
* 🔔 **Audible Alarm Signal (CVV Trigger):** Produces a high-priority system beep sound when the agent navigates to the payment gate/CVV input field to alert the user immediately.
* 🥷 **Stealth & Anti-Fingerprinting:** Patches automation flags (`navigator.webdriver`), spoofs headers, and employs humanized timing delays to prevent bot flags.
* 💾 **Session Persistence:** Retains authenticated cookies and local state (`session_state.json`) to bypass repetitive manual login steps.
* 🛡️ **Human-In-The-Loop (HITL) Security:** Halts execution at the CVV & OTP stage to ensure zero unauthorized financial transactions.

---

## 🛠️ Tech Stack

| Layer | Technology | Function |
| :--- | :--- | :--- |
| **Automation Engine** | `webcmd` (Python) | Low-level browser driver & CDP automation |
| **Language** | Python 3.10+ | Asynchronous event loop & script execution |
| **Network Interceptor** | XHR / Fetch Listener | Sub-second slot status detection |
| **Audio Notification** | Python `winsound` / `pydub` | Real-time audible alert engine |
| **State Storage** | JSON | Encrypted local profile & cookie state |

---

## 🔄 Execution Workflow

```text
┌───────────────────────────────┐
│  Background Network Guard     │ ◄── [Intercepts XHR/API responses]
└───────────────┬───────────────┘
                │ Slot Detected!
                ▼
┌───────────────────────────────┐
│   Rapid Payload Autofill      │ ◄── [Injects Journey, Personal & Card Info]
└───────────────┬───────────────┘
                │ Navigates to Payment Gateway
                ▼
┌───────────────────────────────┐
│  🔊 AUDIBLE BEEP TRIGGER      │ ◄── [System alerts user at CVV input field]
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  Human CVV & OTP Authorization │ ◄── [User completes secure transaction]
└───────────────────────────────┘
