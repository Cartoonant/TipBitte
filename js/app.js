/**
 * TipRank Resto - Core Application Logic (English Version with Coins)
 * Internal Restaurant Web App for Tip Distribution & Employee of the Month Gamification
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. INITIAL STATE & REAL STAFF ROSTER (AUGUST 2026)
  // ==========================================

  const DEFAULT_STAFF = [
    // Front Team (Floor / Bar)
    { id: 'emp-2', name: 'Vinod', role: 'FRONT', title: 'Service Lead', color: '#3b82f6', avatar: 'VN' },
    { id: 'emp-3', name: 'Siri', role: 'FRONT', title: 'Server', color: '#8b5cf6', avatar: 'SR' },
    
    // Kitchen Team
    { id: 'emp-4', name: 'Aadhi', role: 'KITCHEN', title: 'Kitchen Lead', color: '#ec4899', avatar: 'AD' },
    { id: 'emp-5', name: 'Karthik', role: 'KITCHEN', title: 'Kitchen', color: '#10b981', avatar: 'KR' },
    { id: 'emp-6', name: 'Bhanu', role: 'KITCHEN', title: 'Kitchen', color: '#f59e0b', avatar: 'BH' },
    { id: 'emp-7', name: 'Muthyam', role: 'KITCHEN', title: 'Kitchen', color: '#6366f1', avatar: 'MT' }
  ];

  const getCurrentMonthKey = () => {
    return '2026-08';
  };

  const getDaysInMonth = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  // Global State
  let appState = {
    currentMonth: '2026-08',
    activeRole: 'MANAGER', // 'MANAGER' or employee ID (e.g. 'emp-2')
    theme: 'dark',
    activeFilter: 'ALL',
    staff: [],
    schedules: {},           // { "2026-08": { "emp-2": { 1: true, 2: false, ... } } }
    scheduledDailyTasks: [], // [ { id, employeeId, title, category, points, frequency } ]
    tasks: [],               // Submissions: [ { id, employeeId, desc, points, status: 'APPROVED'|'PENDING'|'REJECTED', timestamp } ]
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
    appState.tasks = [];
    appState.schedules = {};
    appState.tipsConfig = {};
    appState.theme = 'dark';
    
    generateDemoData();
  };

  const generateDemoData = () => {
    const mKey = appState.currentMonth;
    const daysCount = getDaysInMonth(mKey);
    const [year, month] = mKey.split('-').map(Number);

    // Initialize schedules with recurring off days
    if (!appState.schedules[mKey]) {
      appState.schedules[mKey] = {};
      appState.staff.forEach((emp) => {
        appState.schedules[mKey][emp.id] = {};
        const empOffWeekdays = DEFAULT_OFF_DAYS_CONFIG[emp.id] || [];

        for (let d = 1; d <= daysCount; d++) {
          const date = new Date(year, month - 1, d);
          const dayOfWeek = date.getDay();
          const isOff = empOffWeekdays.includes(dayOfWeek);
          appState.schedules[mKey][emp.id][d] = !isOff;
        }
      });
    }

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

    appState.tasks = [];
    localStorage.setItem('tiprank_resto_state', JSON.stringify(appState));
  };

  // ==========================================
  // 3. CALCULATION ENGINE (COIN-BASED MERITOCRACY)
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

  // Tip distribution calculation based on Coins (Hybrid Model)
  const calculateTipDistribution = () => {
    const config = appState.tipsConfig[appState.currentMonth] || { totalAmount: 2600 };
    const totalTips = parseFloat(config.totalAmount) || 0;

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
        tipAmount: 0
      };
    });

    const grandTotalPoints = empStats.reduce((sum, e) => sum + e.points, 0);

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

      emp.tipAmount = (emp.tipSharePercent / 100) * totalTips;
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

  const renderMonthSelector = () => {
    const select = document.getElementById('current-month-select');
    if (!select) return;

    select.innerHTML = `
      <option value="2026-08" selected>August 2026</option>
      <option value="2026-09">September 2026</option>
      <option value="2026-10">October 2026</option>
    `;
    select.value = appState.currentMonth;

    const heroMonth = document.getElementById('hero-month-name');
    if (heroMonth) heroMonth.textContent = select.options[select.selectedIndex]?.text || appState.currentMonth;
  };

  // Dashboard & Leaderboard Renderer (Unified Global Ranking)
  const renderDashboard = () => {
    const { empStats, grandTotalPoints } = calculateTipDistribution();
    const config = appState.tipsConfig[appState.currentMonth] || { totalAmount: 2600 };
    const totalTips = parseFloat(config.totalAmount) || 0;

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

    // Unified Global Ranking (No team filters on Leaderboard tab)
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
          return `
            <div class="podium-step ${stepClass}">
              ${rank === 1 ? '<i data-lucide="crown" class="podium-crown"></i>' : ''}
              <div class="podium-avatar" style="background-color: ${emp.color}">
                ${emp.avatar}
              </div>
              <div class="podium-name">${emp.name}</div>
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

    // Table Renderer (Unified Global Table)
    const tbody = document.getElementById('leaderboard-tbody');
    if (tbody) {
      tbody.innerHTML = '';

      filteredList.forEach((emp, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>#${index + 1}</strong></td>
          <td>
            <div class="staff-info">
              <div class="avatar" style="background-color: ${emp.color}; width: 32px; height: 32px; font-size: 0.85rem;">
                ${emp.avatar}
              </div>
              <div>
                <strong>${emp.name}</strong>
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
          <td>${emp.workedDays} days</td>
          <td><strong>${emp.tipSharePercent.toFixed(2)}%</strong></td>
          <td><strong class="text-green" style="font-size:1.05rem;">${emp.tipAmount.toFixed(2)} €</strong></td>
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

      if (!title) return;

      const newTask = {
        id: 'st-' + Date.now(),
        employeeId: empId,
        title: title,
        category: category,
        points: points
      };

      if (!appState.scheduledDailyTasks) appState.scheduledDailyTasks = [];
      appState.scheduledDailyTasks.push(newTask);

      saveState();
      form.reset();
      showToast("Task assigned to employee daily schedule!");
    });
  };

  // Tasks & Initiatives Renderer (Sub-Tabs & Employee Privacy)
  const renderTasks = () => {
    const isManager = appState.activeRole === 'MANAGER';
    const activeEmp = appState.staff.find(s => s.id === appState.activeRole);

    const schedEmpSelect = document.getElementById('sched-task-employee');
    const bonusEmpSelect = document.getElementById('task-bonus-employee');

    const optionsHTML = appState.staff.map(s => `<option value="${s.id}">${s.name} (${s.title || s.role})</option>`).join('');
    if (schedEmpSelect) schedEmpSelect.innerHTML = optionsHTML;
    if (bonusEmpSelect) bonusEmpSelect.innerHTML = optionsHTML;

    if (!isManager && activeEmp && bonusEmpSelect) {
      bonusEmpSelect.value = activeEmp.id;
      bonusEmpSelect.disabled = true;
    } else if (bonusEmpSelect) {
      bonusEmpSelect.disabled = false;
    }

    // SUB-TAB 1: DAILY TASKS CHECKLIST & SCHEDULER
    const dailyGrid = document.getElementById('daily-tasks-grid');
    if (dailyGrid) {
      dailyGrid.innerHTML = '';

      let visibleScheduledTasks = [...(appState.scheduledDailyTasks || [])];
      if (!isManager && activeEmp) {
        visibleScheduledTasks = visibleScheduledTasks.filter(t => t.employeeId === activeEmp.id);
      }

      if (visibleScheduledTasks.length === 0) {
        dailyGrid.innerHTML = `<p class="text-muted" style="padding:1.5rem; text-align:center;">No daily tasks scheduled ${!isManager ? 'for you' : ''} yet. ${isManager ? 'Use the form above to assign tasks!' : ''}</p>`;
      } else {
        visibleScheduledTasks.forEach(task => {
          const emp = appState.staff.find(s => s.id === task.employeeId) || { name: 'Unknown' };
          const item = document.createElement('div');
          item.className = 'task-item';
          
          item.innerHTML = `
            <div>
              <div class="task-user">${task.title}</div>
              <div class="task-desc">Assigned to: <strong>${emp.name}</strong> (${task.category})</div>
            </div>
            <div style="display:flex; align-items:center; gap:1rem;">
              <span class="task-pts">+${task.points} Coins</span>
              ${!isManager ? `
                <button class="btn btn-primary btn-sm btn-claim-task" data-id="${task.id}" data-desc="${task.title}" data-pts="${task.points}">
                  <i data-lucide="check-circle"></i> Complete Task
                </button>
              ` : `
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

  // Hybrid Tip Calculator Renderer (Coin Proportions + Manual Overrides & % Inputs)
  const renderTips = () => {
    const mKey = appState.currentMonth;
    const config = appState.tipsConfig[mKey] || { totalAmount: 2600 };

    const inputPool = document.getElementById('input-total-tips');
    if (inputPool) inputPool.value = config.totalAmount;

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

        tr.innerHTML = `
          <td>
            <div class="staff-info">
              <div class="avatar" style="background-color: ${emp.color}; width: 32px; height: 32px; font-size: 0.85rem;">
                ${emp.avatar}
              </div>
              <div>
                <strong>${emp.name}</strong>
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

  const renderAll = () => {
    applyTheme();

    // Role-Based Navigation & Visibility Adapter
    const isManager = appState.activeRole === 'MANAGER';
    const roleSelect = document.getElementById('active-role-select');
    if (roleSelect) roleSelect.value = appState.activeRole;

    document.querySelectorAll('[data-manager-only="true"]').forEach(el => {
      if (isManager) {
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

    renderMonthSelector();
    renderDashboard();
    renderPlanning();
    renderTasks();
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

  const switchTab = (tabId) => {
    const isManager = appState.activeRole === 'MANAGER';
    // Prevent employee from navigating to restricted tabs
    if (!isManager && (tabId === 'tips' || tabId === 'staff' || tabId === 'deploy')) {
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
    if (tabId === 'tips' && isManager) renderTips();
    if (tabId === 'staff' && isManager) renderStaff();
  };

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

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
      downloadAnchor.setAttribute("download", `tiprank_resto_backup_${appState.currentMonth}.json`);
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
