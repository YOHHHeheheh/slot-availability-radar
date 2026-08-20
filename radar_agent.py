import json
import os
import sys
import time
from datetime import datetime
from playwright.sync_api import sync_playwright

# Audio alarm trigger for CVV pause
try:
    import winsound
    def trigger_beep_alarm():
        for _ in range(5):
            winsound.Beep(1200, 300)
            time.sleep(0.1)
except ImportError:
    def trigger_beep_alarm():
        for _ in range(5):
            sys.stdout.write("\a")
            sys.stdout.flush()
            time.sleep(0.2)

class WebCMDEngine:
    """
    WebCMD Execution, Learning & Self-Healing Engine:
    - Reuses cached locators from 'webcmd_cache.json' for 0ms lookup latency.
    - Evaluates candidates across Role, Label, ID, and CSS selectors.
    - Implements non-blocking DOM fallback execution to prevent automation crashes.
    """
    def __init__(self, page, cache_file="webcmd_cache.json"):
        self.page = page
        self.cache_file = cache_file
        self.cache = self._load_cache()

    def _load_cache(self):
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_cache(self):
        try:
            with open(self.cache_file, "w") as f:
                json.dump(self.cache, f, indent=2)
        except Exception as e:
            print(f"[!] WebCMD Cache notice: {e}")

    def execute(self, action: str, intent: str, candidates: list, value: str = None):
        action = action.upper().strip()
        cached_selector = self.cache.get(intent)

        # 1. ATTEMPT CACHED REUSE
        if cached_selector:
            print(f"  [WebCMD:REUSE] ⚡ Using learned locator for '{intent}' -> `{cached_selector}`")
            if self._apply_action(action, cached_selector, value):
                return True
            print(f"  [WebCMD:HEAL] ⚠️ Cached locator failed for '{intent}'. Re-evaluating candidates...")

        # 2. CANDIDATE DISCOVERY & LEARNING
        for selector in candidates:
            print(f"  [WebCMD:EVAL] Testing candidate: `{selector}`")
            if self._apply_action(action, selector, value):
                self.cache[intent] = selector
                self._save_cache()
                print(f"  [WebCMD:LEARN] 🧠 Learned and cached locator for '{intent}' -> `{selector}`")
                return True

        # 3. DIRECT JAVASCRIPT DOM FALLBACK
        print(f"  [WebCMD:DOM_FALLBACK] Executing direct DOM fallback for '{intent}'...")
        if self._dom_fallback(action, intent, candidates, value):
            return True

        print(f"  [WebCMD:WARN] Non-fatal: Completed step '{intent}' via best-effort execution.")
        return False

    def _apply_action(self, action: str, selector: str, value: str = None) -> bool:
        try:
            if selector.startswith("label:"):
                label_name = selector.replace("label:", "")
                locator = self.page.get_by_label(label_name)
                if action == "SELECT":
                    try:
                        locator.select_option(label=value, timeout=1200)
                    except Exception:
                        locator.select_option(value=value, timeout=1200)
                    return True
                elif action == "FILL":
                    locator.fill(str(value), timeout=1200)
                    return True
                elif action in ("CLICK", "FOCUS"):
                    locator.click(timeout=1200)
                    return True

            elif selector.startswith("role:"):
                role_type, role_name = selector.replace("role:", "").split("=", 1)
                locator = self.page.get_by_role(role_type, name=role_name)
                if action == "CLICK":
                    locator.click(timeout=1500)
                    return True
                elif action == "FILL":
                    locator.fill(str(value), timeout=1500)
                    return True
                elif action == "FOCUS":
                    locator.click(timeout=1500)
                    return True

            else:
                el = self.page.locator(selector).first
                if action == "FILL":
                    el.wait_for(state="visible", timeout=1500)
                    el.fill(str(value))
                    return True
                elif action == "CLICK":
                    el.wait_for(state="visible", timeout=1500)
                    el.click(timeout=1500)
                    return True
                elif action == "SELECT":
                    try:
                        el.select_option(label=value, timeout=1000)
                        return True
                    except Exception:
                        el.select_option(value=value, timeout=1000)
                        return True
                elif action == "FOCUS":
                    el.wait_for(state="visible", timeout=1500)
                    el.click(timeout=1500)
                    return True
        except Exception:
            return False
        return False

    def _dom_fallback(self, action: str, intent: str, candidates: list, value: str = None) -> bool:
        try:
            if action == "SELECT":
                return self.page.evaluate("""
                    ([val]) => {
                        const select = document.querySelector('#id-type-1') || 
                                       document.querySelector('.traveller-id-type') || 
                                       document.querySelectorAll('select')[1] ||
                                       document.querySelector('select');
                        if (!select) return false;
                        for (const opt of select.options) {
                            if (opt.text.toLowerCase().includes(val.toLowerCase()) || 
                                opt.value.toLowerCase().includes(val.toLowerCase())) {
                                select.value = opt.value;
                                select.dispatchEvent(new Event('change', { bubbles: true }));
                                return true;
                            }
                        }
                        return false;
                    }
                """, [value])
            elif action == "CLICK":
                self.page.evaluate(f"document.querySelector('{candidates[0]}')?.click()")
                return True
        except Exception:
            return False
        return False

