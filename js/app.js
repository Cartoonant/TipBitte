/**
 * TipBitte - Core Application Logic (English Version with Coins)
 * Meritocratic Tip Sharing & Team Gamification App
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. INITIAL STATE & REAL STAFF ROSTER (AUGUST 2026)
  // ==========================================

  const DEFAULT_STAFF = [
    // Front Team (Floor / Bar)
    { id: 'emp-2', name: 'Vinod', role: 'FRONT', title: 'Service Lead', color: '#3b82f6', avatar: 'VN', offDays: [4] },       // Thursday
    { id: 'emp-3', name: 'Siri', role: 'FRONT', title: 'Server', color: '#8b5cf6', avatar: 'SR', offDays: [2, 3] },    // Tue, Wed
    
    // Kitchen Team
    { id: 'emp-4', name: 'Aadhi', role: 'KITCHEN', title: 'Kitchen Lead', color: '#ec4899', avatar: 'AD', offDays: [4] },    // Thursday
    { id: 'emp-5', name: 'Karthik', role: 'KITCHEN', title: 'Kitchen', color: '#10b981', avatar: 'KR', offDays: [1] },    // Monday
    { id: 'emp-6', name: 'Bhanu', role: 'KITCHEN', title: 'Kitchen', color: '#f59e0b', avatar: 'BH', offDays: [2] },    // Tuesday
    { id: 'emp-7', name: 'Muthyam', role: 'KITCHEN', title: 'Kitchen', color: '#6366f1', avatar: 'MT', offDays: [3] },   // Wednesday

    // Cleaning Team
    { id: 'emp-8', name: 'Roy', role: 'CLEANER', title: 'Cleaner', color: '#14b8a6', avatar: 'RY', offDays: [] }
  ];

  const DEFAULT_MASTER_CATALOGUE = [
    { id: 'cat-1', title: 'Register closure & bar organization', scope: 'FRONT', period: 'EVENING', points: 15, recurrence: 'DAILY', desc: 'Balance POS terminal, organize bar top, sanitize soda taps, restock wine fridge.' },
    { id: 'cat-2', title: 'Fridge restocking & beverage audit', scope: 'FRONT', period: 'MORNING', points: 10, recurrence: 'DAILY', desc: 'Check beverage stock levels, restock beer taps, refill lemon slices and ice buckets.' },
    { id: 'cat-3', title: 'Upselling gourmet wines & dessert combos', scope: 'FRONT', period: 'AFTERNOON', points: 10, recurrence: 'DAILY', desc: 'Recommend daily wine pairing special and dessert combos during floor service.' },
    { id: 'cat-4', title: 'Deep clean beverage dispenser & bar floor', scope: 'FRONT', period: 'EVENING', points: 25, recurrence: 'WEEKLY', desc: 'Flush beverage lines, scrub drain mats, sweep and mop behind bar area.' },
    { id: 'cat-5', title: 'Kitchen station sanitization & line setup', scope: 'KITCHEN', period: 'MORNING', points: 15, recurrence: 'DAILY', desc: 'Sanitize prep boards, calibrate food thermometers, organize line utensils.' },
    { id: 'cat-6', title: 'Deep oven & fryer oil filtration maintenance', scope: 'KITCHEN', period: 'EVENING', points: 25, recurrence: 'WEEKLY', desc: 'Filter fryer oil, scrub pizza oven deck, clean exhaust hood filters.' },
    { id: 'cat-7', title: 'Prep list completion & food label audit', scope: 'KITCHEN', period: 'AFTERNOON', points: 10, recurrence: 'DAILY', desc: 'Complete prep list items, check FIFO expiry dates, apply date labels.' },
    { id: 'cat-8', title: 'Zero food waste & stock rotation lead', scope: 'KITCHEN', period: 'EVENING', points: 15, recurrence: 'DAILY', desc: 'Monitor portion sizes, record daily waste log, rotate walk-in cooler stock.' },
    { id: 'cat-9', title: 'Hero shift lead & emergency floor cover', scope: 'EVERYONE', period: 'ANYTIME', points: 50, recurrence: 'ONEOFF', desc: 'Cover unexpected busy rush, assist team members across kitchen and floor.' },
    { id: 'cat-10', title: 'Quick table floor wipe & tray assist', scope: 'EVERYONE', period: 'ANYTIME', points: 1, recurrence: 'DAILY', desc: 'Assist floor team with clearing dining tables during peak rush.' },
    { id: 'cat-11', title: 'Deep restaurant floor sweep & mop', scope: 'CLEANER', period: 'EVENING', points: 15, recurrence: 'DAILY', desc: 'Sweep and mop main dining room, bar area, hallway, and entrance floors.' },
    { id: 'cat-12', title: 'Restroom sanitization & paper restock', scope: 'CLEANER', period: 'ANYTIME', points: 15, recurrence: 'DAILY', desc: 'Scrub toilets, sanitize sinks and mirrors, refill hand soap and paper towel dispensers.' },
    { id: 'cat-13', title: 'Trash & recycling waste management', scope: 'CLEANER', period: 'EVENING', points: 10, recurrence: 'DAILY', desc: 'Empty all dining room and kitchen trash bins, replace liners, and drop waste in outdoor dumpsters.' }
  ];

  const getCurrentMonthKey = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  };

  const getDaysInMonth = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const DEFAULT_SOP_PDFS = [];

  // Global State
  let appState = {
    currentMonth: getCurrentMonthKey(),
    activeRole: 'MANAGER', // 'MANAGER' or employee ID (e.g. 'emp-2')
    eotmWinnerId: null,     // Employee ID crowned as Employee of the Month
    eotmBonusAmount: 100,   // Fixed bonus in € for Employee of the Month
    theme: 'dark',
    activeFilter: 'ALL',
    staff: [],
    masterTaskCatalogue: [], // Structured Master Catalogue: [ { id, title, scope, period, points, recurrence, desc } ]
    schedules: {},           // { "2026-08": { "emp-2": { 1: true, 2: false, ... } } }
    scheduledDailyTasks: [], // [ { id, employeeId, day, title, category, period, points, desc } ]
    tasks: [],               // Submissions: [ { id, employeeId, desc, points, status: 'APPROVED'|'PENDING'|'REJECTED', timestamp } ]
    sopDocuments: [],        // SOP PDF Documents: [ { id, title, category, url, size, date } ]
    tipsConfig: {},          // { "2026-08": { totalAmount: 2600 } }
    manualTipOverrides: {}   // { "emp-2": { percent: 25, amount: 650 } }
  };

  // Recurring weekly rest days (JS Date.getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
  const DEFAULT_OFF_DAYS_CONFIG = {
    'emp-2': [4],       // Vinod -> Thursday
    'emp-3': [2, 3],    // Siri -> Tuesday, Wednesday
    'emp-4': [4],       // Aadhi -> Thursday
    'emp-5': [1],       // Karthik -> Monday
    'emp-6': [2],       // Bhanu -> Tuesday
    'emp-7': [3]        // Muthyam -> Wednesday
  };

  const getDayOfWeekAbbr = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  // ==========================================
  // 2. LOCALSTORAGE PERSISTENCE & INITIALIZATION
  // ==========================================

  let isInitialized = false;

  const saveState = () => {
    localStorage.setItem('tiprank_resto_state', JSON.stringify(appState));
    if (isInitialized) {
      renderAll();
    }
  };

  const loadState = () => {
    const saved = localStorage.getItem('tiprank_resto_state');
    if (saved) {
      try {
        appState = JSON.parse(saved);
        if (!appState.currentMonth || appState.currentMonth !== '2026-08') appState.currentMonth = '2026-08';
        if (!appState.activeRole) appState.activeRole = 'MANAGER';
        if (appState.eotmBonusAmount === undefined) appState.eotmBonusAmount = 100;
        
        // Ensure legacy mock PDF files are cleared
        if (appState.sopDocuments && appState.sopDocuments.some(d => d.id.startsWith('pdf-'))) {
          appState.sopDocuments = [];
        }

        // Ensure Roy (Cleaner) is present in staff
        if (appState.staff && !appState.staff.some(s => s.id === 'emp-8' || s.name === 'Roy')) {
          appState.staff.push({ id: 'emp-8', name: 'Roy', role: 'CLEANER', title: 'Cleaner', color: '#14b8a6', avatar: 'RY', offDays: [] });
        }

        if (!appState.staff || appState.staff.length === 0 || appState.staff.some(s => s.name.includes('Pal')) || !appState.staff.some(s => s.title === 'Kitchen Lead')) {
          initDefaultState();
        }
      } catch (e) {
        console.error("Error reading LocalStorage state", e);
        initDefaultState();
      }
    } else {
      initDefaultState();
    }
  };

  const initDefaultState = () => {
    appState.staff = JSON.parse(JSON.stringify(DEFAULT_STAFF));
    appState.activeRole = 'MANAGER';
    appState.eotmWinnerId = null;
    appState.eotmBonusAmount = 100;
    appState.tasks = [];
    appState.schedules = {};
    appState.tipsConfig = {};
    appState.sopDocuments = [];
    appState.theme = 'dark';
    
    generateDemoData();
  };

  // Guarantee Days Off Schedule Persistence across any selected month
  const ensureMonthSchedule = (monthKey) => {
    if (!monthKey) return;
    if (!appState.schedules) appState.schedules = {};

    if (!appState.schedules[monthKey]) {
      appState.schedules[monthKey] = {};
      const daysCount = getDaysInMonth(monthKey);
      const [year, month] = monthKey.split('-').map(Number);

      (appState.staff || []).forEach((emp) => {
        appState.schedules[monthKey][emp.id] = {};
        const empOffWeekdays = emp.offDays || DEFAULT_OFF_DAYS_CONFIG[emp.id] || [];

        for (let d = 1; d <= daysCount; d++) {
          const date = new Date(year, month - 1, d);
          const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ...
          const isOff = empOffWeekdays.includes(dayOfWeek);
          appState.schedules[monthKey][emp.id][d] = !isOff;
        }
      });
    }

    if (!appState.tipsConfig) appState.tipsConfig = {};
    if (!appState.tipsConfig[monthKey]) {
      appState.tipsConfig[monthKey] = { totalAmount: 2600 };
    }
  };

  const generateDemoData = () => {
    const mKey = appState.currentMonth;
    ensureMonthSchedule(mKey);

    // Default tip configuration (e.g. 2600 € pool)
    if (!appState.tipsConfig[mKey]) {
      appState.tipsConfig[mKey] = {
        totalAmount: 2600
      };
    }

    // Default Scheduled Daily Tasks
    if (!appState.scheduledDailyTasks || appState.scheduledDailyTasks.length === 0) {
      appState.scheduledDailyTasks = [
        { id: 'st-1', employeeId: 'emp-2', title: 'Front: Register closure & bar organization', category: 'FRONT', points: 20 },
        { id: 'st-2', employeeId: 'emp-3', title: 'Front: Fridge restocking & beverage audit', category: 'FRONT', points: 15 },
        { id: 'st-3', employeeId: 'emp-4', title: 'Kitchen: Deep cleaning & station sanitization', category: 'KITCHEN', points: 20 },
        { id: 'st-4', employeeId: 'emp-5', title: 'Kitchen: Equipment maintenance & grill care', category: 'KITCHEN', points: 25 },
        { id: 'st-5', employeeId: 'emp-6', title: 'Kitchen: Accelerated prep list completion', category: 'KITCHEN', points: 15 },
        { id: 'st-6', employeeId: 'emp-7', title: 'Kitchen: Stock control & zero food waste', category: 'KITCHEN', points: 20 }
      ];
    }

    if (!appState.manualTipOverrides) appState.manualTipOverrides = {};

    // Approved Demo Tasks & Initiatives to simulate pro-rata Coins & Tip distribution
    if (!appState.tasks || appState.tasks.length === 0) {
      appState.tasks = [
        { id: 'demo-1', employeeId: 'emp-4', desc: 'Aadhi (Kitchen Lead): Kitchen prep list & zero food waste initiative', points: 140, status: 'APPROVED', timestamp: Date.now() - 86400000 },
        { id: 'demo-2', employeeId: 'emp-2', desc: 'Vinod (Front Lead): Terrace management & guest satisfaction', points: 120, status: 'APPROVED', timestamp: Date.now() - 72000000 },
        { id: 'demo-3', employeeId: 'emp-5', desc: 'Karthik (Kitchen): Preventive pizza oven & grill maintenance', points: 110, status: 'APPROVED', timestamp: Date.now() - 60000000 },
        { id: 'demo-4', employeeId: 'emp-3', desc: 'Siri (Server): Upselling gourmet wines & dessert combos', points: 95, status: 'APPROVED', timestamp: Date.now() - 48000000 },
        { id: 'demo-5', employeeId: 'emp-7', desc: 'Muthyam (Kitchen): Station sanitization & plate styling', points: 90, status: 'APPROVED', timestamp: Date.now() - 36000000 },
        { id: 'demo-6', employeeId: 'emp-6', desc: 'Bhanu (Kitchen): Stock replenishment & prep support', points: 85, status: 'APPROVED', timestamp: Date.now() - 24000000 }
      ];
    }

    localStorage.setItem('tiprank_resto_state', JSON.stringify(appState));
  };

  // ==========================================
  // 3. CALCULATION ENGINE (COIN-BASED MERITOCRACY + EOTM BONUS)
  // ==========================================

  // Attendance metrics (Informative)
  const getEmployeeAttendance = (empId, monthKey = appState.currentMonth) => {
    const daysMap = appState.schedules[monthKey]?.[empId] || {};
    const workedDays = Object.values(daysMap).filter(isWorked => isWorked === true).length;
    return {
      workedDays,
      workedHours: workedDays * 11
    };
  };

  // Coins earned from approved entries
  const getEmployeePoints = (empId) => {
    return appState.tasks
      .filter(t => t.employeeId === empId && t.status === 'APPROVED')
      .reduce((sum, t) => sum + (t.points || 0), 0);
  };

  // Tip distribution calculation based on Coins + EOTM Bonus (Hybrid Model)
  const calculateTipDistribution = () => {
    const config = appState.tipsConfig[appState.currentMonth] || { totalAmount: 2600 };
    const totalTips = parseFloat(config.totalAmount) || 0;
    const bonusAmount = parseFloat(appState.eotmBonusAmount) || 0;
    const winnerId = appState.eotmWinnerId;

    let empStats = appState.staff.map(emp => {
      const points = getEmployeePoints(emp.id);
      const att = getEmployeeAttendance(emp.id, appState.currentMonth);
      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        title: emp.title,
        color: emp.color,
        avatar: emp.avatar,
        workedDays: att.workedDays,
        workedHours: att.workedHours,
        points: points,
        baselinePercent: 0,
        manualPercent: null,
        tipSharePercent: 0,
        tipAmount: 0,
        isWinner: emp.id === winnerId
      };
    });

    const grandTotalPoints = empStats.reduce((sum, e) => sum + e.points, 0);

    // Amount pool left to distribute pro-rata after deducting winner bonus
    const poolForProRata = winnerId && totalTips >= bonusAmount ? totalTips - bonusAmount : totalTips;

    // Baseline Coin-Proportions calculation
    empStats.forEach(emp => {
      if (grandTotalPoints > 0) {
        emp.baselinePercent = parseFloat(((emp.points / grandTotalPoints) * 100).toFixed(2));
      } else {
        emp.baselinePercent = appState.staff.length > 0 ? parseFloat((100 / appState.staff.length).toFixed(2)) : 0;
      }

      // Check for manual overrides from Manager
      const override = appState.manualTipOverrides ? appState.manualTipOverrides[emp.id] : null;
      if (override && override.percent !== undefined && override.percent !== null) {
        emp.manualPercent = parseFloat(override.percent);
        emp.tipSharePercent = emp.manualPercent;
      } else {
        emp.tipSharePercent = emp.baselinePercent;
      }

      // Base pro-rata share amount
      let baseTipAmt = (emp.tipSharePercent / 100) * poolForProRata;
      
      // Add EOTM fixed bonus to winner
      if (emp.id === winnerId) {
        baseTipAmt += bonusAmount;
      }

      emp.tipAmount = baseTipAmt;
    });

    const frontPool = empStats.filter(e => e.role === 'FRONT').reduce((sum, e) => sum + e.tipAmount, 0);
    const kitchenPool = empStats.filter(e => e.role === 'KITCHEN').reduce((sum, e) => sum + e.tipAmount, 0);

    return { empStats, grandTotalPoints, totalTips, frontPool, kitchenPool };
  };

  // ==========================================
  // 4. UI RENDERERS (VIEWS)
  // ==========================================

  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', appState.theme);
  };

  const renderHeaderLiveDate = () => {
    const liveDateEl = document.getElementById('header-live-date');
    if (!liveDateEl) return;
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);
    liveDateEl.innerHTML = `<i data-lucide="clock" class="selector-icon text-gold" style="width:16px; height:16px;"></i> <span>${dateStr}</span>`;
    if (window.lucide) lucide.createIcons();
  };

  const renderMonthSelector = () => {
    const select = document.getElementById('current-month-select');
    if (!select) return;

    const now = new Date();
    const currentYr = now.getFullYear();
    const currentMo = now.getMonth(); // 0-indexed

    let optionsHTML = '';
    // Generate rolling months (from 2 months ago to 9 months ahead)
    for (let i = -2; i <= 9; i++) {
      const d = new Date(currentYr, currentMo + i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yyyy}-${mm}`;
      const monthName = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const isCurrentDeviceMonth = (i === 0);
      optionsHTML += `<option value="${key}">${monthName} ${isCurrentDeviceMonth ? '(Current)' : ''}</option>`;
    }

    select.innerHTML = optionsHTML;
    select.value = appState.currentMonth || getCurrentMonthKey();

    const heroMonth = document.getElementById('hero-month-name');
    if (heroMonth) heroMonth.textContent = select.options[select.selectedIndex]?.text || appState.currentMonth;
  };

  // Dashboard & Leaderboard Renderer (Unified Global Ranking & Role Permissions)
  const renderDashboard = () => {
    const isManager = appState.activeRole === 'MANAGER';
    const { empStats, grandTotalPoints } = calculateTipDistribution();
    const config = appState.tipsConfig[appState.currentMonth] || { totalAmount: 2600 };
    const totalTips = parseFloat(config.totalAmount) || 0;

    // Populate Manager Employee of the Month Dropdown
    const selectEotm = document.getElementById('select-eotm-winner');
    if (selectEotm) {
      let optsHTML = `<option value="">-- Select Winner --</option>`;
      appState.staff.forEach(s => {
        optsHTML += `<option value="${s.id}" ${appState.eotmWinnerId === s.id ? 'selected' : ''}>👑 ${s.name} (${s.title || s.role})</option>`;
      });
      selectEotm.innerHTML = optsHTML;
    }

    // Overview Cards
    const elTips = document.getElementById('stat-total-tips');
    if (elTips) elTips.textContent = `${totalTips.toLocaleString('en-US', { minimumFractionDigits: 2 })} €`;

    const ratePerCoin = grandTotalPoints > 0 ? (totalTips / grandTotalPoints).toFixed(2) : '0.00';
    const elRate = document.getElementById('stat-tips-rate');
    if (elRate) elRate.textContent = `${ratePerCoin} € / Coin`;

    const elTotalHours = document.getElementById('stat-total-hours');
    if (elTotalHours) elTotalHours.textContent = `${grandTotalPoints} Coins`;

    const approvedTasks = appState.tasks.filter(t => t.status === 'APPROVED');
    const elCompletedTasks = document.getElementById('stat-completed-tasks');
    if (elCompletedTasks) elCompletedTasks.textContent = approvedTasks.length;

    const elPtsEarned = document.getElementById('stat-points-earned');
    if (elPtsEarned) elPtsEarned.textContent = `${approvedTasks.length} entries approved`;

    const frontCount = appState.staff.filter(s => s.role === 'FRONT').length;
    const kitchenCount = appState.staff.filter(s => s.role === 'KITCHEN').length;
    
    const elStaffCount = document.getElementById('stat-staff-count');
    if (elStaffCount) elStaffCount.textContent = appState.staff.length;

    const elTeamBreakdown = document.getElementById('stat-team-breakdown');
    if (elTeamBreakdown) elTeamBreakdown.textContent = `${frontCount} Front / ${kitchenCount} Kitchen`;

    // Unified Global Ranking
    let filteredList = [...empStats];
    filteredList.sort((a, b) => b.points - a.points);

    // Podium Renderer (Top 3)
    const podiumContainer = document.getElementById('podium-container');
    if (podiumContainer) {
      podiumContainer.innerHTML = '';

      if (filteredList.length >= 2) {
        const top1 = filteredList[0];
        const top2 = filteredList[1];
        const top3 = filteredList[2] || null;

        const createPodiumStep = (emp, rank, stepClass) => {
          if (!emp) return '';
          const isCrownWinner = emp.id === appState.eotmWinnerId;
          const showCrown = (rank === 1) || isCrownWinner;
          return `
            <div class="podium-step ${stepClass}">
              ${showCrown ? '<i data-lucide="crown" class="podium-crown"></i>' : ''}
              <div class="podium-avatar" style="background-color: ${emp.color}">
                ${emp.avatar}
              </div>
              <div class="podium-name">${emp.name} ${isCrownWinner ? '👑' : ''}</div>
              <div class="podium-pts">${emp.points} Coins</div>
              <div class="podium-pillar">${rank}</div>
            </div>
          `;
        };

        podiumContainer.innerHTML = `
          ${createPodiumStep(top2, 2, 'step-2')}
          ${createPodiumStep(top1, 1, 'step-1')}
          ${top3 ? createPodiumStep(top3, 3, 'step-3') : ''}
        `;
      } else {
        podiumContainer.innerHTML = `<p class="text-muted">Add at least 2 team members to unlock the podium!</p>`;
      }
    }

    // Table Header Renderer (Dynamic based on Manager vs Employee)
    const thead = document.getElementById('leaderboard-thead');
    if (thead) {
      thead.innerHTML = `
        <tr>
          <th>Rank</th>
          <th>Employee</th>
          <th>Team & Role</th>
          <th>Coins Earned</th>
          ${isManager ? `<th>Tip Share (%)</th>` : ''}
          <th>Estimated Tip (€)</th>
        </tr>
      `;
    }

    // Table Body Renderer
    const tbody = document.getElementById('leaderboard-tbody');
    if (tbody) {
      tbody.innerHTML = '';

      filteredList.forEach((emp, index) => {
        const isCrownWinner = emp.id === appState.eotmWinnerId;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>#${index + 1}</strong></td>
          <td>
            <div class="staff-info">
              <div class="avatar" style="background-color: ${emp.color}; width: 32px; height: 32px; font-size: 0.85rem;">
                ${emp.avatar}
              </div>
              <div>
                <strong>${emp.name} ${isCrownWinner ? '<span title="Employee of the Month" style="margin-left:0.25rem; font-size:1.15rem;">👑</span>' : ''}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">${emp.title || ''}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge ${emp.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}">
              ${emp.role === 'FRONT' ? 'Front (Floor/Bar)' : 'Kitchen'}
            </span>
          </td>
          <td><strong class="text-gold" style="font-size:1.05rem;">${emp.points} Coins</strong></td>
          ${isManager ? `<td><strong>${emp.tipSharePercent.toFixed(2)}%</strong></td>` : ''}
          <td><strong class="text-green" style="font-size:1.05rem;">${emp.tipAmount.toFixed(2)} € ${isCrownWinner ? '<span style="font-size:0.75rem; color:var(--color-gold);">(incl. 👑 bonus)</span>' : ''}</strong></td>
        `;
        tbody.appendChild(tr);
      });
    }

    if (window.lucide) lucide.createIcons();
  };

  // Roster / Planning Renderer (Vertical Week-by-Week & Role-Based Permissions)
  let selectedWeek = 'ALL';

  const renderPlanning = () => {
    const container = document.getElementById('roster-weekly-container');
    if (!container) return;

    container.innerHTML = '';

    const isManager = appState.activeRole === 'MANAGER';
    const noteEl = document.getElementById('roster-permission-note');
    if (noteEl) {
      if (isManager) {
        noteEl.textContent = "Manager Mode: Click any cell to toggle WORK / OFF.";
        noteEl.className = "text-gold font-weight-bold";
      } else {
        noteEl.textContent = "Employee View (Read-Only). Only Manager can edit schedules.";
        noteEl.className = "text-muted font-weight-bold";
      }
    }

    const monthSchedules = appState.schedules[appState.currentMonth] || {};
    const [year, month] = appState.currentMonth.split('-').map(Number);
    const totalDaysInMonth = getDaysInMonth(appState.currentMonth);

    // August 2026 Monday - Sunday Calendar Weeks Definition
    const weeks = [
      { id: '1', title: 'Week 1: Aug 1 - Aug 2 (Sat - Sun)', start: 1, end: 2 },
      { id: '2', title: 'Week 2: Aug 3 - Aug 9 (Mon - Sun)', start: 3, end: 9 },
      { id: '3', title: 'Week 3: Aug 10 - Aug 16 (Mon - Sun)', start: 10, end: 16 },
      { id: '4', title: 'Week 4: Aug 17 - Aug 23 (Mon - Sun)', start: 17, end: 23 },
      { id: '5', title: 'Week 5: Aug 24 - Aug 30 (Mon - Sun)', start: 24, end: 30 },
      { id: '6', title: 'Week 6: Aug 31 (Mon)', start: 31, end: 31 }
    ];

    const weeksToRender = selectedWeek === 'ALL' 
      ? weeks 
      : weeks.filter(w => w.id === selectedWeek);

    weeksToRender.forEach(w => {
      const card = document.createElement('div');
      card.className = 'weekly-card';

      let cardHTML = `<div class="weekly-card-title"><i data-lucide="calendar"></i> ${w.title}</div>`;
      cardHTML += `<div class="table-responsive"><table class="planning-table"><thead><tr><th class="cell-name">Team Member</th>`;

      for (let d = w.start; d <= w.end; d++) {
        const dayAbbr = getDayOfWeekAbbr(year, month, d);
        cardHTML += `<th><span style="font-size:0.65rem; color:var(--text-muted); display:block; font-weight:600;">${dayAbbr}</span>${d}</th>`;
      }
      cardHTML += `</tr></thead><tbody>`;

      appState.staff.forEach(emp => {
        const empSchedule = monthSchedules[emp.id] || {};

        cardHTML += `<tr><td class="cell-name">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="dot" style="background:${emp.color}"></span>
            <span>${emp.name}</span>
            <span class="badge ${emp.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}" style="font-size:0.65rem; padding:0.1rem 0.4rem;">
              ${emp.role}
            </span>
          </div>
        </td>`;

        for (let d = w.start; d <= w.end; d++) {
          const isWorked = empSchedule[d] !== false;
          cardHTML += `
            <td class="shift-cell ${isWorked ? 'is-work' : 'is-off'} ${!isManager ? 'shift-cell-readonly' : ''}" 
                data-emp="${emp.id}" 
                data-day="${d}" 
                title="${isWorked ? 'Scheduled Shift (WORK)' : 'Day OFF (Rest)'}">
              ${isWorked ? 'WORK' : 'OFF'}
            </td>
          `;
        }

        cardHTML += `</tr>`;
      });

      cardHTML += `</tbody></table></div>`;
      card.innerHTML = cardHTML;
      container.appendChild(card);
    });

    // Attach Cell Click Handler with Role Permission Check
    container.querySelectorAll('.shift-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        if (!isManager) {
          showToast("Read-only view: Only Manager can edit roster schedule.");
          return;
        }

        const empId = e.currentTarget.dataset.emp;
        const day = parseInt(e.currentTarget.dataset.day);

        if (!appState.schedules[appState.currentMonth]) {
          appState.schedules[appState.currentMonth] = {};
        }
        if (!appState.schedules[appState.currentMonth][empId]) {
          appState.schedules[appState.currentMonth][empId] = {};
        }

        const currentVal = appState.schedules[appState.currentMonth][empId][day] !== false;
        appState.schedules[appState.currentMonth][empId][day] = !currentVal;

        saveState();
        showToast("Roster status updated!");
      });
    });

    if (window.lucide) lucide.createIcons();
  };

  // Sub-Tab Switching Handler
  let activeSubtab = 'daily-tasks';

  const initSubtabs = () => {
    document.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));

        const target = e.currentTarget.dataset.subtab;
        activeSubtab = target;

        e.currentTarget.classList.add('active');
        const content = document.getElementById(`subtab-${target}`);
        if (content) content.classList.add('active');

        renderTasks();
      });
    });
  };

  // Manager Task Scheduler Submit Listener
  const initSchedulerForm = () => {
    const form = document.getElementById('form-schedule-task');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = document.getElementById('sched-task-employee').value;
      const title = document.getElementById('sched-task-title').value.trim();
      const category = document.getElementById('sched-task-category').value;
      const points = parseInt(document.getElementById('sched-task-coins').value);
      const recurrence = document.getElementById('sched-task-recurrence') ? document.getElementById('sched-task-recurrence').value : 'DAILY';

      if (!title) return;

      const newTask = {
        id: 'st-' + Date.now(),
        employeeId: empId,
        title: title,
        category: category,
        points: points,
        recurrence: recurrence
      };

      if (!appState.scheduledDailyTasks) appState.scheduledDailyTasks = [];
      appState.scheduledDailyTasks.push(newTask);

      saveState();
      form.reset();
      showToast(`Task nominatively assigned to team member schedule!`);
    });
  };

  // Tasks & Initiatives Renderer (Sub-Tabs & Employee Privacy & Nominative Accountability)
  const renderTasks = () => {
    const isManager = appState.activeRole === 'MANAGER';
    const activeEmp = appState.staff.find(s => s.id === appState.activeRole);

    const catCountEl = document.getElementById('catalogue-task-count');
    if (catCountEl) {
      const count = (appState.masterTaskCatalogue || []).length;
      catCountEl.textContent = `${count} Task${count !== 1 ? 's' : ''} Loaded`;
    }

    // MANAGER VIEW: GLOBAL SCHEDULE GRID TABLE
    const schedTbody = document.getElementById('manager-schedule-tbody');
    if (isManager && schedTbody) {
      schedTbody.innerHTML = '';
      const scheduled = appState.scheduledDailyTasks || [];

      if (scheduled.length === 0) {
        schedTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem;" class="text-muted">No monthly schedule generated yet. Click <strong>"Generate Schedule"</strong> above!</td></tr>`;
      } else {
        scheduled.forEach(task => {
          const emp = appState.staff.find(s => s.id === task.employeeId) || { name: 'Unassigned', avatar: 'UN', color: '#64748b', role: 'FRONT' };
          const tr = document.createElement('tr');

          let periodBadge = `<span class="badge" style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.3);">🕒 Anytime</span>`;
          if (task.period === 'MORNING') periodBadge = `<span class="badge" style="background:rgba(245,158,11,0.15); color:var(--color-gold); border:1px solid rgba(245,158,11,0.3);">🌅 Morning</span>`;
          if (task.period === 'AFTERNOON') periodBadge = `<span class="badge" style="background:rgba(16,185,129,0.15); color:var(--color-green); border:1px solid rgba(16,185,129,0.3);">☀️ Afternoon</span>`;
          if (task.period === 'EVENING') periodBadge = `<span class="badge" style="background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3);">🌙 Evening</span>`;

          const dayNum = task.day || 1;
          const [year, month] = appState.currentMonth.split('-').map(Number);
          const dayAbbr = getDayOfWeekAbbr(year, month, dayNum);

          tr.innerHTML = `
            <td><strong>Aug ${dayNum}</strong> (${dayAbbr})</td>
            <td>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <div class="avatar" style="background-color: ${emp.color}; width:24px; height:24px; font-size:0.7rem;">${emp.avatar}</div>
                <span><strong>${emp.name}</strong></span>
                <span class="badge ${emp.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}" style="font-size:0.65rem; padding:0.1rem 0.35rem;">${emp.role}</span>
              </div>
            </td>
            <td>${periodBadge}</td>
            <td>
              <strong style="color:var(--text-main); display:block;">${task.title}</strong>
              ${task.desc ? `<span class="text-muted" style="font-size:0.8rem;">${task.desc}</span>` : ''}
            </td>
            <td><strong class="text-gold">+${task.points} Coins</strong></td>
          `;
          schedTbody.appendChild(tr);
        });
      }
    }

    // SUB-TAB 1: DAILY TASKS CHECKLIST & SCHEDULER (NOMINATIVE ASSIGNMENT)
    const dailyGrid = document.getElementById('daily-tasks-grid');
    if (dailyGrid) {
      dailyGrid.innerHTML = '';

      let visibleScheduledTasks = [...(appState.scheduledDailyTasks || [])];
      if (!isManager && activeEmp) {
        visibleScheduledTasks = visibleScheduledTasks.filter(t => t.employeeId === activeEmp.id);
      }

      if (visibleScheduledTasks.length === 0) {
        dailyGrid.innerHTML = `<p class="text-muted" style="padding:1.5rem; text-align:center;">No daily shift tasks assigned ${!isManager ? 'specifically to you' : ''} yet. ${isManager ? 'Use the form above to assign nominative tasks!' : ''}</p>`;
      } else {
        visibleScheduledTasks.forEach(task => {
          const emp = appState.staff.find(s => s.id === task.employeeId) || { name: 'Unassigned', avatar: 'UN', color: '#64748b', title: '' };
          const item = document.createElement('div');
          item.className = 'task-item';

          // Check if task completion submission exists for this employee
          const existingSubmission = (appState.tasks || []).find(t => t.employeeId === task.employeeId && t.desc === `Daily Task Completed: ${task.title}`);

          let statusAction = `
            <button class="btn btn-primary btn-sm btn-claim-task" data-id="${task.id}" data-desc="${task.title}" data-pts="${task.points}">
              <i data-lucide="check-circle"></i> Mark Done
            </button>
          `;

          if (existingSubmission) {
            if (existingSubmission.status === 'PENDING') {
              statusAction = `<span class="badge" style="background:rgba(245,158,11,0.15); color:var(--color-gold); border:1px solid rgba(245,158,11,0.3);">⏳ Pending Manager Approval</span>`;
            } else if (existingSubmission.status === 'APPROVED') {
              statusAction = `<span class="badge badge-purple">✔ Approved (+${task.points} Coins)</span>`;
            } else if (existingSubmission.status === 'REJECTED') {
              statusAction = `<span class="badge" style="background:rgba(239,68,68,0.15); color:var(--color-danger); border:1px solid rgba(239,68,68,0.3);">❌ Rejected</span>`;
            }
          }

          let periodBadge = `<span class="badge" style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.3);">🕒 Anytime</span>`;
          if (task.period === 'MORNING') periodBadge = `<span class="badge" style="background:rgba(245,158,11,0.15); color:var(--color-gold); border:1px solid rgba(245,158,11,0.3);">🌅 Morning</span>`;
          if (task.period === 'AFTERNOON') periodBadge = `<span class="badge" style="background:rgba(16,185,129,0.15); color:var(--color-green); border:1px solid rgba(16,185,129,0.3);">☀️ Afternoon</span>`;
          if (task.period === 'EVENING') periodBadge = `<span class="badge" style="background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3);">🌙 Evening</span>`;

          item.innerHTML = `
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
                <strong class="task-user" style="font-size:1.05rem;">${task.title}</strong>
                ${periodBadge}
                ${!isManager ? `<span class="badge badge-gold" style="font-size:0.65rem; padding:0.1rem 0.35rem;">👤 Your Responsibility</span>` : ''}
              </div>
              ${task.desc ? `<p style="margin:0.2rem 0; font-size:0.85rem; color:var(--text-muted);">${task.desc}</p>` : ''}
              <div class="task-desc" style="display:flex; align-items:center; gap:0.5rem; margin-top:0.35rem;">
                <div class="avatar" style="background-color: ${emp.color}; width:22px; height:22px; font-size:0.65rem;">${emp.avatar}</div>
                <span>Nominatively assigned to: <strong>${emp.name}</strong> (${emp.title || emp.role})</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:1rem;">
              <span class="task-pts">+${task.points} Coins</span>
              ${!isManager ? statusAction : `
                <button class="btn btn-danger-outline btn-sm btn-delete-sched" data-id="${task.id}">
                  <i data-lucide="trash-2"></i> Remove
                </button>
              `}
            </div>
          `;
          dailyGrid.appendChild(item);
        });
      }

      // Employee claim task listener
      dailyGrid.querySelectorAll('.btn-claim-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const desc = e.currentTarget.dataset.desc;
          const pts = parseInt(e.currentTarget.dataset.pts);

          const newSubmission = {
            id: 't-' + Date.now(),
            employeeId: appState.activeRole,
            desc: `Daily Task Completed: ${desc}`,
            points: pts,
            status: 'PENDING',
            timestamp: Date.now()
          };

          appState.tasks.push(newSubmission);
          saveState();
          showToast("Task completed and submitted for manager approval!");
        });
      });

      // Manager remove scheduled task listener
      dailyGrid.querySelectorAll('.btn-delete-sched').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          appState.scheduledDailyTasks = appState.scheduledDailyTasks.filter(t => t.id !== id);
          saveState();
          showToast("Scheduled task removed.");
        });
      });
    }

    // SUB-TAB 2: SUBMISSIONS & INITIATIVES (PRIVACY ENFORCED)
    const managerBlock = document.getElementById('manager-tasks-dashboard');
    const empProfileCard = document.getElementById('employee-profile-card');
    const empSubmissionsBlock = document.getElementById('employee-submissions-block');

    if (isManager) {
      if (managerBlock) managerBlock.classList.remove('hidden');
      if (empProfileCard) empProfileCard.classList.add('hidden');
      if (empSubmissionsBlock) empSubmissionsBlock.classList.add('hidden');
    } else if (activeEmp) {
      if (managerBlock) managerBlock.classList.add('hidden');
      if (empProfileCard) empProfileCard.classList.remove('hidden');
      if (empSubmissionsBlock) empSubmissionsBlock.classList.remove('hidden');

      // Populate Employee Profile Card
      const avatarEl = document.getElementById('emp-profile-avatar');
      if (avatarEl) {
        avatarEl.textContent = activeEmp.avatar;
        avatarEl.style.backgroundColor = activeEmp.color;
      }
      const nameEl = document.getElementById('emp-profile-name');
      if (nameEl) nameEl.textContent = activeEmp.name;

      const roleEl = document.getElementById('emp-profile-role');
      if (roleEl) {
        roleEl.textContent = `${activeEmp.role === 'FRONT' ? 'Front (Floor/Bar)' : 'Kitchen'} - ${activeEmp.title}`;
        roleEl.className = `badge ${activeEmp.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}`;
      }

      const empCoins = getEmployeePoints(activeEmp.id);
      const coinsEl = document.getElementById('emp-profile-coins');
      if (coinsEl) coinsEl.textContent = `${empCoins} Coins`;

      const { empStats } = calculateTipDistribution();
      const sorted = [...empStats].sort((a, b) => b.points - a.points);
      const rank = sorted.findIndex(s => s.id === activeEmp.id) + 1;
      
      const rankEl = document.getElementById('emp-profile-rank');
      if (rankEl) rankEl.textContent = `#${rank > 0 ? rank : 1}`;

      // Render STRICTLY PRIVATE Submissions for Logged In Employee ONLY
      const empSubmissionsList = document.getElementById('employee-submissions-list');
      if (empSubmissionsList) {
        empSubmissionsList.innerHTML = '';
        const myEntries = appState.tasks.filter(t => t.employeeId === activeEmp.id).reverse();

        if (myEntries.length === 0) {
          empSubmissionsList.innerHTML = `<p class="text-muted" style="padding:1.5rem; text-align:center;">You haven't submitted any initiatives yet this month.</p>`;
        } else {
          myEntries.forEach(task => {
            const item = document.createElement('div');
            item.className = 'task-item';
            
            let statusBadge = `<span class="badge badge-purple">+${task.points} Coins Approved</span>`;
            if (task.status === 'PENDING') statusBadge = `<span class="badge" style="background:rgba(245,158,11,0.15); color:var(--color-gold); border:1px solid rgba(245,158,11,0.3);">⏳ Pending Approval (+${task.points} Coins)</span>`;
            if (task.status === 'REJECTED') statusBadge = `<span class="badge" style="background:rgba(239,68,68,0.15); color:var(--color-danger); border:1px solid rgba(239,68,68,0.3);">❌ Rejected</span>`;

            item.innerHTML = `
              <div>
                <div class="task-user">${task.desc}</div>
                <div class="task-desc">${new Date(task.timestamp).toLocaleDateString()}</div>
              </div>
              ${statusBadge}
            `;
            empSubmissionsList.appendChild(item);
          });
        }
      }
    }

    // Manager View: Pending Approvals Feed
    const pendingTasks = appState.tasks.filter(t => t.status === 'PENDING');
    const pendingBadge = document.getElementById('pending-badge');
    const pendingBadgeSubtab = document.getElementById('pending-badge-subtab');
    const pendingCountBadge = document.getElementById('pending-count-badge');
    const mobilePendingDot = document.getElementById('mobile-pending-dot');

    if (pendingTasks.length > 0) {
      if (pendingBadge) { pendingBadge.textContent = pendingTasks.length; pendingBadge.classList.remove('hidden'); }
      if (pendingBadgeSubtab) { pendingBadgeSubtab.textContent = pendingTasks.length; pendingBadgeSubtab.classList.remove('hidden'); }
      if (pendingCountBadge) pendingCountBadge.textContent = `${pendingTasks.length} pending`;
      if (mobilePendingDot) mobilePendingDot.classList.remove('hidden');
    } else {
      if (pendingBadge) pendingBadge.classList.add('hidden');
      if (pendingBadgeSubtab) pendingBadgeSubtab.classList.add('hidden');
      if (pendingCountBadge) pendingCountBadge.textContent = `0 pending`;
      if (mobilePendingDot) mobilePendingDot.classList.add('hidden');
    }

    const pendingList = document.getElementById('pending-tasks-list');
    if (pendingList) {
      pendingList.innerHTML = '';
      if (pendingTasks.length === 0) {
        pendingList.innerHTML = `<p class="text-muted" style="padding:1rem; text-align:center;">No pending task requests for manager approval. 👍</p>`;
      } else {
        pendingTasks.forEach(task => {
          const emp = appState.staff.find(s => s.id === task.employeeId) || { name: 'Unknown' };
          const item = document.createElement('div');
          item.className = 'task-item';
          item.innerHTML = `
            <div>
              <div class="task-user">${emp.name} (${emp.title || emp.role})</div>
              <div class="task-desc">${task.desc}</div>
            </div>
            <div style="display:flex; align-items:center; gap:1rem;">
              <span class="task-pts">+${task.points} Coins</span>
              <div class="task-actions">
                <button class="btn btn-success btn-sm btn-approve" data-id="${task.id}"><i data-lucide="check"></i> Approve</button>
                <button class="btn btn-danger-outline btn-sm btn-reject" data-id="${task.id}"><i data-lucide="x"></i> Reject</button>
              </div>
            </div>
          `;
          pendingList.appendChild(item);
        });
      }

      pendingList.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const taskId = e.currentTarget.dataset.id;
          const task = appState.tasks.find(t => t.id === taskId);
          if (task) {
            task.status = 'APPROVED';
            saveState();
            showToast("Task entry approved! Coins awarded.");
          }
        });
      });

      pendingList.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const taskId = e.currentTarget.dataset.id;
          const task = appState.tasks.find(t => t.id === taskId);
          if (task) {
            task.status = 'REJECTED';
            saveState();
            showToast("Task entry rejected.");
          }
        });
      });
    }

    // Manager View: Approved Tasks History
    const historyList = document.getElementById('validated-tasks-list');
    if (historyList) {
      const validatedTasks = appState.tasks.filter(t => t.status === 'APPROVED').reverse();
      historyList.innerHTML = '';

      if (validatedTasks.length === 0) {
        historyList.innerHTML = `<p class="text-muted">No approved tasks yet this month.</p>`;
      } else {
        validatedTasks.slice(0, 8).forEach(task => {
          const emp = appState.staff.find(s => s.id === task.employeeId) || { name: 'Unknown' };
          const item = document.createElement('div');
          item.className = 'task-item';
          item.style.opacity = '0.85';
          item.innerHTML = `
            <div>
              <div class="task-user">${emp.name}</div>
              <div class="task-desc">${task.desc}</div>
            </div>
            <span class="badge badge-purple">+${task.points} Coins awarded</span>
          `;
          historyList.appendChild(item);
        });
      }
    }

    if (window.lucide) lucide.createIcons();
  };

  // Tip Calculator Renderer
  const renderTips = () => {
    const mKey = appState.currentMonth;
    const config = appState.tipsConfig[mKey] || { totalAmount: 2600 };

    const inputPool = document.getElementById('input-total-tips');
    if (inputPool) inputPool.value = config.totalAmount;

    const inputBonus = document.getElementById('input-eotm-bonus');
    if (inputBonus) inputBonus.value = appState.eotmBonusAmount !== undefined ? appState.eotmBonusAmount : 100;

    const { empStats, totalTips, frontPool, kitchenPool } = calculateTipDistribution();

    const elFrontAmt = document.getElementById('summary-front-amount');
    if (elFrontAmt) elFrontAmt.textContent = `${frontPool.toLocaleString('en-US', { minimumFractionDigits: 2 })} €`;

    const elKitchenAmt = document.getElementById('summary-kitchen-amount');
    if (elKitchenAmt) elKitchenAmt.textContent = `${kitchenPool.toLocaleString('en-US', { minimumFractionDigits: 2 })} €`;

    const frontCoins = empStats.filter(e => e.role === 'FRONT').reduce((s, e) => s + e.points, 0);
    const kitchenCoins = empStats.filter(e => e.role === 'KITCHEN').reduce((s, e) => s + e.points, 0);

    const elFrontSub = document.getElementById('summary-front-sub');
    if (elFrontSub) elFrontSub.textContent = `${frontCoins} Coins earned (Front)`;

    const elKitchenSub = document.getElementById('summary-kitchen-sub');
    if (elKitchenSub) elKitchenSub.textContent = `${kitchenCoins} Coins earned (Kitchen)`;

    // Detailed Editable Table
    const tbody = document.getElementById('tips-detail-tbody');
    if (tbody) {
      tbody.innerHTML = '';

      empStats.forEach(emp => {
        const tr = document.createElement('tr');
        const hasOverride = emp.manualPercent !== null;
        const isCrownWinner = emp.id === appState.eotmWinnerId;

        tr.innerHTML = `
          <td>
            <div class="staff-info">
              <div class="avatar" style="background-color: ${emp.color}; width: 32px; height: 32px; font-size: 0.85rem;">
                ${emp.avatar}
              </div>
              <div>
                <strong>${emp.name} ${isCrownWinner ? '👑' : ''}</strong>
              </div>
            </div>
          </td>
          <td>
            <span class="badge ${emp.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}">
              ${emp.role === 'FRONT' ? 'Front' : 'Kitchen'} - ${emp.title}
            </span>
          </td>
          <td><strong class="text-gold">${emp.points} Coins</strong></td>
          <td><span class="text-muted">${emp.baselinePercent.toFixed(2)}%</span></td>
          <td>
            <div style="display:flex; align-items:center; gap:0.25rem;">
              <input type="number" 
                     class="form-control editable-percent-input" 
                     data-emp="${emp.id}" 
                     value="${emp.tipSharePercent.toFixed(2)}" 
                     step="0.5" min="0" max="100" />
              <span>%</span>
              ${hasOverride ? `<span class="badge badge-purple" style="font-size:0.65rem; padding:0.1rem 0.3rem;" title="Manually edited share">Custom</span>` : ''}
            </div>
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:0.25rem;">
              <input type="number" 
                     class="form-control editable-amount-input" 
                     data-emp="${emp.id}" 
                     value="${emp.tipAmount.toFixed(2)}" 
                     step="5" min="0" />
              <strong class="text-green">€</strong>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Percentage Input Listener
      tbody.querySelectorAll('.editable-percent-input').forEach(input => {
        input.addEventListener('change', (e) => {
          const empId = e.currentTarget.dataset.emp;
          const newPct = parseFloat(e.currentTarget.value) || 0;

          if (!appState.manualTipOverrides) appState.manualTipOverrides = {};
          appState.manualTipOverrides[empId] = { percent: newPct };

          saveState();
          showToast("Custom tip share percentage updated!");
        });
      });

      // Amount Input Listener
      tbody.querySelectorAll('.editable-amount-input').forEach(input => {
        input.addEventListener('change', (e) => {
          const empId = e.currentTarget.dataset.emp;
          const newAmt = parseFloat(e.currentTarget.value) || 0;
          const totalPool = parseFloat(appState.tipsConfig[appState.currentMonth]?.totalAmount) || 2600;

          const newPct = totalPool > 0 ? parseFloat(((newAmt / totalPool) * 100).toFixed(2)) : 0;

          if (!appState.manualTipOverrides) appState.manualTipOverrides = {};
          appState.manualTipOverrides[empId] = { percent: newPct };

          saveState();
          showToast("Custom payable tip amount updated!");
        });
      });
    }
  };

  // Staff Management Renderer
  const renderStaff = () => {
    const grid = document.getElementById('staff-list-grid');
    if (!grid) return;
    grid.innerHTML = '';

    appState.staff.forEach(emp => {
      const card = document.createElement('div');
      card.className = 'staff-card';
      card.innerHTML = `
        <div class="staff-info">
          <div class="avatar" style="background-color: ${emp.color}">${emp.avatar}</div>
          <div>
            <strong>${emp.name}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">${emp.title || ''}</div>
            <div>
              <span class="badge ${emp.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}" style="margin-top:0.25rem;">
                ${emp.role === 'FRONT' ? 'Front (Floor/Bar)' : 'Kitchen'}
              </span>
            </div>
          </div>
        </div>
        <button class="btn-icon btn-delete-staff" data-id="${emp.id}" title="Remove" style="color:var(--color-danger)">
          <i data-lucide="trash-2"></i>
        </button>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll('.btn-delete-staff').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm("Remove this team member from the roster?")) {
          appState.staff = appState.staff.filter(s => s.id !== id);
          saveState();
          showToast("Team member removed.");
        }
      });
    });

    if (window.lucide) lucide.createIcons();
  };

  // SOP (Standard Operating Procedures) Renderer
  let activeSopFilter = 'ALL';

  const renderSOP = () => {
    // Filter out any legacy mock PDF documents
    appState.sopDocuments = (appState.sopDocuments || []).filter(d => !d.id.startsWith('pdf-'));

    const isManager = appState.activeRole === 'MANAGER';

    // Render Linked PDF Documents Grid
    const pdfContainer = document.getElementById('sop-pdf-library');
    if (pdfContainer) {
      pdfContainer.innerHTML = '';
      if (appState.sopDocuments.length === 0) {
        pdfContainer.innerHTML = `
          <div style="grid-column:1/-1; background:var(--bg-input); padding:1.5rem; border-radius:var(--radius-md); border:1px dashed var(--border-color); text-align:center;">
            <i data-lucide="file-up" class="text-gold" style="width:32px; height:32px; margin-bottom:0.5rem;"></i>
            <p class="text-muted" style="margin:0; font-size:0.88rem;">No PDF SOP documents linked yet. Click "Link / Upload PDF SOP Documents" above to populate your SOP reference library.</p>
          </div>
        `;
      } else {
        appState.sopDocuments.forEach(doc => {
          const pdfCard = document.createElement('div');
          pdfCard.className = 'section-card';
          pdfCard.style.padding = '1rem';
          pdfCard.style.display = 'flex';
          pdfCard.style.alignItems = 'center';
          pdfCard.style.justifyContent = 'space-between';
          pdfCard.style.gap = '0.75rem';
          pdfCard.style.background = 'var(--bg-input)';
          pdfCard.style.border = '1px solid var(--border-color)';
          pdfCard.style.borderRadius = 'var(--radius-md)';

          const badgeClass = doc.category === 'FRONT' ? 'badge-front' : (doc.category === 'KITCHEN' ? 'badge-kitchen' : 'badge-gold');

          pdfCard.innerHTML = `
            <div style="display:flex; align-items:center; gap:0.75rem; overflow:hidden;">
              <div style="width:42px; height:42px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; color:var(--color-danger); flex-shrink:0;">
                <i data-lucide="file-text" style="width:24px; height:24px;"></i>
              </div>
              <div style="overflow:hidden;">
                <strong style="display:block; font-size:0.85rem; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; color:var(--text-main);">${doc.title}</strong>
                <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.2rem;">
                  <span class="badge ${badgeClass}" style="font-size:0.6rem; padding:0.05rem 0.35rem;">${doc.category}</span>
                  <span style="font-size:0.7rem; color:var(--text-muted);">${doc.size || 'PDF Document'}</span>
                </div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.35rem; flex-shrink:0;">
              <a href="${doc.url || '#'}" download="${doc.title}" target="_blank" class="btn btn-outline btn-sm" style="padding:0.3rem 0.6rem; font-size:0.75rem;" title="View / Download PDF">
                <i data-lucide="download"></i> View
              </a>
              ${isManager ? `
                <button class="btn-icon btn-delete-pdf" data-id="${doc.id}" style="color:var(--color-danger); padding:0.35rem;" title="Unlink PDF">
                  <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
                </button>
              ` : ''}
            </div>
          `;
          pdfContainer.appendChild(pdfCard);
        });

        pdfContainer.querySelectorAll('.btn-delete-pdf').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            if (confirm("Remove this PDF SOP document link?")) {
              appState.sopDocuments = appState.sopDocuments.filter(d => d.id !== id);
              saveState();
              showToast("PDF document unlinked.");
            }
          });
        });
      }
    }

    // Render Master Task Procedures & Instructions
    const tasksContainer = document.getElementById('sop-tasks-list');
    if (tasksContainer) {
      tasksContainer.innerHTML = '';
      const catalogue = (appState.masterTaskCatalogue || []).filter(t => t.sopDesc && t.sopDesc.trim());
      
      const filtered = catalogue.filter(t => {
        if (activeSopFilter === 'ALL') return true;
        return t.scope === activeSopFilter;
      });

      if (filtered.length === 0) {
        tasksContainer.innerHTML = `
          <div style="background:var(--bg-input); padding:1.5rem; border-radius:var(--radius-md); border:1px dashed var(--border-color); text-align:center;">
            <i data-lucide="list-checks" class="text-gold" style="width:32px; height:32px; margin-bottom:0.5rem;"></i>
            <p class="text-muted" style="margin:0; font-size:0.88rem;">No written task SOP procedures added yet. Import your task file or add procedures to populate this section.</p>
          </div>
        `;
      } else {
        filtered.forEach((task, index) => {
          const card = document.createElement('div');
          card.className = 'task-card';
          card.style.borderLeft = task.scope === 'FRONT' ? '4px solid var(--color-primary)' : (task.scope === 'KITCHEN' ? '4px solid var(--color-danger)' : '4px solid var(--color-gold)');
          
          card.innerHTML = `
            <div class="task-main-info" style="width:100%;">
              <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.4rem;">
                <div style="display:flex; align-items:center; gap:0.4rem;">
                  <span class="badge ${task.scope === 'FRONT' ? 'badge-front' : (task.scope === 'KITCHEN' ? 'badge-kitchen' : 'badge-gold')}">
                    ${task.scope}
                  </span>
                  <span class="badge" style="background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-muted); font-size:0.65rem;">
                    ⏰ ${task.period || 'ANYTIME'}
                  </span>
                  <span class="badge" style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); color:var(--color-gold); font-size:0.65rem;">
                    🔁 ${task.recurrence || 'DAILY'}
                  </span>
                </div>
                <strong class="text-gold" style="font-size:0.95rem;">+${task.points} Coins</strong>
              </div>
              <h4 style="margin:0 0 0.4rem 0; font-size:1.05rem; font-weight:700; color:var(--text-main);">
                SOP #${index + 1}: ${task.title}
              </h4>
              <p style="margin:0; font-size:0.88rem; color:var(--text-muted); line-height:1.5; background:var(--bg-input); padding:0.65rem 0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
                <strong style="color:var(--text-main); display:block; margin-bottom:0.25rem;">📋 Standard Operating Procedure / Detailed Instructions:</strong>
                ${task.sopDesc}
              </p>
            </div>
          `;
          tasksContainer.appendChild(card);
        });
      }
    }

    if (window.lucide) lucide.createIcons();
  };

  const renderAll = () => {
    applyTheme();

    // Role-Based Navigation & Visibility Adapter
    const isManager = appState.activeRole === 'MANAGER';
    const roleSelect = document.getElementById('active-role-select');
    if (roleSelect) roleSelect.value = appState.activeRole;

    document.querySelectorAll('[data-manager-only="true"], .manager-only-block').forEach(el => {
      if (isManager) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    document.querySelectorAll('[data-employee-only="true"], .employee-only-card').forEach(el => {
      if (!isManager) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Auto-redirect if employee is trying to view a manager-only tab
    const activeTabBtn = document.querySelector('.nav-btn.active, .bottom-nav-btn.active');
    if (!isManager && activeTabBtn && activeTabBtn.dataset.managerOnly === "true") {
      switchTab('dashboard');
      return;
    }

    ensureMonthSchedule(appState.currentMonth);
    renderHeaderLiveDate();
    renderMonthSelector();
    renderDashboard();
    renderPlanning();
    renderTasks();
    renderOpeningClosingStatus();
    renderSOP();
    if (isManager) {
      renderTips();
      renderStaff();
    }
  };

  // ==========================================
  // 5. EVENT HANDLERS & NAVIGATION
  // ==========================================

  // Account / Role Switcher Listener
  const roleSelect = document.getElementById('active-role-select');
  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      appState.activeRole = e.target.value;
      saveState();
      
      const roleName = e.target.options[e.target.selectedIndex].text;
      showToast(`Switched active account to: ${roleName}`);
    });
  }

  // Employee of the Month Selection Listener (Manager Only Dropdown)
  const selectEotm = document.getElementById('select-eotm-winner');
  if (selectEotm) {
    selectEotm.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      appState.eotmWinnerId = selectedId || null;

      if (selectedId) {
        const emp = appState.staff.find(s => s.id === selectedId);
        showToast(`👑 ${emp ? emp.name : 'Team member'} crowned as Employee of the Month! Bonus applied.`);
        launchConfetti();
      }

      saveState();
    });
  }

  // Automated Monthly Smart Fair Rotation Engine (31 Days)
  const generateMonthlyFairRotation = () => {
    const catalogue = appState.masterTaskCatalogue || [];
    if (catalogue.length === 0) {
      showToast("Master task catalogue is empty. Add tasks or import a catalogue first!");
      return;
    }

    const monthKey = appState.currentMonth;
    const totalDays = getDaysInMonth(monthKey);
    const monthSchedules = appState.schedules[monthKey] || {};

    const newScheduledTasks = [];

    for (let day = 1; day <= totalDays; day++) {
      // Find staff scheduled to WORK on this day
      const scheduledStaff = appState.staff.filter(emp => {
        const empDays = monthSchedules[emp.id] || {};
        return empDays[day] !== false; // WORK day
      });

      const frontStaff = scheduledStaff.filter(s => s.role === 'FRONT');
      const kitchenStaff = scheduledStaff.filter(s => s.role === 'KITCHEN');

      const frontTasks = catalogue.filter(t => t.scope === 'FRONT' || t.scope === 'EVERYONE');
      const kitchenTasks = catalogue.filter(t => t.scope === 'KITCHEN' || t.scope === 'EVERYONE');

      // Rotate Front tasks nominatively among scheduled Front staff
      if (frontStaff.length > 0 && frontTasks.length > 0) {
        frontStaff.forEach((emp, index) => {
          const task = frontTasks[(day + index) % frontTasks.length];
          newScheduledTasks.push({
            id: `st-${monthKey}-${day}-${emp.id}-f`,
            employeeId: emp.id,
            day: day,
            title: task.title,
            category: task.scope,
            period: task.period || 'ANYTIME',
            points: task.points,
            desc: task.desc || ''
          });
        });
      }

      // Rotate Kitchen tasks nominatively among scheduled Kitchen staff
      if (kitchenStaff.length > 0 && kitchenTasks.length > 0) {
        kitchenStaff.forEach((emp, index) => {
          const task = kitchenTasks[(day + index) % kitchenTasks.length];
          newScheduledTasks.push({
            id: `st-${monthKey}-${day}-${emp.id}-k`,
            employeeId: emp.id,
            day: day,
            title: task.title,
            category: task.scope,
            period: task.period || 'ANYTIME',
            points: task.points,
            desc: task.desc || ''
          });
        });
      }

      // Assign dedicated Cleaner tasks to Cleaner staff every single day (Roy)
      const cleanerStaff = scheduledStaff.filter(s => s.role === 'CLEANER' || (s.title && s.title.toLowerCase() === 'cleaner'));
      const cleanerTasks = catalogue.filter(t => t.scope === 'CLEANER');

      if (cleanerStaff.length > 0 && cleanerTasks.length > 0) {
        cleanerStaff.forEach((emp) => {
          cleanerTasks.forEach((task, tIdx) => {
            newScheduledTasks.push({
              id: `st-${monthKey}-${day}-${emp.id}-c-${tIdx}`,
              employeeId: emp.id,
              day: day,
              title: task.title,
              category: 'CLEANER',
              period: task.period || 'ANYTIME',
              points: task.points,
              desc: task.desc || ''
            });
          });
        });
      }
    }

    appState.scheduledDailyTasks = newScheduledTasks;
    saveState();
    showToast(`✨ Generated 31-day automated monthly fair rotation across team!`);
  };

  // Google Sheet Live Sync URL & Parser
  const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1zjcbkAkIv2-g1629Eax2S1SO_5uGTxKghJSsvSjcfx0/export?format=csv';

  const parseCSVTasks = (csvText) => {
    if (!csvText || !csvText.trim()) return [];
    const lines = csvText.split(/\r?\n/);
    const imported = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = trimmed.split(',');
      const cleanParts = parts.map(p => p.trim().replace(/^"|"$/g, ''));

      // Find first non-empty column
      const firstCol = cleanParts.find(p => p.length > 0) || '';
      if (!firstCol || firstCol.toLowerCase() === 'task name' || firstCol.toLowerCase() === 'dayly tasks') return;

      let title = firstCol;
      let scope = cleanParts[2] ? cleanParts[2].toUpperCase() : '';
      let period = cleanParts[3] ? cleanParts[3].toUpperCase() : '';
      let recurrence = cleanParts[4] ? cleanParts[4].toUpperCase() : 'DAILY';
      let points = parseInt(cleanParts[5]) || 10;
      let desc = cleanParts[1] && cleanParts[1] !== title ? cleanParts[1] : `Standard operational task: ${title}`;

      // Smart Scope Auto-Detection if unassigned
      if (!scope || !['FRONT', 'KITCHEN', 'EVERYONE', 'CLEANER'].includes(scope)) {
        const lower = title.toLowerCase();
        if (lower.includes('thrash') || lower.includes('trash') || lower.includes('karton') || lower.includes('basement') || lower.includes('deliveries') || lower.includes('meat') || lower.includes('groceries') || lower.includes('fridge')) {
          scope = 'KITCHEN';
        } else if (lower.includes('dine-in') || lower.includes('carpet') || lower.includes('wall') || lower.includes('door') || lower.includes('wickelraum')) {
          scope = 'FRONT';
        } else if (lower.includes('cleaner') || lower.includes('mop') || lower.includes('sweep')) {
          scope = 'CLEANER';
        } else {
          scope = 'EVERYONE';
        }
      }

      if (!period || !['MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME'].includes(period)) {
        period = 'ANYTIME';
      }

      imported.push({
        id: 'cat-gs-' + index + '-' + Date.now(),
        title: title,
        scope: scope,
        period: period,
        points: points,
        recurrence: recurrence,
        desc: desc
      });
    });

    return imported;
  };

  const syncGoogleSheetTasks = async (showNotification = true) => {
    const btnSync = document.getElementById('btn-sync-google-sheet');
    if (btnSync) {
      btnSync.disabled = true;
      btnSync.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Syncing Google Sheet...`;
    }

    try {
      const response = await fetch(GOOGLE_SHEET_CSV_URL);
      if (!response.ok) throw new Error("HTTP " + response.status);
      const csvText = await response.text();
      
      const parsed = parseCSVTasks(csvText);
      if (parsed.length > 0) {
        appState.masterTaskCatalogue = parsed;
        saveState();
        renderAll();
        if (showNotification) {
          showToast(`⚡ Live Google Sheet synchronized! ${parsed.length} tasks loaded.`);
        }
      }
    } catch (err) {
      console.error("Google Sheet Sync Error:", err);
      if (showNotification) {
        showToast("Error syncing Google Sheet. Check CORS or link permissions.");
      }
    } finally {
      if (btnSync) {
        btnSync.disabled = false;
        btnSync.innerHTML = `<i data-lucide="refresh-cw"></i> Sync Google Sheets (Live Link)`;
      }
      if (window.lucide) lucide.createIcons();
    }
  };

  // Live Google Sheet Sync Listener
  const btnSyncSheet = document.getElementById('btn-sync-google-sheet');
  if (btnSyncSheet) {
    btnSyncSheet.addEventListener('click', () => syncGoogleSheetTasks(true));
  }

  // Generate Monthly Schedule Button Listener
  const btnMonthlySchedule = document.getElementById('btn-generate-monthly-schedule');
  if (btnMonthlySchedule) {
    btnMonthlySchedule.addEventListener('click', generateMonthlyFairRotation);
  }

  // Update Tasks File Import Listener (Excel / CSV / JSON)
  const inputUpdateTasks = document.getElementById('input-update-tasks-file');
  if (inputUpdateTasks) {
    inputUpdateTasks.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const content = evt.target.result;
          let imported = [];

          if (file.name.endsWith('.json')) {
            imported = JSON.parse(content);
          } else {
            // Simple CSV/Excel export parser
            const lines = content.split('\n');
            lines.forEach((line, i) => {
              if (i === 0 || !line.trim()) return; // skip header
              const [title, scope, period, points, recurrence, desc] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
              if (title) {
                imported.push({
                  id: 'cat-imp-' + Date.now() + '-' + i,
                  title,
                  scope: scope ? scope.toUpperCase() : 'EVERYONE',
                  period: period ? period.toUpperCase() : 'ANYTIME',
                  points: parseInt(points) || 10,
                  recurrence: recurrence ? recurrence.toUpperCase() : 'DAILY',
                  desc: desc || ''
                });
              }
            });
          }

          if (Array.isArray(imported) && imported.length > 0) {
            appState.masterTaskCatalogue = imported; // Refresh master catalogue with imported file tasks
            saveState();
            showToast(`✅ Master Task Catalogue updated with ${imported.length} tasks from file!`);
          } else {
            alert("Could not find valid task entries in the imported file.");
          }
        } catch (err) {
          console.error("Task file import error:", err);
          alert("Error parsing task file format.");
        }
      };
      reader.readAsText(file);
    });
  }

  const switchTab = (tabId) => {
    const isManager = appState.activeRole === 'MANAGER';
    // Prevent employee from navigating to restricted tabs
    if (!isManager && (tabId === 'tips' || tabId === 'staff' || tabId === 'deploy' || tabId === 'approvals')) {
      showToast("Access restricted: Manager account required for this section.");
      tabId = 'dashboard';
    }

    document.querySelectorAll('.nav-btn, .bottom-nav-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      if (content.id === `tab-${tabId}`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });

    if (tabId === 'dashboard') renderDashboard();
    if (tabId === 'planning') renderPlanning();
    if (tabId === 'tasks') renderTasks();
    if (tabId === 'sop') renderSOP();
    if (tabId === 'approvals' && isManager) renderTasks();
    if (tabId === 'tips' && isManager) renderTips();
    if (tabId === 'staff' && isManager) renderStaff();
  };

  // SOP Category Filter Listener
  document.querySelectorAll('#sop-category-filter .pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#sop-category-filter .pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeSopFilter = e.target.dataset.sopFilter || 'ALL';
      renderSOP();
    });
  });

  // PDF SOP Documents Upload Listener
  const inputSopPdf = document.getElementById('input-sop-pdf-upload');
  if (inputSopPdf) {
    inputSopPdf.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (!files || files.length === 0) return;

      if (!appState.sopDocuments) appState.sopDocuments = [];

      files.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        const sizeFormatted = file.size > 1048576 
          ? (file.size / 1048576).toFixed(1) + ' MB' 
          : Math.round(file.size / 1024) + ' KB';

        appState.sopDocuments.unshift({
          id: 'pdf-upload-' + Date.now() + '-' + index,
          title: file.name,
          category: 'EVERYONE',
          url: url,
          size: sizeFormatted,
          date: new Date().toISOString().split('T')[0]
        });
      });

      saveState();
      renderSOP();
      showToast(`${files.length} PDF SOP document(s) uploaded successfully!`);
    });
  }

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Opening & Closing Shift Process Validation Handler
  const renderOpeningClosingStatus = () => {
    const isManager = appState.activeRole === 'MANAGER';
    if (isManager) return;

    const currentEmpId = appState.activeRole;
    const emp = appState.staff.find(s => s.id === currentEmpId);
    if (!emp) return;

    // Check existing opening submission for today
    const openingTask = appState.tasks.find(t => t.employeeId === currentEmpId && t.desc.includes('[Opening Shift Process]'));
    const badgeOpening = document.getElementById('badge-status-opening');
    const btnOpening = document.getElementById('btn-validate-opening');

    if (badgeOpening && btnOpening) {
      if (!openingTask) {
        badgeOpening.textContent = 'Ready';
        badgeOpening.className = 'badge badge-gold';
        btnOpening.disabled = false;
        btnOpening.innerHTML = `<i data-lucide="check-circle"></i> Validate Opening Shift`;
      } else if (openingTask.status === 'PENDING') {
        badgeOpening.textContent = '⏳ Pending Approval';
        badgeOpening.className = 'badge badge-front';
        btnOpening.disabled = true;
        btnOpening.innerHTML = `<i data-lucide="clock"></i> Pending Manager Approval`;
      } else if (openingTask.status === 'APPROVED') {
        badgeOpening.textContent = '✅ Approved (+30 Coins)';
        badgeOpening.className = 'badge badge-kitchen';
        btnOpening.disabled = true;
        btnOpening.innerHTML = `<i data-lucide="check-check"></i> Opening Completed`;
      }
    }

    // Check existing closing submission for today
    const closingTask = appState.tasks.find(t => t.employeeId === currentEmpId && t.desc.includes('[Closing Shift Process]'));
    const badgeClosing = document.getElementById('badge-status-closing');
    const btnClosing = document.getElementById('btn-validate-closing');

    if (badgeClosing && btnClosing) {
      if (!closingTask) {
        badgeClosing.textContent = 'Ready';
        badgeClosing.className = 'badge badge-gold';
        btnClosing.disabled = false;
        btnClosing.innerHTML = `<i data-lucide="check-circle"></i> Validate Closing Shift`;
      } else if (closingTask.status === 'PENDING') {
        badgeClosing.textContent = '⏳ Pending Approval';
        badgeClosing.className = 'badge badge-front';
        btnClosing.disabled = true;
        btnClosing.innerHTML = `<i data-lucide="clock"></i> Pending Manager Approval`;
      } else if (closingTask.status === 'APPROVED') {
        badgeClosing.textContent = '✅ Approved (+30 Coins)';
        badgeClosing.className = 'badge badge-kitchen';
        btnClosing.disabled = true;
        btnClosing.innerHTML = `<i data-lucide="check-check"></i> Closing Completed`;
      }
    }

    if (window.lucide) lucide.createIcons();
  };

  // Validate Opening Shift Listener
  const btnOpening = document.getElementById('btn-validate-opening');
  if (btnOpening) {
    btnOpening.addEventListener('click', () => {
      const currentEmpId = appState.activeRole;
      const emp = appState.staff.find(s => s.id === currentEmpId);
      if (!emp) {
        showToast("Please select an active employee account.");
        return;
      }

      appState.tasks.unshift({
        id: 'shift-open-' + Date.now(),
        employeeId: currentEmpId,
        desc: `[Opening Shift Process] Keyhandover, lights & morning line setup completed by ${emp.name}`,
        points: 30,
        status: 'PENDING',
        timestamp: Date.now()
      });

      saveState();
      renderAll();
      showToast(`Opening shift process submitted for Manager approval (+30 Coins pending)!`);
    });
  }

  // Validate Closing Shift Listener
  const btnClosing = document.getElementById('btn-validate-closing');
  if (btnClosing) {
    btnClosing.addEventListener('click', () => {
      const currentEmpId = appState.activeRole;
      const emp = appState.staff.find(s => s.id === currentEmpId);
      if (!emp) {
        showToast("Please select an active employee account.");
        return;
      }

      appState.tasks.unshift({
        id: 'shift-close-' + Date.now(),
        employeeId: currentEmpId,
        desc: `[Closing Shift Process] POS register closure, sanitization & alarm lockup completed by ${emp.name}`,
        points: 30,
        status: 'PENDING',
        timestamp: Date.now()
      });

      saveState();
      renderAll();
      showToast(`Closing shift process submitted for Manager approval (+30 Coins pending)!`);
    });
  }

  const btnTheme = document.getElementById('btn-theme-toggle');
  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
      saveState();
    });
  }

  const selectMonth = document.getElementById('current-month-select');
  if (selectMonth) {
    selectMonth.addEventListener('change', (e) => {
      appState.currentMonth = e.target.value;
      ensureMonthSchedule(appState.currentMonth);
      saveState();
      showToast(`Month switched to ${e.target.options[e.target.selectedIndex].text}`);
    });
  }

  // Submit Bonus Initiative Form Listener
  const formBonus = document.getElementById('form-bonus-task');
  if (formBonus) {
    formBonus.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = document.getElementById('task-bonus-employee').value;
      const desc = document.getElementById('task-bonus-desc').value.trim();
      const pts = parseInt(document.getElementById('task-bonus-pts').value);

      if (!desc) return;

      appState.tasks.push({
        id: 'task-' + Date.now(),
        employeeId: empId,
        desc: `Initiative: ${desc}`,
        points: pts,
        status: 'PENDING',
        timestamp: Date.now()
      });

      document.getElementById('task-bonus-desc').value = '';
      saveState();
      showToast("Initiative submitted! Pending manager approval.");
    });
  }

  // Save Tip Pool Amount Listener
  const btnSaveTips = document.getElementById('btn-save-tips');
  if (btnSaveTips) {
    btnSaveTips.addEventListener('click', () => {
      const totalAmount = parseFloat(document.getElementById('input-total-tips').value) || 0;
      appState.tipsConfig[appState.currentMonth] = { totalAmount };
      saveState();
      showToast("Tip pool amount saved and shares recalculated!");
    });
  }

  const btnPrintTips = document.getElementById('btn-print-tips');
  if (btnPrintTips) {
    btnPrintTips.addEventListener('click', () => {
      window.print();
    });
  }

  // Add Staff Member Listener
  const formAddStaff = document.getElementById('form-add-staff');
  if (formAddStaff) {
    formAddStaff.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('staff-name').value.trim();
      const role = document.getElementById('staff-role').value;
      const title = document.getElementById('staff-title').value.trim() || role;
      const color = document.getElementById('staff-color').value;

      if (!name) return;

      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

      appState.staff.push({
        id: 'emp-' + Date.now(),
        name,
        role,
        title,
        color,
        avatar: initials || 'EX'
      });

      document.getElementById('staff-name').value = '';
      document.getElementById('staff-title').value = '';
      saveState();
      showToast(`New team member ${name} added!`);
    });
  }

  // Export JSON Backup
  const btnExport = document.getElementById('btn-export-data');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `tipbitte_backup_${appState.currentMonth}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("JSON backup file downloaded!");
    });
  }

  // Import JSON Backup
  const inputImport = document.getElementById('input-import-data');
  if (inputImport) {
    inputImport.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedState = JSON.parse(event.target.result);
          if (importedState.staff && Array.isArray(importedState.staff)) {
            appState = importedState;
            saveState();
            showToast("Data backup successfully imported!");
          } else {
            alert("Invalid backup file format.");
          }
        } catch (err) {
          alert("Error reading JSON backup file.");
        }
      };
      reader.readAsText(file);
    });
  }

  const btnLoadDemo = document.getElementById('btn-load-demo');
  if (btnLoadDemo) {
    btnLoadDemo.addEventListener('click', () => {
      if (confirm("Reset application with default restaurant demo data?")) {
        initDefaultState();
        saveState();
        showToast("Demo data reloaded!");
      }
    });
  }

  const btnResetMonth = document.getElementById('btn-reset-month');
  if (btnResetMonth) {
    btnResetMonth.addEventListener('click', () => {
      if (confirm("Warning: This will reset tasks and roster schedules for the current month. Proceed?")) {
        delete appState.schedules[appState.currentMonth];
        delete appState.tipsConfig[appState.currentMonth];
        appState.tasks = [];
        saveState();
        showToast("Current month data reset.");
      }
    });
  }

  // Week Selector Listener
  document.querySelectorAll('.week-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.week-filter').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      selectedWeek = e.currentTarget.dataset.week;
      renderPlanning();
    });
  });

  // ==========================================
  // 6. WINNER MODAL & CONFETTI
  // ==========================================

  const triggerWinnerModal = () => {
    const { empStats } = calculateTipDistribution();
    const sorted = [...empStats].sort((a, b) => b.points - a.points);
    const winner = sorted[0];

    if (!winner) {
      alert("No team member available to crown as winner.");
      return;
    }

    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('winner-team-badge').textContent = winner.role === 'FRONT' ? 'Front Team (Floor/Bar)' : 'Kitchen Team';
    document.getElementById('winner-team-badge').className = `badge ${winner.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}`;

    document.getElementById('winner-points').textContent = `${winner.points} Coins`;
    document.getElementById('winner-days').textContent = `${winner.workedDays} days`;
    document.getElementById('winner-tips').textContent = `${winner.tipAmount.toFixed(2)} €`;

    const modal = document.getElementById('modal-winner');
    modal.classList.remove('hidden');

    launchConfetti();
  };

  const launchConfetti = () => {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  const btnRevealWinner = document.getElementById('btn-reveal-winner');
  if (btnRevealWinner) btnRevealWinner.addEventListener('click', triggerWinnerModal);

  const btnCelebrateAgain = document.getElementById('btn-celebrate-again');
  if (btnCelebrateAgain) btnCelebrateAgain.addEventListener('click', launchConfetti);

  const btnCloseWinner = document.getElementById('btn-close-winner');
  if (btnCloseWinner) {
    btnCloseWinner.addEventListener('click', () => {
      document.getElementById('modal-winner').classList.add('hidden');
    });
  }

  const showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="info"></i> <span>${message}</span>`;
    container.appendChild(toast);

    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // Reset Tip Overrides Listener
  const btnResetTips = document.getElementById('btn-reset-tip-overrides');
  if (btnResetTips) {
    btnResetTips.addEventListener('click', () => {
      appState.manualTipOverrides = {};
      saveState();
      showToast("Reset all tip shares to clean Coin proportions!");
    });
  }

  // App Initialization
  loadState();
  initSubtabs();
  initSchedulerForm();
  isInitialized = true;
  renderAll();

});
