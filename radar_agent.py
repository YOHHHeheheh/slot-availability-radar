import sys
import time
from datetime import datetime
from playwright.sync_api import sync_playwright

# Audio alarm trigger for CVV
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

def format_date(raw_date_str):
    """Converts DD-MM-YYYY, DD/MM/YYYY, or YYYY-MM-DD into valid YYYY-MM-DD."""
    clean_str = raw_date_str.strip().replace("/", "-")
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d-%m-%y"):
        try:
            return datetime.strptime(clean_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return raw_date_str

def instant_select(page, selector, target_value):
    """Instantly selects matching dropdown options via JavaScript with zero timeout delay."""
    page.evaluate("""
        ([sel, query]) => {
            const dropdown = document.querySelector(sel);
            if (!dropdown) return;
            const options = Array.from(dropdown.options);
            const match = options.find(opt => 
                opt.value.toLowerCase().includes(query.toLowerCase()) || 
                opt.text.toLowerCase().includes(query.toLowerCase())
            );
            if (match) {
                dropdown.value = match.value;
                dropdown.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    """, [selector, target_value])

def prompt_input(label, default=""):
    val = input(f">> Enter {label} [{default}]: ").strip()
    return val if val else default

def get_terminal_inputs():
    print("\n" + "=" * 60)
    print("📋 TRAIN BOOKING AGENT - FAST SETUP")
    print("(Press ENTER directly to choose the bracketed default)")
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

    # Gender Menu
    print("\nSelect Gender:")
    print("  [1] Male")
    print("  [2] Female")
    print("  [3] Other")
    gender_choice = prompt_input("Gender Option (1/2/3)", "1")
    gender_map = {"1": "Male", "2": "Female", "3": "Other"}
    selected_gender = gender_map.get(gender_choice, "Male")

    # Identity Type Menu
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

    id_num = prompt_input(f"Enter {selected_id_type} Number", "1234567821")

    # 3. Card Setup
    print("\n[3] PAYMENT CARD SETUP:")
    card_no = prompt_input("Card Number", "1234 5678 1234 7879")
    card_name = prompt_input("Cardholder Name", name)
    exp = prompt_input("Expiry Date (MM/YY)", "09/27")

    print("\n" + "=" * 60)
    print(f"✅ Configured: {name} | {selected_gender} | {selected_id_type}")
    print("🚀 Launching high-speed automation engine...")
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
        # Removed slow_mo to run at top performance
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        print("[*] 1. Opening Booking Portal...")
        page.goto(target_url, wait_until="domcontentloaded")

        # ---------------------------------------------------------
        # STEP 1: Search Form
        # ---------------------------------------------------------
        print(f"[*] 2. Entering Origin: {data['from']}...")
        from_box = page.get_by_role("textbox", name="From Station")
        from_box.fill(data["from"])
        try:
            page.get_by_text(data["from"]).first.click(timeout=1000)
        except Exception:
            pass

        print(f"[*] 3. Entering Destination: {data['to']}...")
        to_box = page.get_by_role("textbox", name="To Station")
        to_box.fill(data["to"])
        try:
            page.get_by_text(data["to"]).last.click(timeout=1000)
        except Exception:
            pass

        print(f"[*] 4. Setting Date: {data['date']}...")
        page.locator("#journey-date, input[type='date']").first.fill(data["date"])

        try:
            page.locator(".toggle-slider").first.click(timeout=800)
            page.locator("div:nth-child(2) > .toggle-switch > .toggle-slider").click(timeout=800)
        except Exception:
            pass

        print("[*] 5. Searching Trains...")
        page.get_by_role("button", name="🔍 Search Trains").click()

        # ---------------------------------------------------------
        # STEP 2: Select Train
        # ---------------------------------------------------------
        print("[*] 6. Booking Train Slot...")
        book_btn = page.get_by_role("button", name="Book Seat").first
        book_btn.wait_for(state="visible", timeout=8000)
        book_btn.click()

        # ---------------------------------------------------------
        # STEP 3: Instant Passenger Details (Zero Lag)
        # ---------------------------------------------------------
        print(f"[*] 7. Filling Passenger Details for {data['name']}...")
        name_input = page.get_by_role("textbox", name="Full Name")
        name_input.wait_for(state="visible", timeout=8000)
        name_input.fill(data["name"])
        page.get_by_role("spinbutton", name="Age").fill(str(data["age"]))

        # Instant dropdown selections using direct DOM events
        instant_select(page, "#pass-gender, select[name*='gender'], select[id*='gender'], select", data["gender"])
        instant_select(page, "#pass-id-type, select[name*='id'], select[id*='id'], select:nth-of-type(2)", data["id_type"])

        id_num_box = page.get_by_role("textbox", name="ID Number")
        id_num_box.fill(data["id_num"])

        print("[*] 8. Proceeding to Payment...")
        page.get_by_role("button", name="Proceed to Payment ➔").click()

        # ---------------------------------------------------------
        # STEP 4: Card Details & CVV Halt
        # ---------------------------------------------------------
        print("[*] 9. Entering Card Details...")
        card_box = page.get_by_role("textbox", name="Card Number")
        card_box.wait_for(state="visible", timeout=8000)
        card_box.fill(data["card_no"])

        page.get_by_role("textbox", name="Card Holder Name").fill(data["card_name"])
        page.get_by_role("textbox", name="Expiry Date").fill(data["exp"])

        # Focus CVV Box and Halt
        cvv_box = page.get_by_role("textbox", name="CVV")
        cvv_box.click()

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
