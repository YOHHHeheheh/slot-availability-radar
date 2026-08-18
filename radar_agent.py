import json
import os
import random
import sys
import time
import requests
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

def load_config(path="config.json"):
    with open(path, "r") as f:
        return json.load(f)

def send_telegram_alert(config, message):
    """Dispatches a low-latency alert via Telegram webhook."""
    notif = config.get("notifications", {})
    if not notif.get("telegram_enabled"):
        return
    token = notif.get("bot_token")
    chat_id = notif.get("chat_id")
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": message, "parse_mode": "Markdown"}
    try:
        requests.post(url, json=payload, timeout=2)
    except Exception as e:
        print(f"[!] Notification dispatch error: {e}")

def trigger_human_alarm():
    """Triggers local terminal bells and visual banners for human-in-the-loop takeover."""
    print("\n" + "=" * 60)
    print("🚨 SLOT SECURED! HUMAN ACTION REQUIRED AT PAYMENT/OTP 🚨")
    print("=" * 60 + "\n")
    for _ in range(5):
        sys.stdout.write("\a")
        sys.stdout.flush()
        time.sleep(0.25)

def apply_stealth_overrides(page):
    """Masks browser automation flags and standard fingerprint leaks."""
    stealth_js = """
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
        configurable: true
    });
    window.chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
    };
    Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en']
    });
    """
    page.add_init_script(stealth_js)

def human_type(locator, text):
    """Types characters with Gaussian-distributed micro-delays."""
    locator.focus()
    for char in text:
        locator.type(char, delay=random.randint(45, 120))
        if random.random() < 0.05:
            time.sleep(random.uniform(0.1, 0.25))

def run_radar():
    config = load_config()
    selectors = config["selectors"]
    traveler = config["traveler"]
    state_file = config["session_state_file"]
    
    current_backoff = config["poll_interval_seconds"]
    slot_detected = False
    latest_api_payload = {}

    with sync_playwright() as p:
        # Configure residential proxy if enabled
        launch_kwargs = {"headless": False, "args": ["--disable-blink-features=AutomationControlled"]}
        if config["proxy"]["enabled"]:
            launch_kwargs["proxy"] = {"server": config["proxy"]["server"]}

        browser = p.chromium.launch(**launch_kwargs)

        # Persistent session restoration
        context_kwargs = {
            "viewport": {"width": 1920, "height": 1080},
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
        }
        if os.path.exists(state_file):
            print("[*] Hydrating authenticated session from existing state file...")
            context_kwargs["storage_state"] = state_file

        context = browser.new_context(**context_kwargs)
        page = context.new_page()
        apply_stealth_overrides(page)

        # API & XHR Interception Listener
        def handle_network_response(response):
            nonlocal slot_detected, latest_api_payload, current_backoff
            # Adaptive rate-limit handling
            if response.status == 429:
                print("[!] Rate limit detected (HTTP 429). Initiating adaptive backoff...")
                current_backoff = min(current_backoff * 2, config["max_backoff_seconds"])
                return

            # Intercept availability payloads directly from background network traffic
            if config["api_endpoint_keyword"] in response.url and response.status == 200:
                current_backoff = config["poll_interval_seconds"]
                try:
                    data = response.json()
                    latest_api_payload = data
                    # Check for positive slot indicators in the JSON
                    if data.get("available") is True or data.get("slots_count", 0) > 0:
                        print(f"[+] Direct API Hit: Slot confirmed available! Data: {data}")
                        slot_detected = True
                except Exception:
                    pass

        page.on("response", handle_network_response)

        print(f"[*] Navigating to: {config['target_url']}")
        page.goto(config["target_url"], wait_until="domcontentloaded")

        # Initial login & session checkpoint
        if not os.path.exists(state_file):
            print("[*] No saved session found. Complete manual login now.")
            print("[*] Once logged in and on the booking screen, press ENTER to save session and start radar...")
            input(">> ")
            context.storage_state(path=state_file)
            print(f"[+] Authenticated state persisted to {state_file}")

        print("[*] Radar monitoring active. Listening to background API streams and DOM...")
        attempt = 1

        # Monitoring Loop
        while not slot_detected:
            attempt += 1
            # Check DOM fallback alongside API interception
            try:
                dom_slot = page.locator(selectors["slot_button"]).first
                if dom_slot.is_visible(timeout=1500):
                    print("[+] Slot indicator observed in UI elements.")
                    slot_detected = True
                    break
            except Exception:
                pass

            # Heartbeat ping / periodic page refresh to prevent session idle timeout
            if attempt % 6 == 0:
                print("[*] Heartbeat: refreshing active session state...")
                page.reload(wait_until="domcontentloaded")
            
            jittered_sleep = current_backoff + random.uniform(0.5, 1.8)
            time.sleep(jittered_sleep)

        # Slot Claim Execution
        if slot_detected:
            send_telegram_alert(config, "🚨 **Slot Found!** Auto-filling details and holding at payment screen.")
            print("[*] Initiating rapid form completion...")
            
            try:
                page.locator(selectors["slot_button"]).first.click()
            except Exception:
                pass

            # Natural humanized typing injection
            human_type(page.locator(selectors["name_input"]), traveler["full_name"])
            human_type(page.locator(selectors["id_input"]), traveler["passport_or_id"])
            
            if page.locator(selectors["phone_input"]).is_visible():
                human_type(page.locator(selectors["phone_input"]), traveler["phone"])

            # Proceed to authentication / payment checkpoint
            page.locator(selectors["submit_button"]).click()

            # Human-in-the-Loop Hand-off
            trigger_human_alarm()
            try:
                page.wait_for_selector(selectors["otp_payment_indicator"], timeout=8000)
            except Exception:
                pass

            print("[*] Automation halted at security checkpoint. Complete OTP and payment manually.")
            input(">> Press ENTER once payment is finished to clean up and exit: ")

        browser.close()
        print("[*] Radar session closed cleanly.")

if __name__ == "__main__":
    run_radar()
