/**
 * TipBitte - Core Application Logic (English Version with Coins)
 * Meritocratic Tip Sharing & Team Gamification App
 */

document.addEventListener('DOMContentLoaded', () => {

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('PWA ServiceWorker registered successfully:', reg.scope))
        .catch(err => console.log('ServiceWorker registration failed:', err));
    });
  }

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
    // General Daily Tasks
    { id: 'cat-gs-1', title: 'Put thrash out', scope: 'EVERYONE', period: 'AFTERNOON', points: 5, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-2', title: 'Clean fridges', scope: 'EVERYONE', period: 'AFTERNOON', points: 10, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-3', title: 'Broom dine-in area', scope: 'FRONT', period: 'AFTERNOON', points: 5, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-4', title: 'Mop dine-in area', scope: 'FRONT', period: 'AFTERNOON', points: 10, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-5', title: 'vaccum red carpet', scope: 'FRONT', period: 'ANYTIME', points: 10, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-6', title: 'Clean walls', scope: 'EVERYONE', period: 'ANYTIME', points: 20, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-7', title: 'Clean doors', scope: 'EVERYONE', period: 'ANYTIME', points: 20, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-8', title: 'Clear wickelraum', scope: 'EVERYONE', period: 'ANYTIME', points: 10, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-9', title: 'Clear empty kartons in personnal room', scope: 'EVERYONE', period: 'ANYTIME', points: 5, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-10', title: "If something missing, put in what's missing group", scope: 'EVERYONE', period: 'ANYTIME', points: 10, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-11', title: 'Communicate on deliveries', scope: 'FRONT', period: 'ANYTIME', points: 5, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-12', title: 'Give back red meat crates', scope: 'EVERYONE', period: 'ANYTIME', points: 10, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-13', title: 'Put groceries in basement', scope: 'EVERYONE', period: 'ANYTIME', points: 15, recurrence: 'DAILY', desc: 'Daily tasks' },
    { id: 'cat-gs-14', title: 'Sort the fridges and freezer', scope: 'KITCHEN', period: 'AFTERNOON', points: 15, recurrence: 'DAILY', desc: 'Daily tasks' },

    // Opening Procedures (Front & Kitchen)
    { id: 'cat-gs-15', title: 'Check toilets cleaness', scope: 'FRONT', period: 'MORNING', points: 25, recurrence: 'DAILY', desc: 'Opening procedure' },
    { id: 'cat-gs-16', title: 'Put chairs on the ground', scope: 'FRONT', period: 'MORNING', points: 25, recurrence: 'DAILY', desc: 'Opening procedure' },
    { id: 'cat-gs-17', title: 'Open curtains', scope: 'FRONT', period: 'MORNING', points: 25, recurrence: 'DAILY', desc: 'Opening procedure' },
    { id: 'cat-gs-18', title: 'Open cashbox and tablets', scope: 'FRONT', period: 'MORNING', points: 25, recurrence: 'DAILY', desc: 'Opening procedure' },
    { id: 'cat-gs-19', title: 'Prepare Raitha / Salan', scope: 'FRONT', period: 'MORNING', points: 25, recurrence: 'DAILY', desc: 'Opening procedure' },
    { id: 'cat-gs-20', title: 'Prepare plates', scope: 'FRONT', period: 'MORNING', points: 25, recurrence: 'DAILY', desc: 'Opening procedure' },
    { id: 'cat-gs-21', title: 'Prepare cuttelry on tables with napkins', scope: 'FRONT', period: 'MORNING', points: 25, recurrence: 'DAILY', desc: 'Opening procedure' },
    { id: 'cat-gs-22', title: 'Check availability of items', scope: 'FRONT', period: 'MORNING', points: 25, recurrence: 'DAILY', desc: 'Opening procedure' },
    { id: 'cat-gs-23', title: 'Open outside if weather is good', scope: 'FRONT', period: 'MORNING', points: 25, recurrence: 'DAILY', desc: 'Opening procedure' },
    { id: 'cat-gs-24', title: 'Start ventilation to 5', scope: 'KITCHEN', period: 'MORNING', points: 25, recurrence: 'DAILY', desc: 'Opening procedure' },

    // Closing Procedures (Front & Kitchen)
    { id: 'cat-gs-25', title: 'Close outside tables', scope: 'FRONT', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-26', title: 'Wipe every tables', scope: 'FRONT', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-27', title: 'Put chairs on the tables', scope: 'FRONT', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-28', title: 'Dishwash', scope: 'FRONT', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-29', title: 'Wipe and clean the bar', scope: 'FRONT', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-30', title: 'Charge tablets and phones', scope: 'FRONT', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-31', title: 'Put Raitha / Salan in the fridge', scope: 'FRONT', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-32', title: 'Clean the floor', scope: 'FRONT', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-33', title: 'Sort the crates / put full ones backsite', scope: 'FRONT', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-34', title: 'Wipe surfaces', scope: 'KITCHEN', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-35', title: 'Clean oven and microwaves', scope: 'KITCHEN', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-36', title: 'Close food recipients', scope: 'KITCHEN', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-37', title: 'Clean the floor (Kitchen)', scope: 'KITCHEN', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },
    { id: 'cat-gs-38', title: 'Shut down ventilation', scope: 'KITCHEN', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Closing procedure' },

    // Fixed Aadhi Tasks
    { id: 'cat-gs-39', title: 'Weigh every spices he puts on recipe + write on paper', scope: 'KITCHEN', period: 'ANYTIME', points: 15, recurrence: 'DAILY', desc: 'Fixed Aadhi Recipe Task' },
    { id: 'cat-gs-40', title: 'Prepare bags of spices accordingly', scope: 'KITCHEN', period: 'ANYTIME', points: 15, recurrence: 'DAILY', desc: 'Fixed Aadhi Recipe Task' },
    { id: 'cat-gs-41', title: 'One week of only 1 grocerie run', scope: 'KITCHEN', period: 'ANYTIME', points: 20, recurrence: 'WEEKLY', desc: 'Fixed Aadhi Recipe Task' },

    // Fixed Roy Cleaner Tasks
    { id: 'cat-gs-42', title: 'Clean vaccum cleaner robot', scope: 'CLEANER', period: 'EVENING', points: 40, recurrence: 'DAILY', desc: 'Fixed Cleaner Task' },
    { id: 'cat-gs-43', title: 'Broom personnal room, hallway, stairs and shoes room', scope: 'CLEANER', period: 'EVENING', points: 15, recurrence: 'DAILY', desc: 'Fixed Cleaner Task' },
    { id: 'cat-gs-44', title: 'Take thrash out to the bin', scope: 'CLEANER', period: 'EVENING', points: 15, recurrence: 'DAILY', desc: 'Fixed Cleaner Task' },
    { id: 'cat-gs-45', title: 'Wipe mirrors and sink', scope: 'CLEANER', period: 'EVENING', points: 15, recurrence: 'DAILY', desc: 'Fixed Cleaner Task' },
    { id: 'cat-gs-46', title: 'Refill garbage bags and tissues', scope: 'CLEANER', period: 'EVENING', points: 10, recurrence: 'DAILY', desc: 'Fixed Cleaner Task' },
    { id: 'cat-gs-47', title: 'Clean the urinals and toilets + mop toilets', scope: 'CLEANER', period: 'EVENING', points: 20, recurrence: 'DAILY', desc: 'Fixed Cleaner Task' },
    { id: 'cat-gs-48', title: 'Mop from personnal room to kitchen', scope: 'CLEANER', period: 'EVENING', points: 15, recurrence: 'DAILY', desc: 'Fixed Cleaner Task' },
    { id: 'cat-gs-49', title: 'Sanitize kitchen', scope: 'CLEANER', period: 'EVENING', points: 25, recurrence: 'DAILY', desc: 'Fixed Cleaner Task' },
    { id: 'cat-gs-50', title: 'Start a washing machine cycle', scope: 'CLEANER', period: 'EVENING', points: 15, recurrence: 'DAILY', desc: 'Fixed Cleaner Task' }
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
  // 2. GOOGLE SHEET CLOUD PERSISTENCE & REVALIDATION ENGINE
  // ==========================================

  let isInitialized = false;

  const saveStateToCloud = async (immediate = false) => {
    try {
      const res = await fetch(`/api/state?t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        cache: 'no-store',
        body: JSON.stringify({ state: appState })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          applyLoadedState(json.data);
          localStorage.setItem('tiprank_resto_state', JSON.stringify(appState));
        }
      }
    } catch (err) {
      console.log('Cloud sync info:', err);
    }
  };

  const revalidateStateFromCloud = async () => {
    try {
      const res = await fetch(`/api/state?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          applyLoadedState(json.data);
          localStorage.setItem('tiprank_resto_state', JSON.stringify(appState));
          if (isInitialized) renderAll();
        }
      }
    } catch (e) {
      console.log('Revalidation info:', e);
    }
  };

  const saveState = () => {
    localStorage.setItem('tiprank_resto_state', JSON.stringify(appState));
    saveStateToCloud(true);
    if (isInitialized) {
      renderAll();
    }
  };

  const applyLoadedState = (rawState) => {
    appState = rawState;
    if (!appState.currentMonth) appState.currentMonth = getCurrentMonthKey();
    if (!appState.activeRole) appState.activeRole = 'MANAGER';
    if (appState.eotmBonusAmount === undefined || appState.eotmBonusAmount === null) appState.eotmBonusAmount = 0;
    
    // Clear legacy mock PDF files
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

    if (!appState.masterTaskCatalogue || appState.masterTaskCatalogue.length === 0) {
      appState.masterTaskCatalogue = JSON.parse(JSON.stringify(DEFAULT_MASTER_CATALOGUE));
      generateMonthlyFairRotation();
    }
  };

  const loadState = async () => {
    // Attempt load from Google Sheet Cloud Backend with anti-cache revalidation
    try {
      const res = await fetch(`/api/state?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          applyLoadedState(json.data);
          return;
        }
      }
    } catch (e) {
      console.log('Google Sheet cloud load info (falling back to LocalStorage):', e);
    }

    // Fallback to LocalStorage
    const saved = localStorage.getItem('tiprank_resto_state');
    if (saved) {
      try {
        applyLoadedState(JSON.parse(saved));
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
    appState.masterTaskCatalogue = JSON.parse(JSON.stringify(DEFAULT_MASTER_CATALOGUE));
    appState.activeRole = 'MANAGER';
    appState.eotmWinnerId = null;
    appState.eotmBonusAmount = 0;
    appState.tasks = [];
    appState.schedules = {};
    appState.tipsConfig = {};
    appState.sopDocuments = [];
    appState.theme = 'dark';
    
    generateDemoData();
    generateMonthlyFairRotation();
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

    // Initial state: 0 completed tasks, clean slate for real operations
    appState.tasks = [];

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

  // Coins earned from approved entries (Scoped strictly by Month for automated monthly reset)
  const getEmployeePoints = (empId, monthKey = appState.currentMonth) => {
    return (appState.tasks || [])
      .filter(t => {
        if (t.employeeId !== empId || t.status !== 'APPROVED') return false;
        const tMonth = t.monthKey || (t.timestamp ? new Date(t.timestamp).toISOString().substring(0, 7) : appState.currentMonth);
        return tMonth === monthKey;
      })
      .reduce((sum, t) => sum + (t.points || 0), 0);
  };

  // Equal-Pay Baseline Calculation Engine with Manager Malus Differentiation
  const calculateTipDistribution = () => {
    const totalTips = 100.00;
    const bonusAmount = 30.00;
    const winnerId = appState.eotmWinnerId;

    const frontStaff = appState.staff.filter(s => s.role === 'FRONT');
    const kitchenStaff = appState.staff.filter(s => s.role === 'KITCHEN');
    const cleanerStaff = appState.staff.filter(s => s.role === 'CLEANER');

    const frontHeadcount = frontStaff.length || 1;
    const kitchenHeadcount = kitchenStaff.length || 1;
    const cleanerHeadcount = cleanerStaff.length || 1;

    // Amount pool left to distribute pro-rata after deducting winner bonus
    const poolForProRata = winnerId && totalTips >= bonusAmount ? totalTips - bonusAmount : totalTips;

    // Calculate Coins earned & Malus Penalty Score per employee
    let empStats = appState.staff.map(emp => {
      const att = getEmployeeAttendance(emp.id, appState.currentMonth);
      const earnedCoins = getEmployeePoints(emp.id, appState.currentMonth);
      
      // Calculate net malus penalties accumulated by this employee this month
      const malusPenalties = (appState.tasks || [])
        .filter(t => t.employeeId === emp.id && (t.isMalus === true || t.points < 0 || t.status === 'REJECTED'))
        .reduce((sum, t) => sum + Math.abs(t.points || 15), 0);

      // Compliance score: Baseline 100 points, minus malus penalties accrued
      const complianceScore = Math.max(0, 100 - malusPenalties);

      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        title: emp.title,
        color: emp.color,
        avatar: emp.avatar,
        workedDays: att.workedDays,
        workedHours: att.workedHours,
        points: earnedCoins,
        malusPenalties: malusPenalties,
        complianceScore: complianceScore,
        baselinePercent: 0,
        manualPercent: null,
        tipSharePercent: 0,
        tipAmount: 0,
        isWinner: emp.id === winnerId
      };
    });

    const totalComplianceScores = empStats.reduce((sum, e) => sum + e.complianceScore, 0) || 1;
    const totalEarnedCoins = empStats.reduce((sum, e) => sum + e.points, 0);

    // Calculate Equal-Pay Baseline with Malus Penalty Differentiation
    empStats.forEach(emp => {
      // Baseline percentage relative to total compliance pool (Equal split when malus = 0)
      emp.baselinePercent = parseFloat(((emp.complianceScore / totalComplianceScores) * 100).toFixed(2));

      // Check for manual overrides from Manager
      const override = appState.manualTipOverrides ? appState.manualTipOverrides[emp.id] : null;
      if (override && override.percent !== undefined && override.percent !== null) {
        emp.manualPercent = parseFloat(override.percent);
        emp.tipSharePercent = emp.manualPercent;
      } else {
        emp.tipSharePercent = emp.baselinePercent;
      }

      // Base tip amount allocated from pool
      let calculatedTipAmt = (emp.tipSharePercent / 100) * poolForProRata;

      // Add EOTM fixed bonus to winner
      if (emp.id === winnerId) {
        calculatedTipAmt += bonusAmount;
      }

      emp.tipAmount = calculatedTipAmt;
    });

    const frontPool = empStats.filter(e => e.role === 'FRONT').reduce((sum, e) => sum + e.tipAmount, 0);
    const kitchenPool = empStats.filter(e => e.role === 'KITCHEN').reduce((sum, e) => sum + e.tipAmount, 0);
    const cleanerPool = empStats.filter(e => e.role === 'CLEANER').reduce((sum, e) => sum + e.tipAmount, 0);

    // Sort employees in descending order of compliance score (highest to lowest)
    empStats.sort((a, b) => b.complianceScore - a.complianceScore);

    return { 
      empStats, 
      grandTotalPoints: totalEarnedCoins, 
      totalTips, 
      bonusAmount,
      frontPool, 
      kitchenPool, 
      cleanerPool,
      frontHeadcount, 
      kitchenHeadcount, 
      cleanerHeadcount
    };
  };

  // ==========================================
  // 4. UI RENDERERS (VIEWS)
  // ==========================================

  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', appState.theme);
  };

  const getTodayDateString = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const isStaffWorkingOnDate = (emp, dateStr) => {
    if (!emp || !dateStr) return false;
    const parts = dateStr.split('-');
    if (parts.length < 3) return false;
    const yyyy = parseInt(parts[0]);
    const mm = parseInt(parts[1]);
    const dd = parseInt(parts[2]);

    const dateObj = new Date(yyyy, mm - 1, dd);
    const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

    const defaultOffDays = (emp.offDays !== undefined) ? emp.offDays : (DEFAULT_OFF_DAYS_CONFIG[emp.id] || []);
    if (defaultOffDays.includes(dayOfWeek)) {
      return false; // Scheduled OFF on this day of week!
    }

    const monthKey = `${yyyy}-${String(mm).padStart(2, '0')}`;
    const empMonthSched = appState.schedules?.[monthKey]?.[emp.id];
    if (empMonthSched && empMonthSched[dd] === false) {
      return false; // Manually marked OFF
    }

    return true; // Working day!
  };

  const renderHeaderLiveDate = () => {
    const el = document.getElementById('header-live-date');
    if (!el) return;

    const selectedDate = appState.selectedDate || getTodayDateString();
    const [yyyy, mm, dd] = selectedDate.split('-').map(Number);
    const dObj = new Date(yyyy, mm - 1, dd);
    const formattedDate = dObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    el.innerHTML = `<i data-lucide="clock" class="selector-icon text-gold"></i> <span>Selected: ${formattedDate}</span>`;
    if (window.lucide) lucide.createIcons();
  };

  const renderDatePicker = () => {
    const picker = document.getElementById('selected-date-picker');
    if (!picker) return;

    if (!appState.selectedDate) {
      appState.selectedDate = getTodayDateString();
    }
    picker.value = appState.selectedDate;

    const heroMonth = document.getElementById('hero-month-name');
    if (heroMonth) {
      const [yyyy, mm, dd] = appState.selectedDate.split('-').map(Number);
      const dObj = new Date(yyyy, mm - 1, dd);
      const monthName = dObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      heroMonth.textContent = `${monthName} (Day ${dd})`;
    }
  };

  // Dashboard & Leaderboard Renderer (Unified Global Ranking & Role Permissions)
  const renderDashboard = () => {
    const isManager = appState.activeRole === 'MANAGER';
    const { empStats, grandTotalPoints, totalTips } = calculateTipDistribution();

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
    if (elTips) elTips.textContent = `${totalTips.toFixed(2)} €`;

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
    const cleanerCount = appState.staff.filter(s => s.role === 'CLEANER').length;
    
    const elStaffCount = document.getElementById('stat-staff-count');
    if (elStaffCount) elStaffCount.textContent = appState.staff.length;

    const elTeamBreakdown = document.getElementById('stat-team-breakdown');
    if (elTeamBreakdown) elTeamBreakdown.textContent = `${frontCount} Front / ${kitchenCount} Kitchen / ${cleanerCount} Cleaning`;

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

    // SUB-TAB 1: DAILY TASKS CHECKLIST & SCHEDULER (NOMINATIVE ASSIGNMENT FOR SELECTED DATE)
    const dailyGrid = document.getElementById('daily-tasks-grid');
    if (dailyGrid) {
      dailyGrid.innerHTML = '';

      const selectedDateStr = appState.selectedDate || getTodayDateString();
      const dateParts = selectedDateStr.split('-');
      const selectedDay = parseInt(dateParts[2]) || 1;
      const [sYyyy, sMm, sDd] = dateParts.map(Number);
      const dayAbbr = getDayOfWeekAbbr(sYyyy, sMm, sDd);

      // Check employee availability on this selected date
      if (!isManager && activeEmp) {
        const isWorking = isStaffWorkingOnDate(activeEmp, selectedDateStr);
        if (!isWorking) {
          dailyGrid.innerHTML = `
            <div style="text-align:center; padding:2.5rem 1rem; background:var(--bg-card); border-radius:var(--radius-md); border:1px solid var(--border-color); width:100%;">
              <div style="font-size:2.8rem; margin-bottom:0.5rem;">🌴</div>
              <h3 style="color:var(--color-gold); margin-bottom:0.5rem;">Scheduled Day OFF (${dayAbbr}, ${selectedDateStr})</h3>
              <p class="text-muted" style="max-width:420px; margin:0 auto;">You are OFF today according to the roster! No shift tasks are assigned to you on your rest days.</p>
            </div>
          `;
          return;
        }
      }

      // Check if Opening or Closing Shift processes have been validated today across ANY employee
      const hasOpeningValidation = (appState.tasks || []).some(t => t.desc.includes('[Opening Shift Process]') && t.status !== 'REJECTED');
      const hasClosingValidation = (appState.tasks || []).some(t => t.desc.includes('[Closing Shift Process]') && t.status !== 'REJECTED');

      // Helper function to check if a task has been completed / validated by ANY team member today
      const getTaskCompletion = (taskTitle, taskDesc, taskPeriod) => {
        const txt = (taskTitle + ' ' + (taskDesc || '') + ' ' + (taskPeriod || '')).toLowerCase();
        
        // If Closing shift is validated by anyone, all closing tasks are completed!
        if (hasClosingValidation && txt.includes('closing')) {
          const cTask = appState.tasks.find(t => t.desc.includes('[Closing Shift Process]') && t.status !== 'REJECTED');
          return cTask || { status: 'PENDING', employeeId: appState.activeRole };
        }
        
        // If Opening shift is validated by anyone, all opening tasks are completed!
        if (hasOpeningValidation && (txt.includes('opening') || txt.includes('procedure'))) {
          const oTask = appState.tasks.find(t => t.desc.includes('[Opening Shift Process]') && t.status !== 'REJECTED');
          return oTask || { status: 'PENDING', employeeId: appState.activeRole };
        }

        // Check individual shared or specific task completion by title across ANY employee
        return (appState.tasks || []).find(t => t.status !== 'REJECTED' && (t.desc === `Daily Task Completed: ${taskTitle}` || (t.desc && t.desc.includes(taskTitle))));
      };

      // Filter tasks strictly for the selected day number of the month
      let allScheduledForDay = (appState.scheduledDailyTasks || []).filter(t => t.day === selectedDay);

      // Separate into ACTIVE (pending) tasks and COMPLETED (validated) tasks
      const activeTasks = [];
      const completedTasks = [];

      allScheduledForDay.forEach(task => {
        const completion = getTaskCompletion(task.title, task.desc, task.period);
        if (completion) {
          completedTasks.push({ ...task, completion });
        } else {
          activeTasks.push(task);
        }
      });

      // Filter active tasks for the current employee if not manager
      let visibleScheduledTasks = activeTasks;
      if (!isManager && activeEmp) {
        visibleScheduledTasks = visibleScheduledTasks.filter(t => t.employeeId === activeEmp.id);
      }

      if (visibleScheduledTasks.length === 0) {
        if (completedTasks.length > 0 && !isManager) {
          dailyGrid.innerHTML = `
            <div style="text-align:center; padding:2.5rem 1rem; background:rgba(16,185,129,0.08); border-radius:var(--radius-md); border:1px solid rgba(16,185,129,0.2); width:100%;">
              <div style="font-size:2.8rem; margin-bottom:0.5rem;">🎉</div>
              <h3 style="color:var(--color-green); margin-bottom:0.5rem;">All Shift Tasks Validated!</h3>
              <p class="text-muted" style="max-width:420px; margin:0 auto;">All shift & closing tasks for <strong>${dayAbbr}, ${selectedDateStr}</strong> have been validated and cleared from your roadmap.</p>
            </div>
          `;
        } else {
          dailyGrid.innerHTML = `
            <div style="text-align:center; padding:2rem 1rem; width:100%;" class="text-muted">
              <i data-lucide="calendar-x" class="text-gold" style="width:32px; height:32px; margin-bottom:0.5rem;"></i>
              <p style="margin:0;">No active shift tasks pending ${!isManager ? 'for you' : ''} for <strong>${dayAbbr}, ${selectedDateStr}</strong>.</p>
            </div>
          `;
        }
      } else {
        // Daily Header Banner with Date Info
        const banner = document.createElement('div');
        banner.style.gridColumn = '1 / -1';
        banner.style.padding = '0.75rem 1.1rem';
        banner.style.background = 'var(--bg-input)';
        banner.style.borderRadius = 'var(--radius-md)';
        banner.style.border = '1px solid var(--border-color)';
        banner.style.marginBottom = '0.5rem';
        banner.style.display = 'flex';
        banner.style.alignItems = 'center';
        banner.style.justifyContent = 'space-between';
        banner.innerHTML = `
          <span style="font-size:0.9rem; font-weight:700; color:var(--text-main); display:flex; align-items:center; gap:0.4rem;">
            <i data-lucide="calendar" class="text-gold"></i> Shift Roadmap for ${dayAbbr}, ${selectedDateStr}
          </span>
          <span class="badge badge-gold" style="font-size:0.75rem; padding:0.25rem 0.6rem;">${visibleScheduledTasks.length} Active Task${visibleScheduledTasks.length !== 1 ? 's' : ''} Pending</span>
        `;
        dailyGrid.appendChild(banner);

        // Strict Chronological Shift Sections Mapping
        const SHIFT_SECTIONS = [
          { key: 'MORNING', title: '🌅 MORNING SHIFT — Opening Procedures & Morning Setup', icon: 'sun-medium', color: '#f59e0b' },
          { key: 'AFTERNOON', title: '☀️ AFTERNOON SHIFT — Mid-Day Operations & Daily Tasks', icon: 'sun', color: '#10b981' },
          { key: 'EVENING', title: '🌙 EVENING SHIFT — Closing Procedures & Night Cleaning', icon: 'moon', color: '#c084fc' },
          { key: 'ANYTIME', title: '🕒 FLEXIBLE SHIFT — Anytime Operational Tasks', icon: 'clock', color: '#60a5fa' }
        ];

        SHIFT_SECTIONS.forEach(shift => {
          const sectionTasks = visibleScheduledTasks.filter(t => (t.period || 'ANYTIME') === shift.key);
          if (sectionTasks.length > 0) {
            // Shift Timeline Section Header
            const shiftHeader = document.createElement('div');
            shiftHeader.className = 'shift-timeline-header';
            shiftHeader.style.borderLeft = `4px solid ${shift.color}`;
            shiftHeader.innerHTML = `
              <i data-lucide="${shift.icon}" style="color:${shift.color}; width:20px; height:20px;"></i>
              <span style="font-weight:700; font-size:0.95rem; color:var(--text-main);">${shift.title}</span>
              <span class="badge" style="margin-left:auto; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-muted); font-size:0.7rem;">
                ${sectionTasks.length} Task${sectionTasks.length !== 1 ? 's' : ''}
              </span>
            `;
            dailyGrid.appendChild(shiftHeader);

            sectionTasks.forEach(task => {
              const emp = appState.staff.find(s => s.id === task.employeeId) || { name: 'Unassigned', avatar: 'UN', color: '#64748b', title: '' };
              const item = document.createElement('div');
              
              // Team Scope styling & badge
              let scopeClass = 'task-everyone';
              let teamBadge = `<span class="badge" style="background:rgba(245,158,11,0.15); color:#fcd34d; border:1px solid rgba(245,158,11,0.3); font-size:0.65rem;">👥 EVERYONE</span>`;
              if (task.category === 'FRONT') {
                scopeClass = 'task-front';
                teamBadge = `<span class="badge" style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.3); font-size:0.65rem;">🏛️ FRONT</span>`;
              } else if (task.category === 'KITCHEN') {
                scopeClass = 'task-kitchen';
                teamBadge = `<span class="badge" style="background:rgba(239,68,68,0.15); color:#fca5a5; border:1px solid rgba(239,68,68,0.3); font-size:0.65rem;">👨‍🍳 KITCHEN</span>`;
              } else if (task.category === 'CLEANER') {
                scopeClass = 'task-cleaner';
                teamBadge = `<span class="badge" style="background:rgba(20,184,166,0.15); color:#5eead4; border:1px solid rgba(20,184,166,0.3); font-size:0.65rem;">🧹 CLEANER</span>`;
              }

              // Assignment Type Badge (Fixed vs Duo vs Rotational)
              let typeBadge = `<span class="badge" style="background:rgba(16,185,129,0.15); color:#6ee7b7; border:1px solid rgba(16,185,129,0.3); font-size:0.65rem;">🔄 Rotational</span>`;
              const titleLower = task.title.toLowerCase();
              if (task.category === 'CLEANER' || titleLower.includes('roy') || titleLower.includes('aadhi') || (task.desc && task.desc.toLowerCase().includes('fixed'))) {
                typeBadge = `<span class="badge" style="background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3); font-size:0.65rem;">📌 Fixed Dedicated</span>`;
              } else if (titleLower.includes('opening') || titleLower.includes('closing') || titleLower.includes('procedure')) {
                typeBadge = `<span class="badge" style="background:rgba(245,158,11,0.15); color:#fcd34d; border:1px solid rgba(245,158,11,0.3); font-size:0.65rem;">👥 Binôme Duo</span>`;
              }

              item.className = `task-item-card ${scopeClass}`;
              item.style.cssText = 'display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; box-sizing: border-box !important; padding: 1.1rem 1.4rem !important; background: var(--bg-card-solid) !important; border: 1px solid var(--border-color) !important; border-radius: var(--radius-md) !important; margin-bottom: 0.65rem !important; gap: 1.5rem !important;';

              let statusAction = `
                <button class="btn btn-primary btn-sm btn-claim-task" data-id="${task.id}" data-desc="${task.title}" data-pts="${task.points}" style="padding:0.45rem 1.1rem; font-weight:700; border-radius:var(--radius-full); white-space:nowrap;">
                  <i data-lucide="check-circle"></i> Mark Done
                </button>
              `;

              item.innerHTML = `
                <div class="task-left-content" style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap; flex:1; min-width:0;">
                  <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <strong class="task-user" style="font-size:1.05rem; color:var(--text-main); font-weight:700;">${task.title}</strong>
                    ${teamBadge}
                    ${typeBadge}
                    ${!isManager ? `<span class="badge badge-gold" style="font-size:0.65rem; padding:0.1rem 0.35rem;">👤 Your Shift</span>` : ''}
                  </div>
                  ${task.desc ? `<span style="font-size:0.85rem; color:var(--text-muted);">(${task.desc})</span>` : ''}
                  <div style="display:inline-flex; align-items:center; gap:0.4rem; background:var(--bg-input); padding:0.25rem 0.65rem; border-radius:var(--radius-full); border:1px solid var(--border-color); flex-shrink:0;">
                    <div class="avatar" style="background-color: ${emp.color}; width:22px; height:22px; font-size:0.65rem;">${emp.avatar}</div>
                    <span style="font-size:0.8rem; color:var(--text-muted);">Assigned to: <strong style="color:var(--text-main);">${emp.name}</strong> (${emp.title || emp.role})</span>
                  </div>
                </div>
                <div class="task-right-actions" style="display:flex; align-items:center; gap:1.25rem; flex-shrink:0; margin-left:auto; white-space:nowrap;">
                  <span class="task-pts" style="font-weight:800; font-size:1.1rem; color:var(--color-gold); white-space:nowrap;">+${task.points} Coins</span>
                  ${!isManager ? statusAction : `
                    <button class="btn btn-danger-outline btn-sm btn-delete-sched" data-id="${task.id}" title="Remove task" style="white-space:nowrap;">
                      <i data-lucide="trash-2"></i> Remove
                    </button>
                  `}
                </div>
              `;
              dailyGrid.appendChild(item);
            });
          }
        });
      }

      // Collapsible/Visible Section for Completed & Cleared Tasks Today
      if (completedTasks.length > 0) {
        const completedSection = document.createElement('div');
        completedSection.style.gridColumn = '1 / -1';
        completedSection.style.marginTop = '1.25rem';
        completedSection.style.padding = '0.85rem 1rem';
        completedSection.style.background = 'rgba(16,185,129,0.05)';
        completedSection.style.borderRadius = 'var(--radius-md)';
        completedSection.style.border = '1px solid rgba(16,185,129,0.2)';

        let completedCardsHTML = '';
        completedTasks.forEach(item => {
          const validatorEmp = appState.staff.find(s => s.id === item.completion.employeeId) || { name: 'Team Member' };
          const statusBadge = item.completion.status === 'APPROVED' 
            ? `<span class="badge badge-purple" style="font-size:0.68rem;">✔ Approved (+${item.points} Coins)</span>` 
            : `<span class="badge" style="background:rgba(245,158,11,0.15); color:var(--color-gold); border:1px solid rgba(245,158,11,0.3); font-size:0.68rem;">⏳ Pending Manager Approval</span>`;

          completedCardsHTML += `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:0.45rem 0.65rem; background:var(--bg-card); border-radius:var(--radius-md); margin-top:0.4rem; border:1px solid var(--border-color);">
              <div>
                <strong style="font-size:0.9rem; text-decoration:line-through; color:var(--text-muted);">${item.title}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.15rem;">
                  Validated by <strong>${validatorEmp.name}</strong> for the shift team
                </div>
              </div>
              <div>${statusBadge}</div>
            </div>
          `;
        });

        completedSection.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem;">
            <span style="font-size:0.85rem; font-weight:700; color:var(--color-green); display:flex; align-items:center; gap:0.4rem;">
              <i data-lucide="check-check"></i> Completed & Cleared Shift Tasks (${completedTasks.length})
            </span>
            <span style="font-size:0.75rem; color:var(--text-muted);">Synchronized across all team roadmaps</span>
          </div>
          ${completedCardsHTML}
        `;
        dailyGrid.appendChild(completedSection);
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
            monthKey: appState.currentMonth || getCurrentMonthKey(),
            timestamp: Date.now()
          };

          appState.tasks.push(newSubmission);
          saveState();
          showToast(`Task "${desc}" validated and cleared from all team roadmaps!`);
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
            renderAll();
            showToast("Task entry approved! Coins awarded.");
          }
        });
      });

      // Manager Task Rejection with Automated Malus Penalty & Audit Log Entry
      pendingList.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const taskId = e.currentTarget.dataset.id;
          const task = appState.tasks.find(t => t.id === taskId);
          if (task) {
            const emp = appState.staff.find(s => s.id === task.employeeId) || { name: 'Employee' };
            const reason = prompt(`Enter rejection reason for ${emp.name} (Penalty will be recorded in Manager Audit Log):`, "Non-compliant execution") || "Non-compliant execution";

            task.status = 'REJECTED';
            task.rejectionReason = reason;
            task.rejectedAt = Date.now();

            // Automated Coin Penalty (Malus deduction: e.g. -15 or -30 Coins)
            const penaltyCoins = Math.min(task.points || 15, 30);
            appState.tasks.unshift({
              id: `malus-${task.id}-${Date.now()}`,
              employeeId: task.employeeId,
              desc: `⚠️ MANAGER MALUS PENALTY: Task Rejection for "${task.desc}" (Reason: ${reason})`,
              points: -penaltyCoins,
              status: 'APPROVED',
              timestamp: Date.now(),
              isMalus: true,
              targetTaskId: task.id,
              reason: reason
            });

            saveState();
            renderAll();
            showToast(`❌ Task rejected! Automated penalty of -${penaltyCoins} Coins applied to ${emp.name} & recorded in Audit Log.`);
          }
        });
      });
    }

    // Manager View: Approved Tasks History & Revoke Handler
    const historyList = document.getElementById('validated-tasks-list');
    if (historyList) {
      const validatedTasks = appState.tasks.filter(t => t.status === 'APPROVED').reverse();
      historyList.innerHTML = '';

      if (validatedTasks.length === 0) {
        historyList.innerHTML = `<p class="text-muted">No approved tasks yet this month.</p>`;
      } else {
        validatedTasks.slice(0, 10).forEach(task => {
          const emp = appState.staff.find(s => s.id === task.employeeId) || { name: 'Unknown', avatar: 'UN', color: '#64748b' };
          const item = document.createElement('div');
          item.className = 'task-item';
          item.style.display = 'flex';
          item.style.alignItems = 'center';
          item.style.justifyContent = 'space-between';

          const isMalusEntry = task.points < 0 || task.isMalus;

          item.innerHTML = `
            <div>
              <div class="task-user" style="display:flex; align-items:center; gap:0.4rem;">
                <div class="avatar" style="background-color:${emp.color}; width:20px; height:20px; font-size:0.6rem;">${emp.avatar}</div>
                <strong>${emp.name}</strong>
              </div>
              <div class="task-desc" style="margin-top:0.2rem;">${task.desc}</div>
            </div>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span class="badge ${isMalusEntry ? 'badge-danger' : 'badge-purple'}">${task.points >= 0 ? '+' : ''}${task.points} Coins</span>
              ${!isMalusEntry ? `
                <button class="btn btn-danger-outline btn-sm btn-revoke-approved" data-id="${task.id}" title="Revoke task & apply penalty" style="padding:0.25rem 0.5rem; font-size:0.75rem;">
                  <i data-lucide="shield-alert"></i> Revoke
                </button>
              ` : ''}
            </div>
          `;
          historyList.appendChild(item);
        });

        // Revoke Approved Task Listener
        historyList.querySelectorAll('.btn-revoke-approved').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const taskId = e.currentTarget.dataset.id;
            const task = appState.tasks.find(t => t.id === taskId);
            if (task) {
              const emp = appState.staff.find(s => s.id === task.employeeId) || { name: 'Employee' };
              const reason = prompt(`Revoke task for ${emp.name}? Enter rejection/penalty reason:`, "Non-compliant after audit") || "Non-compliant after audit";

              task.status = 'REJECTED';
              task.rejectionReason = reason;
              task.rejectedAt = Date.now();

              const penaltyCoins = Math.min(task.points || 15, 30);
              appState.tasks.unshift({
                id: `malus-revoke-${task.id}-${Date.now()}`,
                employeeId: task.employeeId,
                desc: `⚠️ MANAGER MALUS PENALTY: Revoked Task "${task.desc}" (Reason: ${reason})`,
                points: -penaltyCoins,
                status: 'APPROVED',
                timestamp: Date.now(),
                isMalus: true,
                targetTaskId: task.id,
                reason: reason
              });

              saveState();
              renderAll();
              showToast(`⚠️ Task revoked! Penalty of -${penaltyCoins} Coins applied to ${emp.name} & logged.`);
            }
          });
        });
      }
    }

    // Manager View: Audit Log Table Renderer
    const auditTbody = document.getElementById('manager-audit-log-tbody');
    const auditBadge = document.getElementById('audit-log-count-badge');
    if (auditTbody) {
      auditTbody.innerHTML = '';
      const auditEntries = appState.tasks.filter(t => t.status === 'REJECTED' || t.isMalus === true).sort((a, b) => b.timestamp - a.timestamp);

      if (auditBadge) auditBadge.textContent = `${auditEntries.length} Audit Entries`;

      if (auditEntries.length === 0) {
        auditTbody.innerHTML = `<tr><td colspan="6" class="text-muted" style="text-align:center; padding:1.5rem;">No task rejections or penalties recorded in the audit log. Clean history! 🎉</td></tr>`;
      } else {
        auditEntries.forEach(entry => {
          const emp = appState.staff.find(s => s.id === entry.employeeId) || { name: 'Unknown', avatar: 'UN', color: '#64748b', title: '' };
          const dateStr = new Date(entry.timestamp).toLocaleString();
          const tr = document.createElement('tr');

          let penaltyDisplay = `<strong style="color:var(--color-danger); font-weight:800;">${entry.points} Coins</strong>`;
          if (entry.status === 'REJECTED' && !entry.isMalus) {
            penaltyDisplay = `<span class="badge badge-danger">Task Forfeited</span>`;
          }

          tr.innerHTML = `
            <td style="font-size:0.8rem; color:var(--text-muted);">${dateStr}</td>
            <td>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <div class="avatar" style="background-color: ${emp.color}; width: 24px; height: 24px; font-size: 0.65rem;">${emp.avatar}</div>
                <strong>${emp.name}</strong> (${emp.role})
              </div>
            </td>
            <td style="max-width:280px; font-size:0.85rem;">${entry.desc}</td>
            <td>
              <span class="badge" style="background:rgba(239,68,68,0.15); color:#fca5a5; border:1px solid rgba(239,68,68,0.3);">
                ❌ Non-Compliant / Rejected
              </span>
            </td>
            <td>${penaltyDisplay}</td>
            <td>
              <span style="font-size:0.8rem; color:var(--text-muted);">${entry.reason || entry.rejectionReason || 'Non-compliant execution'}</span>
            </td>
          `;
          auditTbody.appendChild(tr);
        });
      }
    }

    if (window.lucide) lucide.createIcons();
  };

  // Tip Calculator Renderer
  const renderTips = () => {
    const mKey = appState.currentMonth;
    const config = appState.tipsConfig[mKey] || { totalAmount: 100 };

    const inputPool = document.getElementById('input-total-tips');
    if (inputPool && document.activeElement !== inputPool) {
      inputPool.value = config.totalAmount !== undefined && config.totalAmount !== null ? config.totalAmount : 100;
    }

    const inputBonus = document.getElementById('input-eotm-bonus');
    if (inputBonus && document.activeElement !== inputBonus) {
      inputBonus.value = appState.eotmBonusAmount !== undefined && appState.eotmBonusAmount !== null ? appState.eotmBonusAmount : 0;
    }

    const { empStats, totalTips, frontPool, kitchenPool, cleanerPool, frontHeadcount, kitchenHeadcount, cleanerHeadcount, frontAllocatedPool, kitchenAllocatedPool, cleanerAllocatedPool } = calculateTipDistribution();

    // Render Equal-Pay Baseline Equity Banner
    const elHeadcountBanner = document.getElementById('summary-headcount-equity');
    if (elHeadcountBanner) {
      elHeadcountBanner.innerHTML = `
        <div style="padding:0.85rem 1.15rem; background:linear-gradient(135deg, rgba(168,85,247,0.14), rgba(20,184,166,0.12)); border-radius:var(--radius-md); border:1px solid rgba(168,85,247,0.35); margin-bottom:1.25rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem;">
          <div>
            <span style="font-size:0.88rem; color:var(--text-main); font-weight:700; display:flex; align-items:center; gap:0.4rem; margin-bottom:0.25rem;">
              <i data-lucide="scale" style="color:#c084fc;"></i> Automated Equal-Pay Baseline Active (100% Equal Tip Share per Employee)
            </span>
            <p style="margin:0; font-size:0.8rem; color:var(--text-muted);">
              All active team members receive an equal baseline share of the tip pool. Financial variations occur <strong>strictly via Manager Audit Malus Penalties</strong> applied for non-compliant tasks.
            </p>
          </div>
          <span class="badge badge-purple" style="font-size:0.72rem; padding:0.25rem 0.6rem; flex-shrink:0;">⚖️ Equal-Pay Baseline + Malus Differentiation</span>
        </div>
      `;
    }

    const elFrontAmt = document.getElementById('summary-front-amount');
    if (elFrontAmt) elFrontAmt.textContent = `${frontPool.toLocaleString('en-US', { minimumFractionDigits: 2 })} €`;

    const elKitchenAmt = document.getElementById('summary-kitchen-amount');
    if (elKitchenAmt) elKitchenAmt.textContent = `${kitchenPool.toLocaleString('en-US', { minimumFractionDigits: 2 })} €`;

    const elCleanerAmt = document.getElementById('summary-cleaner-amount');
    if (elCleanerAmt) elCleanerAmt.textContent = `${cleanerPool.toLocaleString('en-US', { minimumFractionDigits: 2 })} €`;

    const frontSub = empStats.filter(e => e.role === 'FRONT').length;
    const kitchenSub = empStats.filter(e => e.role === 'KITCHEN').length;
    const cleanerSub = empStats.filter(e => e.role === 'CLEANER').length;

    const elFrontSub = document.getElementById('summary-front-sub');
    if (elFrontSub) elFrontSub.textContent = `${frontSub} Staff (Front)`;

    const elKitchenSub = document.getElementById('summary-kitchen-sub');
    if (elKitchenSub) elKitchenSub.textContent = `${kitchenSub} Staff (Kitchen)`;

    const elCleanerSub = document.getElementById('summary-cleaner-sub');
    if (elCleanerSub) elCleanerSub.textContent = `${cleanerSub} Staff (Cleaning)`;

    // Detailed Editable Table (Sorted in descending order by compliance score)
    const tbody = document.getElementById('tips-detail-tbody');
    if (tbody) {
      tbody.innerHTML = '';

      // Sort employees by compliance score descending (highest to lowest)
      empStats.sort((a, b) => b.complianceScore - a.complianceScore);

      empStats.forEach(emp => {
        const tr = document.createElement('tr');
        const hasOverride = emp.manualPercent !== null;
        const isCrownWinner = emp.id === appState.eotmWinnerId;

        let roleBadgeClass = 'badge-kitchen';
        let roleBadgeText = 'Kitchen';
        if (emp.role === 'FRONT') {
          roleBadgeClass = 'badge-front';
          roleBadgeText = 'Front';
        } else if (emp.role === 'CLEANER') {
          roleBadgeClass = 'badge-cleaner';
          roleBadgeText = 'Cleaning';
        }

        let statusDisplay = `<span class="badge" style="background:rgba(16,185,129,0.15); color:#6ee7b7; border:1px solid rgba(16,185,129,0.3);">✔ 100% Compliant</span>`;
        if (emp.malusPenalties > 0) {
          statusDisplay = `<span class="badge badge-danger">⚠️ -${emp.malusPenalties} Malus Penalty</span>`;
        }

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
            <span class="badge ${roleBadgeClass}">
              ${roleBadgeText} - ${emp.title}
            </span>
          </td>
          <td>${statusDisplay}</td>
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
          const totalPool = appState.tipsConfig[appState.currentMonth]?.totalAmount !== undefined ? parseFloat(appState.tipsConfig[appState.currentMonth].totalAmount) : 0;

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

  // Automated Official Professional PDF SOP Document Generator Engine
  const downloadTaskSOPPDF = (task) => {
    if (!task) return;

    const teamScopeName = task.scope === 'CLEANER' ? 'CLEANING TEAM (ROY)' : (task.scope === 'FRONT' ? 'FRONT TEAM (FLOOR / BAR)' : (task.scope === 'KITCHEN' ? 'KITCHEN TEAM' : 'ALL DEPARTMENTS'));
    const docCode = `SOP-REG-2026-${String(task.id || '01').replace(/\D/g, '') || '01'}`;
    const dateStr = new Date().toISOString().substring(0, 10);

    // If jsPDF UMD library is available
    if (window.jspdf && window.jspdf.jsPDF) {
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });

        const primaryColor = [30, 41, 59]; // Dark Navy
        const accentGold = [217, 119, 6];   // Amber Gold
        const lightBg = [248, 250, 252];

        // Container Border
        doc.setFillColor(...lightBg);
        doc.rect(10, 10, 190, 277, 'F');
        doc.setDrawColor(203, 213, 225);
        doc.rect(10, 10, 190, 277, 'S');

        // Header Title Banner
        doc.setFillColor(...primaryColor);
        doc.rect(15, 15, 180, 24, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('TIPBITTE RESTAURANT OPERATIONS', 20, 24);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text('STANDARD OPERATING PROCEDURE (SOP) - REGULATORY CONTROL MANUAL', 20, 32);

        // Document Details
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`TASK / PROCEDURE: ${task.title.toUpperCase()}`, 20, 48);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Document Code: ${docCode}`, 20, 55);
        doc.text(`Assigned Team: ${teamScopeName}`, 20, 61);
        doc.text(`Shift Period: ${task.period || 'ANYTIME'} | Recurrence: ${task.recurrence || 'DAILY'}`, 110, 55);
        doc.text(`Effective Audit Date: ${dateStr}`, 110, 61);

        // Gold Line
        doc.setDrawColor(...accentGold);
        doc.setLineWidth(0.8);
        doc.line(20, 67, 190, 67);

        // Section 1: Objective
        doc.setTextColor(...accentGold);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('1. OBJECTIVE & OPERATIONAL SCOPE', 20, 76);

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        const descText = task.desc || `Mandatory operational standard procedure for ${task.title}. Ensures maximum cleanliness, safety compliance, and team efficiency during service.`;
        const splitDesc = doc.splitTextToSize(descText, 165);
        doc.text(splitDesc, 20, 84);

        let yPos = 84 + (splitDesc.length * 5) + 6;

        // Section 2: Step-by-Step Method
        doc.setTextColor(...accentGold);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('2. STEP-BY-STEP EXECUTION METHOD', 20, yPos);
        yPos += 8;

        const steps = [
          `Step 1: Sanitary Preparation & Safety Equipment - Wash hands thoroughly (HACCP standard). Equip required personal protective gear (gloves, apron, non-slip footwear).`,
          `Step 2: Operational Execution of Task - Perform "${task.title}" systematically according to official quality standards. ${task.desc || ''}`,
          `Step 3: Sanitization & Area Verification - Clean and sanitize all contact surfaces using approved anti-bacterial solution. Return tools to designated storage.`,
          `Step 4: Audit Logging & Sign-Off - Report completion on the TipBitte Digital Shift Roadmap for manager verification.`
        ];

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(9);
        steps.forEach(step => {
          const splitStep = doc.splitTextToSize(step, 165);
          doc.setFont('helvetica', 'bold');
          doc.text('•', 20, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(splitStep, 25, yPos);
          yPos += (splitStep.length * 4.8) + 3;
        });

        yPos += 4;

        // Section 3: Audit Compliance
        doc.setTextColor(...accentGold);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('3. HEALTH, SAFETY & REGULATORY AUDIT CONTROL (HACCP)', 20, yPos);
        yPos += 8;

        const auditPoints = [
          `[✔] Food Safety & Hygiene Standard: Hand washing before and after execution. Zero cross-contamination policy.`,
          `[✔] Chemical & Equipment Safety: Use chemicals at prescribed dilution ratios. Store chemical products away from food items.`,
          `[✔] Administrative Audit Traceability: Retain logged records for health inspection & labor compliance controls.`
        ];

        doc.setFontSize(8.5);
        auditPoints.forEach(ap => {
          const splitAp = doc.splitTextToSize(ap, 165);
          doc.text(splitAp, 20, yPos);
          yPos += (splitAp.length * 4.5) + 2;
        });

        // Sign-Off Box
        yPos = Math.max(yPos + 10, 245);
        doc.setDrawColor(203, 213, 225);
        doc.setFillColor(255, 255, 255);
        doc.rect(20, yPos, 170, 30, 'FD');

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('OFFICIAL REGULATORY APPROVAL & MANAGER SIGN-OFF', 25, yPos + 7);

        doc.setFont('helvetica', 'normal');
        doc.text(`Operations Manager Signature: _______________________`, 25, yPos + 16);
        doc.text(`Inspection Control Date: ${dateStr}`, 120, yPos + 16);
        doc.text(`Status: VALIDATED & COMPLIANT`, 25, yPos + 23);

        doc.save(`${docCode}_${task.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
        showToast(`📄 Generated Official PDF SOP: "${task.title}"`);
        return;
      } catch (err) {
        console.error("jsPDF generation fallback triggered:", err);
      }
    }

    // Fallback: Printable HTML Window
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${docCode} - ${task.title}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; background: #fff; margin: 0; padding: 20px; line-height: 1.5; }
            .header-banner { background: #1e293b; color: #fff; padding: 18px 24px; border-radius: 6px; }
            .header-banner h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
            .header-banner p { margin: 4px 0 0 0; font-size: 11px; opacity: 0.85; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; background: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 13px; }
            .meta-grid strong { color: #d97706; }
            .section-title { font-size: 14px; color: #d97706; font-weight: bold; border-bottom: 2px solid #f59e0b; padding-bottom: 4px; margin-top: 24px; text-transform: uppercase; }
            .step-list { margin: 12px 0; padding-left: 20px; }
            .step-list li { margin-bottom: 10px; font-size: 13px; }
            .audit-box { background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin-top: 16px; font-size: 12px; }
            .signoff-box { margin-top: 36px; border: 1px solid #cbd5e1; padding: 16px; border-radius: 6px; display: flex; justify-content: space-between; font-size: 12px; background: #fafafa; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom:20px; text-align:right;">
            <button onclick="window.print()" style="padding:10px 20px; background:#d97706; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">🖨️ Print / Save as PDF</button>
          </div>
          <div class="header-banner">
            <h1>TIPBITTE RESTAURANT OPERATIONS</h1>
            <p>STANDARD OPERATING PROCEDURE (SOP) - OFFICIAL REGULATORY COMPLIANCE MANUAL</p>
          </div>
          <div class="meta-grid">
            <div>
              <div><strong>Task / Procedure:</strong> ${task.title}</div>
              <div><strong>Document Code:</strong> ${docCode}</div>
              <div><strong>Target Team:</strong> ${teamScopeName}</div>
            </div>
            <div>
              <div><strong>Shift Period:</strong> ${task.period || 'ANYTIME'}</div>
              <div><strong>Recurrence:</strong> ${task.recurrence || 'DAILY'}</div>
              <div><strong>Audit Control Date:</strong> ${dateStr}</div>
            </div>
          </div>
          <div class="section-title">1. Objective & Operational Scope</div>
          <p style="font-size:13px; color:#475569;">
            ${task.desc || `Mandatory operational standard for ${task.title}. Ensures maximum cleanliness, safety compliance, and team efficiency.`}
          </p>
          <div class="section-title">2. Step-by-Step Execution Method</div>
          <ol class="step-list">
            <li><strong>Sanitary Preparation & Safety Equipment:</strong> Wash hands thoroughly (HACCP standard). Equip required personal protective equipment (gloves, apron, non-slip footwear).</li>
            <li><strong>Operational Execution of Task:</strong> Perform "${task.title}" systematically according to official restaurant quality standards.</li>
            <li><strong>Sanitization & Area Verification:</strong> Clean and sanitize all contact surfaces using approved anti-bacterial solution. Return tools to designated storage.</li>
            <li><strong>Audit Logging & Sign-Off:</strong> Report completion on the TipBitte Digital Shift Roadmap for manager verification.</li>
          </ol>
          <div class="section-title">3. Health, Safety & Administrative Audit Control</div>
          <div class="audit-box">
            <div>✔ <strong>HACCP Hygiene Standard:</strong> Mandatory hand sanitation before & after execution. Zero cross-contamination policy.</div>
            <div style="margin-top:6px;">✔ <strong>Chemical Safety:</strong> Dilute cleaning products as specified. Never mix incompatible chemicals.</div>
            <div style="margin-top:6px;">✔ <strong>Regulatory Compliance:</strong> Retain daily digital audit logs for health inspector verification.</div>
          </div>
          <div class="signoff-box">
            <div>
              <strong>Approved by:</strong> Operations Manager<br/>
              <strong>Status:</strong> VALIDATED & COMPLIANT
            </div>
            <div style="text-align:right;">
              <strong>Signature:</strong> _______________________<br/>
              <strong>Date:</strong> ${dateStr}
            </div>
          </div>
        </body>
        </html>
      `);
      printWin.document.close();
      showToast(`📄 Generated Printable Official SOP PDF for "${task.title}"`);
    }
  };

  // SOP (Standard Operating Procedures) Renderer
  let activeSopFilter = 'ALL';

  const renderSOP = () => {
    // Render Master Task Procedures & Instructions
    const tasksContainer = document.getElementById('sop-tasks-list');
    if (tasksContainer) {
      tasksContainer.innerHTML = '';
      const catalogue = appState.masterTaskCatalogue || [];
      
      const filtered = catalogue.filter(t => {
        if (activeSopFilter === 'ALL') return true;
        return t.scope === activeSopFilter;
      });

      if (filtered.length === 0) {
        tasksContainer.innerHTML = `
          <div style="background:var(--bg-input); padding:1.5rem; border-radius:var(--radius-md); border:1px dashed var(--border-color); text-align:center;">
            <i data-lucide="list-checks" class="text-gold" style="width:32px; height:32px; margin-bottom:0.5rem;"></i>
            <p class="text-muted" style="margin:0; font-size:0.88rem;">No operational tasks match this category filter.</p>
          </div>
        `;
      } else {
        filtered.forEach((task, index) => {
          const card = document.createElement('div');
          card.className = 'task-card';
          card.style.borderLeft = task.scope === 'FRONT' ? '4px solid var(--color-primary)' : (task.scope === 'KITCHEN' ? '4px solid var(--color-danger)' : (task.scope === 'CLEANER' ? '4px solid #14b8a6' : '4px solid var(--color-gold)'));
          
          let scopeBadgeClass = 'badge-gold';
          if (task.scope === 'FRONT') scopeBadgeClass = 'badge-front';
          if (task.scope === 'KITCHEN') scopeBadgeClass = 'badge-kitchen';
          if (task.scope === 'CLEANER') scopeBadgeClass = 'badge-cleaner';

          card.innerHTML = `
            <div class="task-main-info" style="width:100%;">
              <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.4rem;">
                <div style="display:flex; align-items:center; gap:0.4rem;">
                  <span class="badge ${scopeBadgeClass}">
                    ${task.scope === 'CLEANER' ? 'CLEANING (ROY)' : task.scope}
                  </span>
                  <span class="badge" style="background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-muted); font-size:0.65rem;">
                    ⏰ ${task.period || 'ANYTIME'}
                  </span>
                  <span class="badge" style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); color:var(--color-gold); font-size:0.65rem;">
                    🔁 ${task.recurrence || 'DAILY'}
                  </span>
                </div>
                <button class="btn btn-outline btn-sm btn-generate-sop-pdf" data-task-id="${task.id}" style="padding:0.3rem 0.75rem; font-size:0.78rem; font-weight:700;">
                  <i data-lucide="file-down"></i> Télécharger PDF Officiel SOP
                </button>
              </div>
              <h4 style="margin:0 0 0.4rem 0; font-size:1.05rem; font-weight:700; color:var(--text-main);">
                SOP #${index + 1}: ${task.title}
              </h4>
              <p style="margin:0; font-size:0.88rem; color:var(--text-muted); line-height:1.5; background:var(--bg-input); padding:0.65rem 0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
                <strong style="color:var(--text-main); display:block; margin-bottom:0.25rem;">📋 Standard Operating Procedure / Method Instructions:</strong>
                ${task.desc || 'Standard operational task. Follow HACCP health, safety, and sanitization protocols.'}
              </p>
            </div>
          `;
          tasksContainer.appendChild(card);
        });

        // Individual SOP PDF Download Listener
        tasksContainer.querySelectorAll('.btn-generate-sop-pdf').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const taskId = e.currentTarget.dataset.taskId;
            const task = (appState.masterTaskCatalogue || []).find(t => t.id === taskId);
            if (task) {
              downloadTaskSOPPDF(task);
            }
          });
        });
      }
    }

    if (window.lucide) lucide.createIcons();
  };

  // Manager Refresh SOPs Button Listener (Scans Google Sheet catalogue for new tasks)
  const btnRefreshSOPs = document.getElementById('btn-refresh-sops');
  if (btnRefreshSOPs) {
    btnRefreshSOPs.addEventListener('click', async () => {
      await syncGoogleSheetTasks(false);
      renderSOP();
      showToast(`🔄 SOP Manual refreshed! Scanned ${appState.masterTaskCatalogue?.length || 0} Google Sheet tasks for PDF generation.`);
    });
  }

  // Batch Export All SOP PDFs Button Listener
  const btnExportAllSOPs = document.getElementById('btn-export-all-sop-pdf');
  if (btnExportAllSOPs) {
    btnExportAllSOPs.addEventListener('click', () => {
      const catalogue = appState.masterTaskCatalogue || [];
      if (catalogue.length === 0) {
        showToast("❌ No tasks in SOP catalogue.");
        return;
      }
      showToast(`📦 Batch generating ${Math.min(5, catalogue.length)} sample SOP PDFs...`);
      catalogue.slice(0, 5).forEach((task, idx) => {
        setTimeout(() => downloadTaskSOPPDF(task), idx * 800);
      });
    });
  }

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
    renderDatePicker();
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

  // Date Picker Event Listener
  const datePickerEl = document.getElementById('selected-date-picker');
  if (datePickerEl) {
    datePickerEl.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val) {
        appState.selectedDate = val;
        appState.currentMonth = val.substring(0, 7);
        generateMonthlyFairRotation();
        saveState();
        renderAll();
        showToast(`📅 Date selected: ${val}`);
      }
    });
  }

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
  // Rule 1: Fixed assignments for Roy (Cleaner) and Aadhi (Recipe/Spices) - ONLY WHEN WORKING
  // Rule 2: Schedule-based Opening & Closing procedures for Front & Kitchen
  // Rule 3: Daily equitable random rotation for remaining staff tasks among PRESENT WORKING staff
  const generateMonthlyFairRotation = () => {
    const catalogue = appState.masterTaskCatalogue || [];
    if (!catalogue || catalogue.length === 0) {
      return;
    }

    const monthKey = appState.currentMonth || getCurrentMonthKey();
    const totalDays = getDaysInMonth(monthKey);

    const newScheduledTasks = [];

    // Helper: Identify Roy and Aadhi from active staff roster
    const royEmp = appState.staff.find(s => s.name.toLowerCase() === 'roy' || s.role === 'CLEANER');
    const aadhiEmp = appState.staff.find(s => s.name.toLowerCase() === 'aadhi');

    // Categorize catalogue into 3 distinct buckets:
    // Bucket A: Fixed Roy & Aadhi Tasks
    const royTasks = catalogue.filter(t => t.scope === 'CLEANER' || t.title.toLowerCase().includes('roy') || (t.desc && t.desc.toLowerCase().includes('roy')));
    const aadhiTasks = catalogue.filter(t => t.title.toLowerCase().includes('aadhi') || (t.desc && t.desc.toLowerCase().includes('aadhi')) || (t.scope && t.scope.toUpperCase() === 'AADHI'));

    // Bucket B: Opening & Closing Shift Procedures
    const isOpeningTask = (t) => {
      const txt = (t.title + ' ' + (t.desc || '') + ' ' + (t.period || '')).toLowerCase();
      return txt.includes('opening') || txt.includes('procedure');
    };
    const isClosingTask = (t) => {
      const txt = (t.title + ' ' + (t.desc || '') + ' ' + (t.period || '')).toLowerCase();
      return txt.includes('closing');
    };

    const openingTasks = catalogue.filter(t => isOpeningTask(t) && !royTasks.includes(t) && !aadhiTasks.includes(t));
    const closingTasks = catalogue.filter(t => isClosingTask(t) && !royTasks.includes(t) && !aadhiTasks.includes(t));

    // Bucket C: Remaining General Operational Tasks
    const remainingTasks = catalogue.filter(t => !royTasks.includes(t) && !aadhiTasks.includes(t) && !openingTasks.includes(t) && !closingTasks.includes(t));

    // Seeded pseudo-random generator for consistent daily fair shuffling
    const getPseudoRandom = (seed) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let day = 1; day <= totalDays; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${monthKey}-${dayStr}`;

      // Strictly filter staff WORKING on this specific date (ABSENT staff get 0 tasks!)
      const scheduledStaff = appState.staff.filter(emp => isStaffWorkingOnDate(emp, dateStr));

      // Front & Kitchen staff WORKING on this day (excluding Roy & Aadhi for general rotation pool)
      const generalFrontStaff = scheduledStaff.filter(s => s.role === 'FRONT' && s.name.toLowerCase() !== 'roy' && s.name.toLowerCase() !== 'aadhi');
      const generalKitchenStaff = scheduledStaff.filter(s => s.role === 'KITCHEN' && s.name.toLowerCase() !== 'roy' && s.name.toLowerCase() !== 'aadhi');

      // ----------------------------------------------------
      // RULE 1: FIXED ASSIGNMENTS FOR ROY & AADHI (ONLY IF WORKING ON DATE)
      // ----------------------------------------------------
      if (royEmp && scheduledStaff.some(s => s.id === royEmp.id)) {
        royTasks.forEach((task, tIdx) => {
          newScheduledTasks.push({
            id: `st-${monthKey}-${day}-${royEmp.id}-roy-${tIdx}`,
            employeeId: royEmp.id,
            day: day,
            title: task.title,
            category: 'CLEANER',
            period: task.period || 'EVENING',
            points: task.points || 10,
            desc: task.desc || 'Fixed Cleaner Task'
          });
        });
      }

      if (aadhiEmp && scheduledStaff.some(s => s.id === aadhiEmp.id)) {
        aadhiTasks.forEach((task, tIdx) => {
          newScheduledTasks.push({
            id: `st-${monthKey}-${day}-${aadhiEmp.id}-aadhi-${tIdx}`,
            employeeId: aadhiEmp.id,
            day: day,
            title: task.title,
            category: 'KITCHEN',
            period: task.period || 'ANYTIME',
            points: task.points || 10,
            desc: task.desc || 'Fixed Aadhi Recipe Task'
          });
        });
      }

      // ----------------------------------------------------
      // RULE 2: STRICT KITCHEN & FRONT OPENING / CLOSING PAIRING RULES
      // ----------------------------------------------------

      // A) KITCHEN OPENING (DUO = 2 people, MUST include Aadhi if working)
      const kitchenOpeningStaff = [];
      const workingKitchenStaff = scheduledStaff.filter(s => s.role === 'KITCHEN' && s.name.toLowerCase() !== 'roy');
      
      const isAadhiWorkingToday = aadhiEmp && scheduledStaff.some(s => s.id === aadhiEmp.id);
      if (isAadhiWorkingToday) {
        kitchenOpeningStaff.push(aadhiEmp);
      }
      
      const otherKitchenOpeningPool = workingKitchenStaff.filter(s => s.id !== aadhiEmp?.id);
      if (otherKitchenOpeningPool.length > 0) {
        const secondKitchenOpener = otherKitchenOpeningPool[day % otherKitchenOpeningPool.length];
        if (secondKitchenOpener && !kitchenOpeningStaff.includes(secondKitchenOpener)) {
          kitchenOpeningStaff.push(secondKitchenOpener);
        }
      }
      if (kitchenOpeningStaff.length < 2 && otherKitchenOpeningPool.length > 1) {
        const extraOpener = otherKitchenOpeningPool[(day + 1) % otherKitchenOpeningPool.length];
        if (extraOpener && !kitchenOpeningStaff.includes(extraOpener)) {
          kitchenOpeningStaff.push(extraOpener);
        }
      }

      // B) KITCHEN CLOSING (DUO = 2 people, MUST EXCLUDE AADHI)
      const kitchenClosingStaff = [];
      const eligibleKitchenClosingPool = workingKitchenStaff.filter(s => s.id !== aadhiEmp?.id);
      if (eligibleKitchenClosingPool.length > 0) {
        const p1 = eligibleKitchenClosingPool[day % eligibleKitchenClosingPool.length];
        kitchenClosingStaff.push(p1);
        if (eligibleKitchenClosingPool.length > 1) {
          const p2 = eligibleKitchenClosingPool[(day + 1) % eligibleKitchenClosingPool.length];
          if (p2 && p2.id !== p1.id) kitchenClosingStaff.push(p2);
        }
      }

      // C) FRONT OPENING (SOLO = 1 person)
      const frontOpeningStaff = [];
      const workingFrontStaff = scheduledStaff.filter(s => s.role === 'FRONT' && s.name.toLowerCase() !== 'roy');
      if (workingFrontStaff.length > 0) {
        frontOpeningStaff.push(workingFrontStaff[day % workingFrontStaff.length]);
      }

      // D) FRONT CLOSING (DUO = 2 people if workingFront >= 2, otherwise SOLO = 1 person)
      const frontClosingStaff = [];
      if (workingFrontStaff.length >= 2) {
        const fp1 = workingFrontStaff[day % workingFrontStaff.length];
        const fp2 = workingFrontStaff[(day + 1) % workingFrontStaff.length];
        frontClosingStaff.push(fp1);
        if (fp2 && fp2.id !== fp1.id) frontClosingStaff.push(fp2);
      } else if (workingFrontStaff.length === 1) {
        frontClosingStaff.push(workingFrontStaff[0]);
      }

      // Assign Opening Tasks to target staff lists
      openingTasks.forEach((task, tIdx) => {
        let targetStaffList = [];
        if (task.scope === 'KITCHEN') {
          targetStaffList = kitchenOpeningStaff;
        } else if (task.scope === 'FRONT' || task.scope === 'EVERYONE') {
          targetStaffList = frontOpeningStaff;
        }

        targetStaffList.forEach(assignedEmp => {
          newScheduledTasks.push({
            id: `st-${monthKey}-${day}-${assignedEmp.id}-open-${tIdx}`,
            employeeId: assignedEmp.id,
            day: day,
            title: task.title,
            category: task.scope,
            period: 'MORNING',
            points: task.points || 25,
            desc: task.desc || 'Opening Procedure'
          });
        });
      });

      // Assign Closing Tasks to target staff lists
      closingTasks.forEach((task, tIdx) => {
        let targetStaffList = [];
        if (task.scope === 'KITCHEN') {
          targetStaffList = kitchenClosingStaff;
        } else if (task.scope === 'FRONT' || task.scope === 'EVERYONE') {
          targetStaffList = frontClosingStaff;
        }

        targetStaffList.forEach(assignedEmp => {
          newScheduledTasks.push({
            id: `st-${monthKey}-${day}-${assignedEmp.id}-close-${tIdx}`,
            employeeId: assignedEmp.id,
            day: day,
            title: task.title,
            category: task.scope,
            period: 'EVENING',
            points: task.points || 25,
            desc: task.desc || 'Closing Procedure'
          });
        });
      });

      // ----------------------------------------------------
      // RULE 3: EQUITABLE DAILY ROTATION FOR REMAINING TASKS (WORKING STAFF ONLY)
      // NO UNASSIGNED "EVERYONE" TASKS - EVERY TASK HAS A DESIGNATED RESPONSIBLE EMPLOYEE!
      // ----------------------------------------------------
      const remainingFront = remainingTasks.filter(t => t.scope === 'FRONT');
      const remainingKitchen = remainingTasks.filter(t => t.scope === 'KITCHEN');
      const remainingEveryone = remainingTasks.filter(t => t.scope === 'EVERYONE');

      let seed = day * 1337;
      const shuffledFront = [...remainingFront].sort(() => getPseudoRandom(seed++) - 0.5);
      const shuffledKitchen = [...remainingKitchen].sort(() => getPseudoRandom(seed++) - 0.5);
      const shuffledEveryone = [...remainingEveryone].sort(() => getPseudoRandom(seed++) - 0.5);

      if (generalFrontStaff.length > 0 && shuffledFront.length > 0) {
        shuffledFront.forEach((task, idx) => {
          const emp = generalFrontStaff[idx % generalFrontStaff.length];
          newScheduledTasks.push({
            id: `st-${monthKey}-${day}-${emp.id}-rf-${idx}`,
            employeeId: emp.id,
            day: day,
            title: task.title,
            category: 'FRONT',
            period: task.period || 'AFTERNOON',
            points: task.points || 10,
            desc: task.desc || ''
          });
        });
      }

      if (generalKitchenStaff.length > 0 && shuffledKitchen.length > 0) {
        shuffledKitchen.forEach((task, idx) => {
          const emp = generalKitchenStaff[idx % generalKitchenStaff.length];
          newScheduledTasks.push({
            id: `st-${monthKey}-${day}-${emp.id}-rk-${idx}`,
            employeeId: emp.id,
            day: day,
            title: task.title,
            category: 'KITCHEN',
            period: task.period || 'AFTERNOON',
            points: task.points || 10,
            desc: task.desc || ''
          });
        });
      }

      // Shared / EVERYONE Tasks: Dynamically distributed nominatively between working Front and Kitchen staff
      const workingGeneralStaff = [...generalFrontStaff, ...generalKitchenStaff];
      if (workingGeneralStaff.length > 0 && shuffledEveryone.length > 0) {
        shuffledEveryone.forEach((task, idx) => {
          const emp = workingGeneralStaff[(idx + day) % workingGeneralStaff.length];
          newScheduledTasks.push({
            id: `st-${monthKey}-${day}-${emp.id}-re-${idx}`,
            employeeId: emp.id,
            day: day,
            title: task.title,
            category: emp.role,
            period: task.period || 'ANYTIME',
            points: task.points || 10,
            desc: task.desc || 'Shared Rotational Task'
          });
        });
      }
    }

    appState.scheduledDailyTasks = newScheduledTasks;
    saveState();
  };

  // Google Sheet Single Sheet Live Sync
  const SHEET_ID = '1zjcbkAkIv2-g1629Eax2S1SO_5uGTxKghJSsvSjcfx0';

  const splitCSVRow = (rowText) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === '\t' || char === ';') && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const parseCSVTasks = (csvText) => {
    if (!csvText || !csvText.trim()) return [];
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    let colIdx = { title: -1, desc: -1, team: -1, period: -1, recurrence: -1, reward: -1 };
    let startRow = 0;

    // Scan up to the first 15 lines to find the row containing header "Tasks"
    for (let r = 0; r < Math.min(15, lines.length); r++) {
      const rowParts = splitCSVRow(lines[r]);
      const lowerParts = rowParts.map(p => p.toLowerCase());
      const tasksIdx = lowerParts.findIndex(p => p === 'tasks' || p === 'task' || p.includes('task'));
      if (tasksIdx !== -1) {
        startRow = r + 1;
        colIdx.title = tasksIdx;

        const descIdx = lowerParts.findIndex(p => p.includes('desc'));
        if (descIdx !== -1) colIdx.desc = descIdx;

        const teamIdx = lowerParts.findIndex(p => p.includes('team') || p.includes('scope'));
        if (teamIdx !== -1) colIdx.team = teamIdx;

        const periodIdx = lowerParts.findIndex(p => p.includes('period'));
        if (periodIdx !== -1) colIdx.period = periodIdx;

        const recIdx = lowerParts.findIndex(p => p.includes('reccurence') || p.includes('recurrence'));
        if (recIdx !== -1) colIdx.recurrence = recIdx;

        const rewardIdx = lowerParts.findIndex(p => p.includes('reward') || p.includes('coin') || p.includes('point'));
        if (rewardIdx !== -1) colIdx.reward = rewardIdx;
        break;
      }
    }

    // Fallback default column indices if header row is not found
    if (colIdx.title === -1) colIdx.title = 1;
    if (colIdx.desc === -1) colIdx.desc = 2;
    if (colIdx.team === -1) colIdx.team = 3;
    if (colIdx.period === -1) colIdx.period = 4;
    if (colIdx.recurrence === -1) colIdx.recurrence = 5;
    if (colIdx.reward === -1) colIdx.reward = 6;

    const imported = [];
    let currentSection = '';

    for (let i = startRow; i < lines.length; i++) {
      const parts = splitCSVRow(lines[i]);
      if (parts.length === 0 || !parts.some(p => p.length > 0)) continue;

      const rawSection = (parts[0] || '').trim();
      if (rawSection) currentSection = rawSection;

      const title = (parts[colIdx.title] || '').trim();
      if (!title || title.toLowerCase() === 'tasks' || title.toLowerCase() === 'task name') continue;

      const rawDesc = parts[colIdx.desc] !== undefined ? parts[colIdx.desc].trim() : '';
      const desc = rawDesc && rawDesc !== title ? rawDesc : (currentSection ? `Section: ${currentSection}` : `Operational task: ${title}`);

      const rawTeam = (parts[colIdx.team] || '').toUpperCase();
      let scope = 'EVERYONE';
      if (rawTeam.includes('ROY') || rawTeam.includes('CLEAN')) {
        scope = 'CLEANER';
      } else if (rawTeam.includes('FRONT') || rawTeam.includes('FLOOR') || rawTeam.includes('BAR')) {
        scope = 'FRONT';
      } else if (rawTeam.includes('KITCHEN') || rawTeam.includes('COOK') || rawTeam.includes('PREP') || rawTeam.includes('AADHI')) {
        scope = 'KITCHEN';
      } else if (rawTeam.includes('EVERYONE') || rawTeam.includes('ALL')) {
        scope = 'EVERYONE';
      } else {
        // Auto-detect based on section or title
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('roy') || lowerTitle.includes('mop') || lowerTitle.includes('vacuum') || lowerTitle.includes('vaccum')) {
          scope = 'CLEANER';
        } else if (lowerTitle.includes('front') || lowerTitle.includes('dine-in') || lowerTitle.includes('toilet')) {
          scope = 'FRONT';
        } else if (lowerTitle.includes('kitchen') || lowerTitle.includes('fridge')) {
          scope = 'KITCHEN';
        }
      }

      const rawPeriod = (parts[colIdx.period] || '').toUpperCase();
      let period = 'ANYTIME';
      if (rawPeriod.includes('MORN')) period = 'MORNING';
      else if (rawPeriod.includes('AFTER') || rawPeriod.includes('NOON')) period = 'AFTERNOON';
      else if (rawPeriod.includes('EVEN') || rawPeriod.includes('NIGHT')) period = 'EVENING';

      const rawRec = (parts[colIdx.recurrence] || '').toUpperCase();
      let recurrence = 'DAILY';
      if (rawRec.includes('WEEK')) recurrence = 'WEEKLY';
      else if (rawRec.includes('ONE') || rawRec.includes('HERO') || rawRec.includes('SINGLE')) recurrence = 'ONEOFF';

      imported.push({
        id: 'cat-gs-' + i + '-' + Date.now(),
        title: title,
        scope: scope,
        period: period,
        points: 0,
        recurrence: recurrence,
        desc: desc
      });
    }

    return imported;
  };

  const syncGoogleSheetTasks = async (showNotification = true) => {
    const btnSync = document.getElementById('btn-sync-google-sheet');
    if (btnSync) {
      btnSync.disabled = true;
      btnSync.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Syncing Google Sheet...`;
    }

    const urls = [
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`,
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`)}`
    ];

    let csvText = null;
    let fetchError = null;

    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const text = await response.text();
          if (text && text.trim().length > 20) {
            csvText = text;
            break;
          }
        } else {
          fetchError = new Error(`HTTP ${response.status} from ${url}`);
        }
      } catch (err) {
        fetchError = err;
      }
    }

    if (csvText) {
      try {
        const parsed = parseCSVTasks(csvText);
        if (parsed.length > 0) {
          appState.masterTaskCatalogue = parsed;
          generateMonthlyFairRotation();
          saveState();
          renderAll();
          if (showNotification) {
            showToast(`⚡ Synchronized Google Sheet! ${parsed.length} tasks loaded.`);
          }
        } else {
          console.error("[Google Sheet Sync Error] CSV parsed 0 valid tasks.");
          if (showNotification) showToast("Warning: 0 valid tasks parsed from Google Sheet.");
        }
      } catch (parseErr) {
        console.error("[Google Sheet Sync Error] Parsing error:", parseErr);
        if (showNotification) showToast("CSV Parsing error. Check console.");
      }
    } else {
      console.error("[Google Sheet Sync Error] Could not fetch CSV from endpoints:", fetchError);
      if (showNotification) showToast("Error connecting to Google Sheet. Check console.");
    }

    if (btnSync) {
      btnSync.disabled = false;
      btnSync.innerHTML = `<i data-lucide="refresh-cw"></i> Sync Google Sheet`;
    }
    if (window.lucide) lucide.createIcons();
  };

  // Live Google Sheet Sync Listener
  const btnSyncSheet = document.getElementById('btn-sync-google-sheet');
  if (btnSyncSheet) {
    btnSyncSheet.addEventListener('click', () => syncGoogleSheetTasks(true));
  }

  // Weekly Randomizer Engine: Shuffles & redistributes nominative tasks for the 7 days starting from selectedDate
  const randomizeWeekTasks = () => {
    const selectedDateStr = appState.selectedDate || getCurrentDateStr();
    const [yearStr, monthStr, dayStr] = selectedDateStr.split('-');
    const currentMonthKey = `${yearStr}-${monthStr}`;
    const startDay = parseInt(dayStr, 10);
    const daysInMonth = getDaysInMonth(currentMonthKey);

    const catalogue = appState.masterTaskCatalogue || [];
    if (!catalogue || catalogue.length === 0) {
      showToast("❌ Master catalogue is empty. Sync Google Sheet first.");
      return;
    }

    ensureMonthSchedule(currentMonthKey);
    if (!appState.scheduledDailyTasks) appState.scheduledDailyTasks = [];

    // Identify target 7-day range
    const targetDays = [];
    for (let i = 0; i < 7; i++) {
      const d = startDay + i;
      if (d <= daysInMonth) {
        targetDays.push(d);
      }
    }

    // Filter out existing scheduled tasks for these 7 target days
    appState.scheduledDailyTasks = appState.scheduledDailyTasks.filter(st => {
      return !targetDays.includes(st.day);
    });

    const royEmp = appState.staff.find(s => s.name.toLowerCase() === 'roy' || s.role === 'CLEANER');
    const aadhiEmp = appState.staff.find(s => s.name.toLowerCase() === 'aadhi');

    const royTasks = catalogue.filter(t => t.scope === 'CLEANER' || t.title.toLowerCase().includes('roy') || (t.desc && t.desc.toLowerCase().includes('roy')));
    const aadhiTasks = catalogue.filter(t => t.title.toLowerCase().includes('aadhi') || (t.desc && t.desc.toLowerCase().includes('aadhi')) || (t.scope && t.scope.toUpperCase() === 'AADHI'));

    const isOpeningTask = (t) => {
      const txt = (t.title + ' ' + (t.desc || '') + ' ' + (t.period || '')).toLowerCase();
      return txt.includes('opening') || txt.includes('procedure');
    };
    const isClosingTask = (t) => {
      const txt = (t.title + ' ' + (t.desc || '') + ' ' + (t.period || '')).toLowerCase();
      return txt.includes('closing');
    };

    const openingTasks = catalogue.filter(t => isOpeningTask(t) && !royTasks.includes(t) && !aadhiTasks.includes(t));
    const closingTasks = catalogue.filter(t => isClosingTask(t) && !royTasks.includes(t) && !aadhiTasks.includes(t));
    const remainingTasks = catalogue.filter(t => !royTasks.includes(t) && !aadhiTasks.includes(t) && !openingTasks.includes(t) && !closingTasks.includes(t));

    targetDays.forEach((day, dIdx) => {
      const dateStr = `${currentMonthKey}-${String(day).padStart(2, '0')}`;
      const scheduledStaff = appState.staff.filter(emp => isStaffWorkingOnDate(emp, dateStr));

      const workingFront = scheduledStaff.filter(s => s.role === 'FRONT');
      const workingKitchen = scheduledStaff.filter(s => s.role === 'KITCHEN');
      const workingCleaner = scheduledStaff.filter(s => s.role === 'CLEANER');

      // 1. Roy Fixed Cleaning Tasks
      if (royEmp && workingCleaner.some(s => s.id === royEmp.id)) {
        royTasks.forEach((task, tIdx) => {
          appState.scheduledDailyTasks.push({
            id: `st-${currentMonthKey}-${day}-${royEmp.id}-rand-roy-${tIdx}`,
            employeeId: royEmp.id,
            day: day,
            title: task.title,
            category: 'CLEANER',
            period: task.period || 'EVENING',
            points: task.points || 10,
            desc: task.desc || 'Fixed Cleaner Task'
          });
        });
      }

      // 2. Aadhi Fixed Recipe Tasks
      if (aadhiEmp && workingKitchen.some(s => s.id === aadhiEmp.id)) {
        aadhiTasks.forEach((task, tIdx) => {
          appState.scheduledDailyTasks.push({
            id: `st-${currentMonthKey}-${day}-${aadhiEmp.id}-rand-aadhi-${tIdx}`,
            employeeId: aadhiEmp.id,
            day: day,
            title: task.title,
            category: 'KITCHEN',
            period: task.period || 'ANYTIME',
            points: task.points || 10,
            desc: task.desc || 'Fixed Aadhi Recipe Task'
          });
        });
      }

      // 3. Opening & Closing Shifts
      const kOpenStaff = [];
      if (aadhiEmp && workingKitchen.some(s => s.id === aadhiEmp.id)) kOpenStaff.push(aadhiEmp);
      const otherKitchen = workingKitchen.filter(s => s.id !== aadhiEmp?.id);
      if (otherKitchen.length > 0) {
        const randOpener = otherKitchen[Math.floor(Math.random() * otherKitchen.length)];
        if (!kOpenStaff.includes(randOpener)) kOpenStaff.push(randOpener);
      }

      const kCloseStaff = [];
      const eligibleKitchenClosing = workingKitchen.filter(s => s.id !== aadhiEmp?.id);
      if (eligibleKitchenClosing.length > 0) {
        const shuffled = [...eligibleKitchenClosing].sort(() => Math.random() - 0.5);
        kCloseStaff.push(shuffled[0]);
        if (shuffled.length > 1 && shuffled[1].id !== shuffled[0].id) kCloseStaff.push(shuffled[1]);
      }

      const fOpenStaff = [];
      if (workingFront.length > 0) {
        fOpenStaff.push(workingFront[Math.floor(Math.random() * workingFront.length)]);
      }

      const fCloseStaff = [];
      if (workingFront.length >= 2) {
        const shuffledF = [...workingFront].sort(() => Math.random() - 0.5);
        fCloseStaff.push(shuffledF[0]);
        if (shuffledF[1] && shuffledF[1].id !== shuffledF[0].id) fCloseStaff.push(shuffledF[1]);
      } else if (workingFront.length === 1) {
        fCloseStaff.push(workingFront[0]);
      }

      openingTasks.forEach((task, tIdx) => {
        const targetStaff = task.scope === 'KITCHEN' ? kOpenStaff : fOpenStaff;
        targetStaff.forEach(emp => {
          appState.scheduledDailyTasks.push({
            id: `st-${currentMonthKey}-${day}-${emp.id}-rand-open-${tIdx}`,
            employeeId: emp.id,
            day: day,
            title: task.title,
            category: task.scope,
            period: 'MORNING',
            points: task.points || 25,
            desc: task.desc || 'Opening Procedure'
          });
        });
      });

      closingTasks.forEach((task, tIdx) => {
        const targetStaff = task.scope === 'KITCHEN' ? kCloseStaff : fCloseStaff;
        targetStaff.forEach(emp => {
          appState.scheduledDailyTasks.push({
            id: `st-${currentMonthKey}-${day}-${emp.id}-rand-close-${tIdx}`,
            employeeId: emp.id,
            day: day,
            title: task.title,
            category: task.scope,
            period: 'EVENING',
            points: task.points || 25,
            desc: task.desc || 'Closing Procedure'
          });
        });
      });

      // 4. Remaining General Tasks with Fresh Randomization across working staff
      const randFrontTasks = remainingTasks.filter(t => t.scope === 'FRONT');
      const randKitchenTasks = remainingTasks.filter(t => t.scope === 'KITCHEN');
      const randEveryoneTasks = remainingTasks.filter(t => t.scope === 'EVERYONE');

      const shuffledFront = [...randFrontTasks].sort(() => Math.random() - 0.5);
      const shuffledKitchen = [...randKitchenTasks].sort(() => Math.random() - 0.5);

      if (workingFront.length > 0 && shuffledFront.length > 0) {
        shuffledFront.forEach((task, idx) => {
          const emp = workingFront[idx % workingFront.length];
          appState.scheduledDailyTasks.push({
            id: `st-${currentMonthKey}-${day}-${emp.id}-rf-${idx}-${Date.now()}`,
            employeeId: emp.id,
            day: day,
            title: task.title,
            category: 'FRONT',
            period: task.period || 'AFTERNOON',
            points: task.points || 10,
            desc: task.desc || 'Rotational Task'
          });
        });
      }

      if (workingKitchen.length > 0 && shuffledKitchen.length > 0) {
        shuffledKitchen.forEach((task, idx) => {
          const emp = workingKitchen[idx % workingKitchen.length];
          appState.scheduledDailyTasks.push({
            id: `st-${currentMonthKey}-${day}-${emp.id}-rk-${idx}-${Date.now()}`,
            employeeId: emp.id,
            day: day,
            title: task.title,
            category: 'KITCHEN',
            period: task.period || 'AFTERNOON',
            points: task.points || 10,
            desc: task.desc || 'Rotational Task'
          });
        });
      }

      // EVERYONE Tasks: Rotated between working Front & Kitchen staff (NO UNASSIGNED TASKS!)
      const workingStaffAll = [...workingFront, ...workingKitchen];
      if (workingStaffAll.length > 0 && randEveryoneTasks.length > 0) {
        const shuffledEveryone = [...randEveryoneTasks].sort(() => Math.random() - 0.5);
        shuffledEveryone.forEach((task, idx) => {
          const emp = workingStaffAll[(idx + dIdx) % workingStaffAll.length];
          appState.scheduledDailyTasks.push({
            id: `st-${currentMonthKey}-${day}-${emp.id}-re-${idx}-${Date.now()}`,
            employeeId: emp.id,
            day: day,
            title: task.title,
            category: emp.role,
            period: task.period || 'ANYTIME',
            points: task.points || 10,
            desc: task.desc || 'Shared Rotational Task'
          });
        });
      }
    });

    saveState();
    renderAll();
    showToast(`🎲 Weekly Randomizer complete! Shuffled tasks for Days ${targetDays.join(', ')} (${currentMonthKey}).`);
  };

  const btnRandomizeWeek = document.getElementById('btn-randomize-week');
  if (btnRandomizeWeek) {
    btnRandomizeWeek.addEventListener('click', randomizeWeekTasks);
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

  // Validate Opening Shift Listener (Full 30 Coins awarded to EACH member of the pair)
  const btnOpening = document.getElementById('btn-validate-opening');
  if (btnOpening) {
    btnOpening.addEventListener('click', () => {
      const currentEmpId = appState.activeRole;
      const emp = appState.staff.find(s => s.id === currentEmpId);
      if (!emp) {
        showToast("Please select an active employee account.");
        return;
      }

      const selectedDateStr = appState.selectedDate || getTodayDateString();
      const dateParts = selectedDateStr.split('-');
      const selectedDay = parseInt(dateParts[2]) || 1;

      // Identify opening team members assigned for this date (Kitchen or Front)
      const dayOpeningTasks = (appState.scheduledDailyTasks || []).filter(t => t.day === selectedDay && (t.title.toLowerCase().includes('opening') || t.period === 'MORNING'));
      
      let openingEmpIds = Array.from(new Set(dayOpeningTasks.map(t => t.employeeId)));
      // Filter for team members of the same role as current user, or include current user
      openingEmpIds = openingEmpIds.filter(id => {
        const s = appState.staff.find(x => x.id === id);
        return s && (s.role === emp.role || emp.role === 'CLEANER');
      });

      if (!openingEmpIds.includes(currentEmpId)) {
        openingEmpIds.push(currentEmpId);
      }

      // Award full 30 Coins to EACH individual in the pair
      openingEmpIds.forEach(empId => {
        const partner = appState.staff.find(s => s.id === empId);
        // Avoid duplicate pending submissions for partner
        const hasPending = (appState.tasks || []).some(t => t.employeeId === empId && t.desc.includes('[Opening Shift Process]') && t.status !== 'REJECTED');
        if (!hasPending && partner) {
          appState.tasks.unshift({
            id: 'shift-open-' + empId + '-' + Date.now(),
            employeeId: empId,
            desc: `[Opening Shift Process] Keyhandover, lights & morning setup (Validated by ${emp.name})`,
            points: 30, // Full 30 Coins awarded to EACH member!
            status: 'PENDING',
            timestamp: Date.now()
          });
        }
      });

      saveState();
      renderAll();
      showToast(`Opening shift validated by ${emp.name}! Full 30 Coins awarded to each partner in the pair.`);
    });
  }

  // Validate Closing Shift Listener (Full 30 Coins awarded to EACH member of the pair)
  const btnClosing = document.getElementById('btn-validate-closing');
  if (btnClosing) {
    btnClosing.addEventListener('click', () => {
      const currentEmpId = appState.activeRole;
      const emp = appState.staff.find(s => s.id === currentEmpId);
      if (!emp) {
        showToast("Please select an active employee account.");
        return;
      }

      const selectedDateStr = appState.selectedDate || getTodayDateString();
      const dateParts = selectedDateStr.split('-');
      const selectedDay = parseInt(dateParts[2]) || 1;

      // Identify closing team members assigned for this date (Kitchen or Front)
      const dayClosingTasks = (appState.scheduledDailyTasks || []).filter(t => t.day === selectedDay && (t.title.toLowerCase().includes('closing') || t.period === 'EVENING'));
      
      let closingEmpIds = Array.from(new Set(dayClosingTasks.map(t => t.employeeId)));
      // Filter for team members of the same role as current user, or include current user
      closingEmpIds = closingEmpIds.filter(id => {
        const s = appState.staff.find(x => x.id === id);
        return s && (s.role === emp.role || emp.role === 'CLEANER');
      });

      if (!closingEmpIds.includes(currentEmpId)) {
        closingEmpIds.push(currentEmpId);
      }

      // Award full 30 Coins to EACH individual in the pair
      closingEmpIds.forEach(empId => {
        const partner = appState.staff.find(s => s.id === empId);
        // Avoid duplicate pending submissions for partner
        const hasPending = (appState.tasks || []).some(t => t.employeeId === empId && t.desc.includes('[Closing Shift Process]') && t.status !== 'REJECTED');
        if (!hasPending && partner) {
          appState.tasks.unshift({
            id: 'shift-close-' + empId + '-' + Date.now(),
            employeeId: empId,
            desc: `[Closing Shift Process] POS register closure, sanitization & lockup (Validated by ${emp.name})`,
            points: 30, // Full 30 Coins awarded to EACH member!
            status: 'PENDING',
            timestamp: Date.now()
          });
        }
      });

      saveState();
      renderAll();
      showToast(`Closing shift validated by ${emp.name}! Full 30 Coins awarded to each partner in the pair.`);
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
  loadState().then(() => {
    initSubtabs();
    initSchedulerForm();
    isInitialized = true;
    renderAll();
    syncGoogleSheetTasks(false);
  });

});