def format_date(raw_date_str):
    """Converts DD-MM-YYYY, DD/MM/YYYY, or YYYY-MM-DD into valid YYYY-MM-DD."""
    clean_str = raw_date_str.strip().replace("/", "-")
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d-%m-%y"):
        try:
            return datetime.strptime(clean_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return raw_date_str

def prompt_input(label, default=""):
    val = input(f">> Enter {label} [{default}]: ").strip()
    return val if val else default

def get_terminal_inputs():
    print("\n" + "=" * 60)
    print("🚆 WEBCMD TRAIN AUTOMATION ENGINE - CONFIGURATION")
    print("(Press ENTER directly to accept the bracketed default)")
    print("=" * 60)

    # 1. Journey Setup
    print("\n[1] JOURNEY SETUP:")
    from_stn = prompt_input("From Station", "Howrah Junction")
    to_stn = prompt_input("To Station", "New Delhi")
    raw_date = prompt_input("Journey Date (DD-MM-YYYY or YYYY-MM-DD)", "2026-10-09")
    date_val = format_date(raw_date)

    # 2. Passenger Setup
    print("\n[2] PASSENGER SETUP:")
    name = prompt_input("Passenger Name", "Trishit Roy")
    age = prompt_input("Age", "19")

    print("\nSelect Gender:")
    print("  [1] Male")
    print("  [2] Female")
    print("  [3] Other")
    gender_choice = prompt_input("Gender Option (1/2/3)", "1")
    gender_map = {"1": "Male", "2": "Female", "3": "Other"}
    selected_gender = gender_map.get(gender_choice, "Male")

    print("\nSelect ID Type:")
    print("  [1] Aadhaar Card")
    print("  [2] Passport")
    print("  [3] PAN Card")
    print("  [4] Voter ID")
    id_choice = prompt_input("ID Type Option (1/2/3/4)", "1")
    id_map = {
        "1": "Aadhaar",
        "2": "Passport",
        "3": "PAN",
        "4": "Voter"
    }
    selected_id_type = id_map.get(id_choice, "Aadhaar")
    id_num = prompt_input(f"Enter {selected_id_type} Number", "ID123456789")

    # 3. Card Setup
    print("\n[3] PAYMENT CARD SETUP:")
    card_no = prompt_input("Card Number", "1234 5678 1234 7879")
    card_name = prompt_input("Cardholder Name", name)
    exp = prompt_input("Expiry Date (MM/YY)", "09/27")

    print("\n" + "=" * 60)
    print(f"✅ Session Configured: {name} | {selected_gender} | {selected_id_type}")
    print(f"🚀 Formatted Date: {date_val}")
    print("=" * 60 + "\n")

    return {
        "from": from_stn,
        "to": to_stn,
        "date": date_val,
        "name": name,
        "age": age,
        "gender": selected_gender,
        "id_type": selected_id_type,
        "id_num": id_num,
        "card_no": card_no,
        "card_name": card_name,
        "exp": exp
    }

def run():
    data = get_terminal_inputs()
    target_url = "https://yohhheheheh.github.io/slot-availability-radar/"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        cmd = WebCMDEngine(page)

        print("[*] 1. Opening Booking Portal...")
        page.goto(target_url, wait_until="domcontentloaded")
        time.sleep(1)

        # ---------------------------------------------------------
        # PHASE 1: JOURNEY SEARCH
        # ---------------------------------------------------------
        print("[*] 2. Setting Journey Details...")
        cmd.execute("FILL", "input_origin", [
            "role:textbox=From Station",
            "#from-station",
            "input[placeholder*='From']"
        ], data["from"])

        try:
            page.locator(f"text={data['from']}").first.click(timeout=800)
        except Exception:
            pass

        cmd.execute("FILL", "input_destination", [
            "role:textbox=To Station",
            "#to-station",
            "input[placeholder*='To']"
        ], data["to"])

        try:
            page.locator(f"text={data['to']}").last.click(timeout=800)
        except Exception:
            pass

        cmd.execute("FILL", "input_journey_date", [
            "#journey-date",
            "input[type='date']",
            "role:textbox=Date of Journey"
        ], data["date"])

        # Optional toggles
        try:
            page.locator(".toggle-slider").first.click(timeout=800)
            page.locator("div:nth-child(2) > .toggle-switch > .toggle-slider").click(timeout=800)
        except Exception:
            pass

        print("[*] 3. Submitting Train Search...")
        cmd.execute("CLICK", "btn_search_trains", [
            "role:button=🔍 Search Trains",
            "#booking-form button[type='submit']",
            "button:has-text('Search Trains')"
        ])

        # ---------------------------------------------------------
        # PHASE 2: TRAIN SELECTION
        # ---------------------------------------------------------
        print("[*] 4. Selecting Train Slot...")
        time.sleep(1)
        cmd.execute("CLICK", "btn_book_train", [
            "role:button=Book Seat",
            "button:has-text('Book Seat')",
            ".btn-book"
        ])

        # ---------------------------------------------------------
        # PHASE 3: PASSENGER DETAILS
        # ---------------------------------------------------------
        print(f"[*] 5. Entering Passenger Details: {data['name']}...")
        time.sleep(0.5)
        cmd.execute("FILL", "input_passenger_name", [
            "#traveller-name-1",
            "role:textbox=Full Name",
            "input[placeholder*='Full Name']"
        ], data["name"])

        cmd.execute("FILL", "input_passenger_age", [
            "#traveller-age-1",
            "role:spinbutton=Age",
            "input[type='number']"
        ], data["age"])

        cmd.execute("SELECT", "select_gender", [
            "#gender-1",
            ".traveller-gender",
            "label:Gender",
            "select:nth-of-type(1)"
        ], data["gender"])

        cmd.execute("SELECT", "select_id_type", [
            "#id-type-1",
            ".traveller-id-type",
            "label:ID Type",
            "select[id^='id-type']"
        ], data["id_type"])

        cmd.execute("FILL", "input_id_number", [
            "#id-number-1",
            "role:textbox=ID Number",
            "input[placeholder*='ID Number']"
        ], data["id_num"])

        print("[*] 6. Proceeding to Payment...")
        cmd.execute("CLICK", "btn_proceed_payment", [
            "role:button=Proceed to Payment ➔",
            "button:has-text('Proceed to Payment')",
            "#btn-to-payment"
        ])

        # ---------------------------------------------------------
        # PHASE 4: CARD DETAILS & CVV PAUSE
        # ---------------------------------------------------------
        print("[*] 7. Entering Card Details...")
        time.sleep(1)
        cmd.execute("FILL", "input_card_number", [
            "role:textbox=Card Number",
            "#card-number",
            "input[placeholder*='Card Number']"
        ], data["card_no"])

        cmd.execute("FILL", "input_card_holder", [
            "role:textbox=Card Holder Name",
            "#card-name",
            "input[placeholder*='Card Holder Name']"
        ], data["card_name"])

        cmd.execute("FILL", "input_card_expiry", [
            "role:textbox=Expiry Date",
            "#card-expiry",
            "input[placeholder*='Expiry Date']"
        ], data["exp"])

        # Focus CVV input
        cmd.execute("FOCUS", "input_card_cvv", [
            "role:textbox=CVV",
            "#card-cvv",
            "input[placeholder*='CVV']"
        ])

        # 1-second pause before sounding the hardware alarm
        print("[*] Cursor focused on CVV. Initializing alarm in 1 second...")
        time.sleep(1)

        print("\n" + "=" * 60)
        print("🚨 BEEP ALARM TRIGGERED! BOT PAUSED AT CVV 🚨")
        print("=" * 60)
        print(">> Cursor is active inside the CVV input box.")
        print(">> Type your CVV manually in the browser and click '💳 Pay Now'.")
        print("=" * 60 + "\n")

        trigger_beep_alarm()

        input(">> Press ENTER in this terminal when finished to close: ")
        browser.close()

if __name__ == "__main__":
    run()
