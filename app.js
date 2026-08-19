/* ============================================================
   TRAIN SEAT BOOKING PORTAL — Application Logic
   Modules: Station Data, Train Data, Search, Wallet, Booking
   ============================================================ */

// ───────────────────── Station Data ─────────────────────
const STATIONS = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai' },
  { code: 'BCT',  name: 'Mumbai Central', city: 'Mumbai' },
  { code: 'HWH',  name: 'Howrah Junction', city: 'Kolkata' },
  { code: 'MAS',  name: 'Chennai Central', city: 'Chennai' },
  { code: 'SBC',  name: 'KSR Bengaluru', city: 'Bengaluru' },
  { code: 'JP',   name: 'Jaipur Junction', city: 'Jaipur' },
  { code: 'LKO',  name: 'Lucknow Charbagh', city: 'Lucknow' },
  { code: 'ADI',  name: 'Ahmedabad Junction', city: 'Ahmedabad' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna' },
  { code: 'HYB',  name: 'Hyderabad Deccan', city: 'Hyderabad' },
  { code: 'SC',   name: 'Secunderabad Junction', city: 'Hyderabad' },
  { code: 'TVC',  name: 'Thiruvananthapuram Central', city: 'Thiruvananthapuram' },
  { code: 'GKP',  name: 'Gorakhpur Junction', city: 'Gorakhpur' },
  { code: 'BPL',  name: 'Bhopal Junction', city: 'Bhopal' },
  { code: 'CNB',  name: 'Kanpur Central', city: 'Kanpur' },
  { code: 'AGC',  name: 'Agra Cantt', city: 'Agra' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune' },
  { code: 'CDG',  name: 'Chandigarh Junction', city: 'Chandigarh' },
  { code: 'GHY',  name: 'Guwahati', city: 'Guwahati' },
  { code: 'DBG',  name: 'Darbhanga Junction', city: 'Darbhanga' },
  { code: 'RNC',  name: 'Ranchi Junction', city: 'Ranchi' },
  { code: 'BBS',  name: 'Bhubaneswar', city: 'Bhubaneswar' },
  { code: 'VSKP', name: 'Visakhapatnam Junction', city: 'Visakhapatnam' },
  { code: 'KGP',  name: 'Kharagpur Junction', city: 'Kharagpur' },
  { code: 'UDZ',  name: 'Udaipur City', city: 'Udaipur' },
  { code: 'JAT',  name: 'Jammu Tawi', city: 'Jammu' },
  { code: 'DDN',  name: 'Dehradun', city: 'Dehradun' },
  { code: 'GWL',  name: 'Gwalior Junction', city: 'Gwalior' },
  { code: 'NGP',  name: 'Nagpur Junction', city: 'Nagpur' },
];

// ───────────────────── Route Templates ─────────────────────
// Pre-defined routes with intermediate stops
const ROUTE_TEMPLATES = {
  'NDLS-CSMT': {
    stops: ['NDLS', 'AGC', 'GWL', 'BPL', 'NGP', 'CSMT'],
    baseDistance: 1384,
  },
  'NDLS-HWH': {
    stops: ['NDLS', 'CNB', 'PNBE', 'HWH'],
    baseDistance: 1447,
  },
  'NDLS-MAS': {
    stops: ['NDLS', 'AGC', 'BPL', 'NGP', 'SC', 'MAS'],
    baseDistance: 2175,
  },
  'NDLS-SBC': {
    stops: ['NDLS', 'AGC', 'BPL', 'SC', 'SBC'],
    baseDistance: 2365,
  },
  'CSMT-MAS': {
    stops: ['CSMT', 'PUNE', 'SBC', 'MAS'],
    baseDistance: 1279,
  },
  'CSMT-HWH': {
    stops: ['CSMT', 'NGP', 'BBS', 'KGP', 'HWH'],
    baseDistance: 1968,
  },
  'HWH-MAS': {
    stops: ['HWH', 'KGP', 'BBS', 'VSKP', 'MAS'],
    baseDistance: 1663,
  },
  'NDLS-JP': {
    stops: ['NDLS', 'JP'],
    baseDistance: 308,
  },
  'NDLS-LKO': {
    stops: ['NDLS', 'CNB', 'LKO'],
    baseDistance: 511,
  },
  'NDLS-ADI': {
    stops: ['NDLS', 'JP', 'ADI'],
    baseDistance: 935,
  },
  'SBC-HYB': {
    stops: ['SBC', 'SC'],
    baseDistance: 570,
  },
  'NDLS-CDG': {
    stops: ['NDLS', 'CDG'],
    baseDistance: 247,
  },
  'NDLS-DDN': {
    stops: ['NDLS', 'DDN'],
    baseDistance: 309,
  },
  'CSMT-ADI': {
    stops: ['CSMT', 'PUNE', 'ADI'],
    baseDistance: 493,
  },
  'MAS-TVC': {
    stops: ['MAS', 'MAS', 'TVC'],
    baseDistance: 773,
  },
};

// ───────────────────── Train Generator ─────────────────────
function generateTrainData(fromCode, toCode, date) {
  const routeKey = `${fromCode}-${toCode}`;
  const reverseKey = `${toCode}-${fromCode}`;
  const template = ROUTE_TEMPLATES[routeKey] || ROUTE_TEMPLATES[reverseKey];

  // Seed based on route for consistent results
  const seed = (fromCode + toCode + date).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const pseudoRandom = (i) => {
    const x = Math.sin(seed * 9301 + i * 49297) * 49979;
    return x - Math.floor(x);
  };

  const trainTemplates = [
    { prefix: '12', type: 'Superfast', names: ['Rajdhani Express', 'Shatabdi Express', 'Duronto Express', 'Garib Rath Express', 'Sampark Kranti Express', 'Jan Shatabdi Express'] },
    { prefix: '12', type: 'Vande Bharat', names: ['Vande Bharat Express'] },
    { prefix: '12', type: 'Express', names: ['Humsafar Express', 'Tejas Express', 'Antyodaya Express', 'Mahamana Express'] },
    { prefix: '11', type: 'Mail', names: ['Mail Express', 'Passenger Express', 'Intercity Express'] },
  ];

  const distance = template ? template.baseDistance : 600 + Math.floor(pseudoRandom(0) * 1600);
  const stops = template ? template.stops : [fromCode, toCode];

  const trains = [];
  const numTrains = 6 + Math.floor(pseudoRandom(1) * 6); // 6-11 trains

  for (let i = 0; i < numTrains; i++) {
    const r = pseudoRandom(i * 100);
    const templateIdx = r < 0.25 ? 0 : r < 0.4 ? 1 : r < 0.7 ? 2 : 3;
    const tt = trainTemplates[templateIdx];
    const nameIdx = Math.floor(pseudoRandom(i * 200) * tt.names.length);

    // Generate departure time
    const depHour = Math.floor(pseudoRandom(i * 300) * 24);
    const depMin = Math.floor(pseudoRandom(i * 400) * 4) * 15; // 0, 15, 30, 45

    // Duration depends on distance, type, and stops
    let baseDurationHrs = distance / (tt.type === 'Vande Bharat' ? 100 : tt.type === 'Superfast' ? 75 : tt.type === 'Express' ? 60 : 50);
    baseDurationHrs += pseudoRandom(i * 500) * 3; // variance
    const durationMin = Math.round(baseDurationHrs * 60);

    const arrHour = (depHour + Math.floor(durationMin / 60)) % 24;
    const arrMin = (depMin + durationMin % 60) % 60;
    const nextDay = (depHour + Math.floor(durationMin / 60)) >= 24;

    // Determine if direct or with stops
    const isDirect = pseudoRandom(i * 600) < 0.35;
    let trainStops;
    if (isDirect || stops.length <= 2) {
      trainStops = [stops[0], stops[stops.length - 1]];
    } else {
      // Pick subset of stops
      const numStops = 2 + Math.floor(pseudoRandom(i * 700) * (stops.length - 2));
      trainStops = [stops[0]];
      const middleStops = stops.slice(1, -1).sort(() => pseudoRandom(i * 800 + trainStops.length) - 0.5);
      trainStops.push(...middleStops.slice(0, Math.min(numStops - 2, middleStops.length)));
      trainStops.push(stops[stops.length - 1]);
    }

    // Price calculation (in RailCoins)
    const basePrice = Math.round(distance * (tt.type === 'Vande Bharat' ? 1.8 : tt.type === 'Superfast' ? 1.2 : tt.type === 'Express' ? 0.9 : 0.7));

    // Availability per class
    const classes = ['SL', '3A', '2A', '1A'];
    const classMultipliers = { SL: 1, '3A': 2.2, '2A': 3.5, '1A': 5.5 };
    const availability = {};

    classes.forEach((cls, ci) => {
      const avRand = pseudoRandom(i * 900 + ci * 50);
      // Skip some classes for certain train types
      if (tt.type === 'Vande Bharat' && (cls === 'SL' || cls === '1A')) {
        availability[cls] = { status: 'none', seats: 0, waitlist: 0, price: 0 };
        return;
      }
      if (avRand < 0.5) {
        availability[cls] = {
          status: 'available',
          seats: Math.floor(pseudoRandom(i * 1000 + ci) * 80) + 1,
          waitlist: 0,
          price: Math.round(basePrice * classMultipliers[cls]),
        };
      } else if (avRand < 0.8) {
        availability[cls] = {
          status: 'waiting',
          seats: 0,
          waitlist: Math.floor(pseudoRandom(i * 1100 + ci) * 50) + 1,
          price: Math.round(basePrice * classMultipliers[cls]),
        };
      } else {
        availability[cls] = { status: 'none', seats: 0, waitlist: 0, price: 0 };
      }
    });

    // Find best available price for sorting
    const availPrices = Object.values(availability).filter(a => a.status !== 'none' && a.price > 0).map(a => a.price);
    const lowestPrice = availPrices.length > 0 ? Math.min(...availPrices) : Infinity;

    trains.push({
      id: `train-${i}`,
      number: `${tt.prefix}${String(300 + Math.floor(pseudoRandom(i * 1200) * 700)).padStart(3, '0')}`,
      name: tt.names[nameIdx],
      type: tt.type,
      from: fromCode,
      to: toCode,
      departure: { hour: depHour, minute: depMin },
      arrival: { hour: arrHour, minute: arrMin },
      nextDay,
      duration: durationMin,
      stops: trainStops,
      distance,
      availability,
      lowestPrice,
      isDirect: trainStops.length <= 2,
    });
  }

  return trains;
}

// ───────────────────── Time Formatting ─────────────────────
function formatTime(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDuration(totalMin) {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m}m`;
}

function getStationName(code) {
  const s = STATIONS.find(st => st.code === code);
  return s ? s.name : code;
}

function getStationCity(code) {
  const s = STATIONS.find(st => st.code === code);
  return s ? s.city : code;
}

// ───────────────────── Wallet (RailCoins) ─────────────────────
const Wallet = {
  KEY: 'railyatra_wallet',
  DEFAULT_BALANCE: 5000,

  getBalance() {
    const b = localStorage.getItem(this.KEY);
    if (b === null) {
      this.setBalance(this.DEFAULT_BALANCE);
      return this.DEFAULT_BALANCE;
    }
    return parseInt(b, 10);
  },

  setBalance(amount) {
    localStorage.setItem(this.KEY, String(amount));
    this.updateUI();
  },

  addCoins(amount) {
    this.setBalance(this.getBalance() + amount);
  },

  deduct(amount) {
    const current = this.getBalance();
    if (current < amount) return false;
    this.setBalance(current - amount);
    return true;
  },

  updateUI() {
    const els = document.querySelectorAll('.wallet-amount');
    els.forEach(el => {
      el.textContent = this.getBalance().toLocaleString();
    });
  },
};

// ───────────────────── Booking Data Store ─────────────────────
const BookingStore = {
  SEARCH_KEY: 'railyatra_search',
  SELECTED_KEY: 'railyatra_selected',
  BOOKING_KEY: 'railyatra_booking',

  saveSearch(data) {
    localStorage.setItem(this.SEARCH_KEY, JSON.stringify(data));
  },

  getSearch() {
    const d = localStorage.getItem(this.SEARCH_KEY);
    return d ? JSON.parse(d) : null;
  },

  saveSelected(data) {
    localStorage.setItem(this.SELECTED_KEY, JSON.stringify(data));
  },

  getSelected() {
    const d = localStorage.getItem(this.SELECTED_KEY);
    return d ? JSON.parse(d) : null;
  },

  saveBooking(data) {
    localStorage.setItem(this.BOOKING_KEY, JSON.stringify(data));
  },

  getBooking() {
    const d = localStorage.getItem(this.BOOKING_KEY);
    return d ? JSON.parse(d) : null;
  },

  generatePNR() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    for (let i = 0; i < 10; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
  },
};

// ───────────────────── Hero Slideshow ─────────────────────
function initSlideshow() {
  const slides = document.querySelectorAll('.hero-slideshow .slide');
  if (!slides.length) return;

  let current = 0;
  slides[0].classList.add('active');

  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 5000);
}

// ───────────────────── Navbar Scroll Effect ─────────────────────
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ───────────────────── Station Autocomplete ─────────────────────
function initStationDropdowns() {
  const inputs = document.querySelectorAll('.station-input');
  inputs.forEach(input => {
    const wrapper = input.closest('.station-input-wrapper');
    const dropdown = wrapper.querySelector('.station-dropdown');
    if (!dropdown) return;

    input.addEventListener('focus', () => {
      renderStationList(dropdown, '', input);
      dropdown.classList.add('visible');
    });

    input.addEventListener('input', (e) => {
      renderStationList(dropdown, e.target.value, input);
      dropdown.classList.add('visible');
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        dropdown.classList.remove('visible');
      }
    });
  });
}

function renderStationList(dropdown, query, input) {
  const q = query.toLowerCase();
  const filtered = STATIONS.filter(s =>
    s.code.toLowerCase().includes(q) ||
    s.name.toLowerCase().includes(q) ||
    s.city.toLowerCase().includes(q)
  ).slice(0, 10);

  dropdown.innerHTML = filtered.map(s => `
    <div class="station-option" data-code="${s.code}" data-name="${s.name} (${s.code})">
      <span class="station-opt-code">${s.code}</span>
      <span class="station-opt-name">${s.name}</span>
      <span class="station-opt-city">${s.city}</span>
    </div>
  `).join('');

  dropdown.querySelectorAll('.station-option').forEach(opt => {
    opt.addEventListener('click', () => {
      input.value = opt.dataset.name;
      input.dataset.code = opt.dataset.code;
      dropdown.classList.remove('visible');
    });
  });
}

// ───────────────────── Dynamic Travellers ─────────────────────
let travellerCount = 1;

function initTravellerForm() {
  const addBtn = document.getElementById('add-traveller-btn');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    if (travellerCount >= 6) {
      showToast('Maximum 6 travellers allowed');
      return;
    }
    travellerCount++;
    addTravellerCard(travellerCount);
  });
}

function addTravellerCard(num) {
  const container = document.getElementById('travellers-container');
  const card = document.createElement('div');
  card.className = 'traveller-card';
  card.dataset.index = num;
  card.innerHTML = `
    <div class="traveller-header">
      <span class="traveller-number">Traveller ${num}</span>
      <button type="button" class="remove-traveller" onclick="removeTraveller(${num})" title="Remove traveller">✕</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="name-${num}">Full Name</label>
        <input type="text" id="name-${num}" class="form-control traveller-name" placeholder="As on ID proof" required>
      </div>
      <div class="form-group">
        <label for="age-${num}">Age</label>
        <input type="number" id="age-${num}" class="form-control traveller-age" min="1" max="120" placeholder="Age" required>
      </div>
      <div class="form-group">
        <label for="gender-${num}">Gender</label>
        <select id="gender-${num}" class="form-control traveller-gender" required>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="id-type-${num}">ID Type</label>
        <select id="id-type-${num}" class="form-control traveller-id-type" required>
          <option value="">Select</option>
          <option value="Aadhaar">Aadhaar Card</option>
          <option value="Passport">Passport</option>
          <option value="PAN">PAN Card</option>
          <option value="VoterID">Voter ID</option>
        </select>
      </div>
      <div class="form-group">
        <label for="id-num-${num}">ID Number</label>
        <input type="text" id="id-num-${num}" class="form-control traveller-id-num" placeholder="ID Number" required>
      </div>
      <div class="form-group">
        <label for="berth-${num}">Berth Preference</label>
        <select id="berth-${num}" class="form-control traveller-berth">
          <option value="No Preference">No Preference</option>
          <option value="Lower">Lower</option>
          <option value="Middle">Middle</option>
          <option value="Upper">Upper</option>
          <option value="Side Lower">Side Lower</option>
          <option value="Side Upper">Side Upper</option>
        </select>
      </div>
    </div>
  `;
  container.appendChild(card);
}

function removeTraveller(num) {
  const card = document.querySelector(`.traveller-card[data-index="${num}"]`);
  if (card) {
    card.style.animation = 'fadeIn 0.3s ease reverse';
    setTimeout(() => {
      card.remove();
      travellerCount--;
      // Renumber
      const cards = document.querySelectorAll('.traveller-card');
      cards.forEach((c, i) => {
        c.querySelector('.traveller-number').textContent = `Traveller ${i + 1}`;
      });
    }, 250);
  }
}

// ───────────────────── Form Submission ─────────────────────
function initSearchForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fromInput = document.getElementById('from-station');
    const toInput = document.getElementById('to-station');
    const fromCode = fromInput.dataset.code;
    const toCode = toInput.dataset.code;

    if (!fromCode || !toCode) {
      showToast('Please select valid stations');
      return;
    }

    if (fromCode === toCode) {
      showToast('Source and destination cannot be the same');
      return;
    }

    const date = document.getElementById('journey-date').value;
    if (!date) {
      showToast('Please select a date');
      return;
    }

    const travelClass = document.getElementById('travel-class').value;
    const prefTime = document.getElementById('pref-time').value;
    const tatkal = document.getElementById('tatkal-toggle')?.checked || false;
    const seniorCitizen = document.getElementById('senior-toggle')?.checked || false;

    // Collect travellers
    const travellerCards = document.querySelectorAll('.traveller-card');
    const travellers = [];
    let valid = true;

    travellerCards.forEach(card => {
      const name = card.querySelector('.traveller-name')?.value?.trim();
      const age = card.querySelector('.traveller-age')?.value;
      const gender = card.querySelector('.traveller-gender')?.value;
      const idType = card.querySelector('.traveller-id-type')?.value;
      const idNum = card.querySelector('.traveller-id-num')?.value?.trim();
      const berth = card.querySelector('.traveller-berth')?.value;

      if (!name || !age || !gender || !idType || !idNum) {
        valid = false;
        return;
      }

      travellers.push({ name, age: parseInt(age), gender, idType, idNum, berth });
    });

    if (!valid || travellers.length === 0) {
      showToast('Please fill in all traveller details');
      return;
    }

    const searchData = {
      from: { code: fromCode, name: getStationName(fromCode), city: getStationCity(fromCode) },
      to: { code: toCode, name: getStationName(toCode), city: getStationCity(toCode) },
      date,
      travelClass,
      prefTime,
      tatkal,
      seniorCitizen,
      travellers,
    };

    BookingStore.saveSearch(searchData);
    window.location.href = 'trains.html';
  });
}

// ───────────────────── Train Listing Page ─────────────────────
function initTrainListing() {
  const listContainer = document.getElementById('train-list');
  if (!listContainer) return;

  const search = BookingStore.getSearch();
  if (!search) {
    window.location.href = 'index.html';
    return;
  }

  // Populate summary
  document.getElementById('summary-from').textContent = `${search.from.city} (${search.from.code})`;
  document.getElementById('summary-to').textContent = `${search.to.city} (${search.to.code})`;
  document.getElementById('summary-meta').textContent = `${formatDate(search.date)} · ${search.travellers.length} Traveller(s) · ${search.travelClass || 'All Classes'}`;

  // Generate trains
  let trains = generateTrainData(search.from.code, search.to.code, search.date);

  // Store current state
  window._allTrains = trains;
  window._searchData = search;

  renderTrains(trains, search);
  initSortFilter();
}

function renderTrains(trains, search) {
  const container = document.getElementById('train-list');
  const countEl = document.getElementById('train-count');

  if (countEl) countEl.textContent = `${trains.length} train(s) found`;

  if (trains.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="empty-icon">🚂</div>
        <h3>No trains found</h3>
        <p>Try changing your filters or search criteria</p>
      </div>
    `;
    return;
  }

  container.innerHTML = trains.map(train => {
    const classes = ['SL', '3A', '2A', '1A'];
    const classLabels = { SL: 'Sleeper', '3A': '3rd AC', '2A': '2nd AC', '1A': '1st AC' };

    // Find best available class matching user preference
    const preferredClass = search.travelClass;
    const selectedClassInfo = preferredClass && train.availability[preferredClass]
      ? { class: preferredClass, ...train.availability[preferredClass] }
      : null;

    const badgeClass = train.type === 'Superfast' ? 'badge-superfast'
      : train.type === 'Vande Bharat' ? 'badge-vande'
      : train.type === 'Express' ? 'badge-express'
      : 'badge-mail';

    const stopsText = train.isDirect
      ? 'Non-stop'
      : `${train.stops.length - 2} stop(s)`;

    const stopsDetail = train.stops.map(s => getStationName(s)).join(' → ');

    // Get display price (for the preferred class or lowest)
    let displayPrice = train.lowestPrice;
    if (selectedClassInfo && selectedClassInfo.price > 0) {
      displayPrice = selectedClassInfo.price;
    }

    // Determine which CTA to show
    const hasAvailable = Object.values(train.availability).some(a => a.status === 'available');
    const hasWaiting = Object.values(train.availability).some(a => a.status === 'waiting');

    return `
      <div class="train-card" data-train-id="${train.id}">
        <div class="train-card-header">
          <div class="train-name-group">
            <div class="train-number">${train.number}</div>
            <div class="train-name">${train.name}</div>
          </div>
          <span class="train-type-badge ${badgeClass}">${train.type}</span>
        </div>

        <div class="train-schedule">
          <div class="time-block">
            <div class="time">${formatTime(train.departure.hour, train.departure.minute)}</div>
            <div class="station-code">${search.from.code}</div>
          </div>
          <div class="journey-line">
            <div class="duration">${formatDuration(train.duration)}</div>
            <div class="line"></div>
            <div class="stops-label" onclick="toggleStops('${train.id}')">${stopsText} ${train.nextDay ? '(+1 day)' : ''}</div>
          </div>
          <div class="time-block">
            <div class="time">${formatTime(train.arrival.hour, train.arrival.minute)}</div>
            <div class="station-code">${search.to.code}</div>
          </div>
        </div>

        <div class="stops-detail" id="stops-${train.id}">
          <strong>Route:</strong> ${stopsDetail}
        </div>

        <div class="train-card-footer">
          <div class="availability-badges">
            ${classes.map(cls => {
              const av = train.availability[cls];
              if (av.status === 'none') {
                return `<div class="avail-badge avail-none"><span class="class-label">${classLabels[cls]}</span>N/A</div>`;
              } else if (av.status === 'available') {
                return `<div class="avail-badge avail-available"><span class="class-label">${classLabels[cls]}</span>Avl ${av.seats}</div>`;
              } else {
                return `<div class="avail-badge avail-waiting"><span class="class-label">${classLabels[cls]}</span>WL ${av.waitlist}</div>`;
              }
            }).join('')}
          </div>
          <div class="price-actions">
            <div class="price-tag">
              <span class="coin">🪙</span>${displayPrice.toLocaleString()}
              <span class="per-person">/person</span>
            </div>
            ${hasAvailable
              ? `<button class="btn btn-success btn-sm" onclick="selectTrain('${train.id}', 'book')">Book Seat</button>`
              : ''}
            ${hasWaiting
              ? `<button class="btn btn-warning btn-sm" onclick="selectTrain('${train.id}', 'waitlist')">Waiting List</button>`
              : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleStops(trainId) {
  const el = document.getElementById(`stops-${trainId}`);
  if (el) el.classList.toggle('visible');
}

function selectTrain(trainId, mode) {
  const train = window._allTrains.find(t => t.id === trainId);
  const search = window._searchData;
  if (!train || !search) return;

  // Pick class - user's preferred or best available
  let selectedClass = search.travelClass;
  const av = train.availability[selectedClass];
  if (!av || av.status === 'none') {
    // Find first available/waiting class
    const fallback = Object.entries(train.availability).find(([, v]) => v.status === (mode === 'book' ? 'available' : 'waiting'));
    if (fallback) selectedClass = fallback[0];
  }

  const classInfo = train.availability[selectedClass];
  if (!classInfo || classInfo.status === 'none') {
    showToast('No seats in the selected class');
    return;
  }

  BookingStore.saveSelected({
    train,
    selectedClass,
    mode,
    pricePerPerson: classInfo.price,
    totalPrice: classInfo.price * search.travellers.length,
    search,
  });

  window.location.href = 'payment.html';
}

// ───────────────────── Sort & Filter ─────────────────────
function initSortFilter() {
  const sortSelect = document.getElementById('sort-select');
  const filterChips = document.querySelectorAll('.filter-chip');
  const trainTypeSelect = document.getElementById('train-type-filter');

  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }

  if (trainTypeSelect) {
    trainTypeSelect.addEventListener('change', applyFilters);
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Toggle chip if in same group
      const group = chip.dataset.group;
      if (group) {
        document.querySelectorAll(`.filter-chip[data-group="${group}"]`).forEach(c => c.classList.remove('active'));
      }
      chip.classList.toggle('active');
      applyFilters();
    });
  });
}

function applyFilters() {
  let trains = [...window._allTrains];
  const search = window._searchData;

  // Sort
  const sortVal = document.getElementById('sort-select')?.value || 'price-asc';
  switch (sortVal) {
    case 'price-asc':
      trains.sort((a, b) => a.lowestPrice - b.lowestPrice);
      break;
    case 'price-desc':
      trains.sort((a, b) => b.lowestPrice - a.lowestPrice);
      break;
    case 'dep-earliest':
      trains.sort((a, b) => (a.departure.hour * 60 + a.departure.minute) - (b.departure.hour * 60 + b.departure.minute));
      break;
    case 'arr-earliest':
      trains.sort((a, b) => (a.arrival.hour * 60 + a.arrival.minute) - (b.arrival.hour * 60 + b.arrival.minute));
      break;
    case 'duration-short':
      trains.sort((a, b) => a.duration - b.duration);
      break;
  }

  // Filter: direct only
  const directChip = document.querySelector('.filter-chip[data-filter="direct"]');
  if (directChip && directChip.classList.contains('active')) {
    trains = trains.filter(t => t.isDirect);
  }

  // Filter: with stops
  const stopsChip = document.querySelector('.filter-chip[data-filter="stops"]');
  if (stopsChip && stopsChip.classList.contains('active')) {
    trains = trains.filter(t => !t.isDirect);
  }

  // Filter: available only
  const availChip = document.querySelector('.filter-chip[data-filter="available"]');
  if (availChip && availChip.classList.contains('active')) {
    trains = trains.filter(t => Object.values(t.availability).some(a => a.status === 'available'));
  }

  // Filter: train type
  const typeVal = document.getElementById('train-type-filter')?.value;
  if (typeVal && typeVal !== 'all') {
    trains = trains.filter(t => t.type === typeVal);
  }

  renderTrains(trains, search);
}

// ───────────────────── Payment Page ─────────────────────
function initPaymentPage() {
  const paymentForm = document.getElementById('payment-form');
  if (!paymentForm) return;

  const selected = BookingStore.getSelected();
  if (!selected) {
    window.location.href = 'index.html';
    return;
  }

  populateBookingSummary(selected);
  initWalletSection();
  initCardPreview();

  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    processPayment(selected);
  });
}

function populateBookingSummary(selected) {
  const { train, selectedClass, mode, pricePerPerson, totalPrice, search } = selected;
  const classLabels = { SL: 'Sleeper', '3A': '3rd AC', '2A': '2nd AC', '1A': '1st AC' };

  document.getElementById('pay-train-name').textContent = `${train.number} — ${train.name}`;
  document.getElementById('pay-route').textContent = `${search.from.city} → ${search.to.city}`;
  document.getElementById('pay-date').textContent = formatDate(search.date);
  document.getElementById('pay-class').textContent = classLabels[selectedClass] || selectedClass;
  document.getElementById('pay-type').textContent = mode === 'book' ? 'Confirmed Booking' : 'Waiting List';
  document.getElementById('pay-departure').textContent = formatTime(train.departure.hour, train.departure.minute);
  document.getElementById('pay-arrival').textContent = formatTime(train.arrival.hour, train.arrival.minute) + (train.nextDay ? ' (+1 day)' : '');
  document.getElementById('pay-duration').textContent = formatDuration(train.duration);
  document.getElementById('pay-per-person').textContent = `🪙 ${pricePerPerson.toLocaleString()}`;
  document.getElementById('pay-traveller-count').textContent = `${search.travellers.length} traveller(s)`;
  document.getElementById('pay-total').textContent = `🪙 ${totalPrice.toLocaleString()}`;

  // Traveller list
  const tList = document.getElementById('pay-traveller-list');
  if (tList) {
    tList.innerHTML = search.travellers.map(t => `
      <div class="traveller-summary-item">
        <span>${t.name} (${t.gender}, ${t.age}y)</span>
        <span>${t.berth || 'No Pref'}</span>
      </div>
    `).join('');
  }

  // Booking type badge
  const typeBadge = document.getElementById('pay-type');
  if (typeBadge && mode === 'waitlist') {
    typeBadge.style.color = 'var(--orange)';
  }
}

function initWalletSection() {
  Wallet.updateUI();

  const topupBtns = document.querySelectorAll('.topup-btn');
  topupBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = parseInt(btn.dataset.amount, 10);
      Wallet.addCoins(amount);
      showToast(`Added 🪙 ${amount.toLocaleString()} RailCoins!`);
    });
  });
}

function initCardPreview() {
  const cardNumInput = document.getElementById('card-number');
  const cardHolderInput = document.getElementById('card-holder');
  const cardExpiryInput = document.getElementById('card-expiry');

  const numDisplay = document.getElementById('card-number-display');
  const holderDisplay = document.getElementById('card-holder-name');
  const expiryDisplay = document.getElementById('card-expiry-date');

  if (cardNumInput && numDisplay) {
    cardNumInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').substring(0, 16);
      // Format with spaces
      let formatted = v.replace(/(.{4})/g, '$1 ').trim();
      e.target.value = formatted;
      numDisplay.textContent = formatted || '•••• •••• •••• ••••';
    });
  }

  if (cardHolderInput && holderDisplay) {
    cardHolderInput.addEventListener('input', (e) => {
      holderDisplay.textContent = e.target.value.toUpperCase() || 'YOUR NAME';
    });
  }

  if (cardExpiryInput && expiryDisplay) {
    cardExpiryInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2);
      e.target.value = v;
      expiryDisplay.textContent = v || 'MM/YY';
    });
  }
}

function processPayment(selected) {
  const { totalPrice } = selected;
  const balance = Wallet.getBalance();

  if (balance < totalPrice) {
    showToast('Insufficient RailCoins! Please top up your wallet.');
    return;
  }

  // Show processing
  showProcessing();

  setTimeout(() => {
    // Deduct
    Wallet.deduct(totalPrice);

    // Generate PNR
    const pnr = BookingStore.generatePNR();
    const booking = {
      pnr,
      ...selected,
      bookedAt: new Date().toISOString(),
    };
    BookingStore.saveBooking(booking);

    hideProcessing();
    showConfirmation(booking);
  }, 2500);
}

function showProcessing() {
  const overlay = document.createElement('div');
  overlay.className = 'processing-overlay';
  overlay.id = 'processing-overlay';
  overlay.innerHTML = `
    <div class="spinner"></div>
    <div class="processing-text">Processing your payment...</div>
  `;
  document.body.appendChild(overlay);
}

function hideProcessing() {
  const overlay = document.getElementById('processing-overlay');
  if (overlay) overlay.remove();
}

function showConfirmation(booking) {
  const { pnr, train, selectedClass, mode, totalPrice, search } = booking;
  const classLabels = { SL: 'Sleeper', '3A': '3rd AC', '2A': '2nd AC', '1A': '1st AC' };

  const overlay = document.createElement('div');
  overlay.className = 'confirmation-overlay';
  overlay.innerHTML = `
    <div class="ticket-card">
      <div class="ticket-header">
        <span class="success-icon">✅</span>
        <h2>${mode === 'book' ? 'Booking Confirmed!' : 'Waitlist Applied!'}</h2>
        <p>Your ticket has been ${mode === 'book' ? 'booked' : 'waitlisted'} successfully</p>
      </div>
      <div class="ticket-body">
        <div class="pnr-display">
          <div class="pnr-label">PNR Number</div>
          <div class="pnr-number">${pnr}</div>
        </div>
        <div class="ticket-row">
          <span class="t-label">Train</span>
          <span class="t-value">${train.number} — ${train.name}</span>
        </div>
        <div class="ticket-row">
          <span class="t-label">Route</span>
          <span class="t-value">${search.from.city} → ${search.to.city}</span>
        </div>
        <div class="ticket-row">
          <span class="t-label">Date</span>
          <span class="t-value">${formatDate(search.date)}</span>
        </div>
        <div class="ticket-row">
          <span class="t-label">Departure</span>
          <span class="t-value">${formatTime(train.departure.hour, train.departure.minute)}</span>
        </div>
        <div class="ticket-row">
          <span class="t-label">Class</span>
          <span class="t-value">${classLabels[selectedClass] || selectedClass}</span>
        </div>
        <div class="ticket-row">
          <span class="t-label">Travellers</span>
          <span class="t-value">${search.travellers.length}</span>
        </div>
        <hr class="ticket-divider">
        <div class="ticket-row">
          <span class="t-label">Amount Paid</span>
          <span class="t-value" style="color: var(--amber); font-size: 1.1rem;">🪙 ${totalPrice.toLocaleString()}</span>
        </div>
      </div>
      <div class="ticket-footer">
        <button class="btn btn-secondary" onclick="window.print()">🖨️ Print</button>
        <button class="btn btn-primary" onclick="window.location.href='index.html'">Book Another</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

// ───────────────────── Toast Notification ─────────────────────
function showToast(message) {
  // Remove existing
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    padding: 14px 28px;
    background: var(--deep-brown);
    color: var(--cream);
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 500;
    z-index: 3000;
    box-shadow: 0 8px 24px rgba(94, 48, 35, 0.35);
    animation: toastIn 0.3s ease forwards;
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastIn {
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ───────────────────── Date Formatting ─────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ───────────────────── Swap Stations ─────────────────────
function swapStations() {
  const fromInput = document.getElementById('from-station');
  const toInput = document.getElementById('to-station');
  if (!fromInput || !toInput) return;

  const tmpVal = fromInput.value;
  const tmpCode = fromInput.dataset.code;

  fromInput.value = toInput.value;
  fromInput.dataset.code = toInput.dataset.code || '';

  toInput.value = tmpVal;
  toInput.dataset.code = tmpCode || '';
}

// ───────────────────── Init ─────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Wallet.updateUI();
  initNavbarScroll();
  initSlideshow();
  initStationDropdowns();
  initTravellerForm();
  initSearchForm();
  initTrainListing();
  initPaymentPage();

  // Set min date to today
  const dateInput = document.getElementById('journey-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }
});
