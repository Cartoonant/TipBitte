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
    schedules: {}, // { "2026-08": { "emp-2": { 1: true, 2: false, ... } } }
    tasks: [],     // [ { id, employeeId, desc, points, status: 'APPROVED'|'PENDING'|'REJECTED', date } ]
    tipsConfig: {} // { "2026-08": { totalAmount: 2600, rule: 'VALUE_POINTS' } }
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

  const saveState = () => {
    localStorage.setItem('tiprank_resto_state', JSON.stringify(appState));
    renderAll();
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
        totalAmount: 2600,
        rule: 'VALUE_POINTS'
      };
    }

    // Tasks list empty by default until defined together
    appState.tasks = [];

    saveState();
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

  // Tip distribution calculation based on Coins
  const calculateTipDistribution = () => {
    const mKey = appState.currentMonth;
    const config = appState.tipsConfig[mKey] || { totalAmount: 0, rule: 'VALUE_POINTS' };
    const totalAmount = parseFloat(config.totalAmount) || 0;
    const rule = config.rule || 'VALUE_POINTS';

    let totalFrontPoints = 0;
    let totalKitchenPoints = 0;

    const empStats = appState.staff.map(emp => {
      const att = getEmployeeAttendance(emp.id, mKey);
      const points = getEmployeePoints(emp.id);
      
      if (emp.role === 'FRONT') totalFrontPoints += points;
      if (emp.role === 'KITCHEN') totalKitchenPoints += points;

      return {
        ...emp,
        workedDays: att.workedDays,
        workedHours: att.workedHours,
        points: points,
        tipAmount: 0,
        tipSharePercent: 0
      };
    });

    const grandTotalPoints = totalFrontPoints + totalKitchenPoints;

    if (totalAmount <= 0 || grandTotalPoints <= 0) {
      return { empStats, totalFrontPoints, totalKitchenPoints, grandTotalPoints, frontPool: 0, kitchenPool: 0 };
    }

    let frontPool = 0;
    let kitchenPool = 0;

    if (rule.startsWith('VALUE_POINTS_RATIO_')) {
      let frontRatio = 0.60;
      let kitchenRatio = 0.40;

      if (rule === 'VALUE_POINTS_RATIO_65_35') { frontRatio = 0.65; kitchenRatio = 0.35; }
      if (rule === 'VALUE_POINTS_RATIO_70_30') { frontRatio = 0.70; kitchenRatio = 0.30; }

      frontPool = totalAmount * frontRatio;
      kitchenPool = totalAmount * kitchenRatio;

      empStats.forEach(stat => {
        if (stat.role === 'FRONT') {
          stat.tipAmount = totalFrontPoints > 0 ? (stat.points / totalFrontPoints) * frontPool : 0;
        }
        if (stat.role === 'KITCHEN') {
          stat.tipAmount = totalKitchenPoints > 0 ? (stat.points / totalKitchenPoints) * kitchenPool : 0;
        }
      });

    } else {
      // Direct pro-rata of Coins earned
      empStats.forEach(stat => {
        stat.tipAmount = (stat.points / grandTotalPoints) * totalAmount;
      });
      frontPool = (totalFrontPoints / grandTotalPoints) * totalAmount;
      kitchenPool = (totalKitchenPoints / grandTotalPoints) * totalAmount;
    }

    // Percentage share per employee
    empStats.forEach(stat => {
      stat.tipSharePercent = totalAmount > 0 ? ((stat.tipAmount / totalAmount) * 100).toFixed(1) : 0;
    });

    return { empStats, totalFrontPoints, totalKitchenPoints, grandTotalPoints, frontPool, kitchenPool };
  };

  // ==========================================
  // 4. UI RENDERERS (VIEWS)
  // ==========================================

  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', appState.theme);
  };

  const renderMonthSelector = () => {
    const select = document.getElementById('current-month-select');
    select.innerHTML = '';

    const months = [
      { key: '2026-08', label: 'August 2026' },
      { key: '2026-09', label: 'September 2026' },
      { key: '2026-10', label: 'October 2026' }
    ];

    months.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.key;
      opt.textContent = m.label;
      if (m.key === appState.currentMonth) opt.selected = true;
      select.appendChild(opt);
    });

    document.getElementById('hero-month-name').textContent = select.options[select.selectedIndex]?.text || appState.currentMonth;
  };

  // Dashboard & Leaderboard Renderer (Unified Global Ranking)
  const renderDashboard = () => {
    const { empStats, grandTotalPoints } = calculateTipDistribution();
    const config = appState.tipsConfig[appState.currentMonth] || { totalAmount: 0 };
    const totalTips = parseFloat(config.totalAmount) || 0;

    // Overview Cards
    document.getElementById('stat-total-tips').textContent = `${totalTips.toLocaleString('en-US', { minimumFractionDigits: 2 })} €`;
    const ratePerCoin = grandTotalPoints > 0 ? (totalTips / grandTotalPoints).toFixed(2) : '0.00';
    document.getElementById('stat-tips-rate').textContent = `${ratePerCoin} € / Coin`;

    document.getElementById('stat-total-hours').textContent = `${grandTotalPoints} Coins`;

    const approvedTasks = appState.tasks.filter(t => t.status === 'APPROVED');
    document.getElementById('stat-completed-tasks').textContent = approvedTasks.length;
    document.getElementById('stat-points-earned').textContent = `${approvedTasks.length} entries approved`;

    const frontCount = appState.staff.filter(s => s.role === 'FRONT').length;
    const kitchenCount = appState.staff.filter(s => s.role === 'KITCHEN').length;
    document.getElementById('stat-staff-count').textContent = appState.staff.length;
    document.getElementById('stat-team-breakdown').textContent = `${frontCount} Front / ${kitchenCount} Kitchen`;

    // Unified Global Ranking (No team filters on Leaderboard tab)
    let filteredList = [...empStats];
    filteredList.sort((a, b) => b.points - a.points);

    // Podium Renderer (Top 3)
    const podiumContainer = document.getElementById('podium-container');
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

    // Table Renderer (Unified Global Table)
    const tbody = document.getElementById('leaderboard-tbody');
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
        <td><strong>${emp.tipSharePercent}%</strong></td>
        <td><strong class="text-green" style="font-size:1.05rem;">${emp.tipAmount.toFixed(2)} €</strong></td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
  };

  // Roster / Planning Renderer (Vertical Week-by-Week & Role-Based Permissions)
  let selectedWeek = 'ALL';

  const renderPlanning = () => {
    const container = document.getElementById('roster-weekly-container');
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

    // August 2026 Weeks Definition
    const weeks = [
      { id: '1', title: 'Week 1 (Aug 1 - Aug 7)', start: 1, end: 7 },
      { id: '2', title: 'Week 2 (Aug 8 - Aug 14)', start: 8, end: 14 },
      { id: '3', title: 'Week 3 (Aug 15 - Aug 21)', start: 15, end: 21 },
      { id: '4', title: 'Week 4 (Aug 22 - Aug 28)', start: 22, end: 28 },
      { id: '5', title: 'Week 5 (Aug 29 - Aug 31)', start: 29, end: totalDaysInMonth }
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

  // Week Selector Listener
  document.querySelectorAll('.week-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.week-filter').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      selectedWeek = e.currentTarget.dataset.week;
      renderPlanning();
    });
  });

  // Tasks & Initiatives Renderer (Role-Based Access)
  const renderTasks = () => {
    const isManager = appState.activeRole === 'MANAGER';
    const activeEmp = appState.staff.find(s => s.id === appState.activeRole);

    const selectFixed = document.getElementById('task-fixed-employee');
    const selectBonus = document.getElementById('task-bonus-employee');

    const optionsHTML = appState.staff.map(s => `<option value="${s.id}">${s.name} (${s.title || s.role})</option>`).join('');
    selectFixed.innerHTML = optionsHTML;
    selectBonus.innerHTML = optionsHTML;

    // View Adapters for Manager vs Employee
    const managerBlock = document.getElementById('manager-tasks-dashboard');
    const empProfileCard = document.getElementById('employee-profile-card');
    const empSubmissionsBlock = document.getElementById('employee-submissions-block');

    if (isManager) {
      // Manager View
      managerBlock.classList.remove('hidden');
      empProfileCard.classList.add('hidden');
      empSubmissionsBlock.classList.add('hidden');

      selectFixed.disabled = false;
      selectBonus.disabled = false;
    } else if (activeEmp) {
      // Employee View
      managerBlock.classList.add('hidden');
      empProfileCard.classList.remove('hidden');
      empSubmissionsBlock.classList.remove('hidden');

      // Populate Employee Profile Card
      document.getElementById('emp-profile-avatar').textContent = activeEmp.avatar;
      document.getElementById('emp-profile-avatar').style.backgroundColor = activeEmp.color;
      document.getElementById('emp-profile-name').textContent = activeEmp.name;
      document.getElementById('emp-profile-role').textContent = `${activeEmp.role === 'FRONT' ? 'Front (Floor/Bar)' : 'Kitchen'} - ${activeEmp.title}`;
      document.getElementById('emp-profile-role').className = `badge ${activeEmp.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}`;

      const empCoins = getEmployeePoints(activeEmp.id);
      document.getElementById('emp-profile-coins').textContent = `${empCoins} Coins`;

      // Calculate Rank
      const { empStats } = calculateTipDistribution();
      const sorted = [...empStats].sort((a, b) => b.points - a.points);
      const rank = sorted.findIndex(s => s.id === activeEmp.id) + 1;
      document.getElementById('emp-profile-rank').textContent = `#${rank > 0 ? rank : 1}`;

      // Auto-set and lock employee selection
      selectFixed.value = activeEmp.id;
      selectBonus.value = activeEmp.id;
      selectFixed.disabled = true;
      selectBonus.disabled = true;

      // Render Employee Submitted Entries List
      const empSubmissionsList = document.getElementById('employee-submissions-list');
      empSubmissionsList.innerHTML = '';

      const myEntries = appState.tasks.filter(t => t.employeeId === activeEmp.id).reverse();
      if (myEntries.length === 0) {
        empSubmissionsList.innerHTML = `<p class="text-muted" style="padding:1rem; text-align:center;">You haven't submitted any tasks or initiatives yet this month.</p>`;
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

    // Manager View: Pending Approvals Feed
    const pendingTasks = appState.tasks.filter(t => t.status === 'PENDING');
    const pendingBadge = document.getElementById('pending-badge');
    const pendingCountBadge = document.getElementById('pending-count-badge');
    const mobilePendingDot = document.getElementById('mobile-pending-dot');

    if (pendingTasks.length > 0) {
      pendingBadge.textContent = pendingTasks.length;
      pendingBadge.classList.remove('hidden');
      pendingCountBadge.textContent = `${pendingTasks.length} pending`;
      mobilePendingDot.classList.remove('hidden');
    } else {
      pendingBadge.classList.add('hidden');
      pendingCountBadge.textContent = `0 pending`;
      mobilePendingDot.classList.add('hidden');
    }

    const pendingList = document.getElementById('pending-tasks-list');
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

    // Manager View: Approved Tasks History
    const validatedTasks = appState.tasks.filter(t => t.status === 'APPROVED').reverse();
    const historyList = document.getElementById('validated-tasks-list');
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

    if (window.lucide) lucide.createIcons();
  };

  // Tip Calculator Renderer
  const renderTips = () => {
    const config = appState.tipsConfig[appState.currentMonth] || { totalAmount: 0, rule: 'VALUE_POINTS' };
    document.getElementById('input-total-tips').value = config.totalAmount || '';
    document.getElementById('tip-distribution-rule').value = config.rule || 'VALUE_POINTS';

    const { empStats, frontPool, kitchenPool, totalFrontPoints, totalKitchenPoints } = calculateTipDistribution();

    document.getElementById('summary-front-amount').textContent = `${frontPool.toFixed(2)} €`;
    document.getElementById('summary-front-sub').textContent = `${totalFrontPoints} Coins earned (Front)`;

    document.getElementById('summary-kitchen-amount').textContent = `${kitchenPool.toFixed(2)} €`;
    document.getElementById('summary-kitchen-sub').textContent = `${totalKitchenPoints} Coins earned (Kitchen)`;

    const tbody = document.getElementById('tips-detail-tbody');
    tbody.innerHTML = '';

    empStats.forEach(emp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong>${emp.name}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">${emp.title || ''}</div>
        </td>
        <td>
          <span class="badge ${emp.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}">
            ${emp.role === 'FRONT' ? 'Front' : 'Kitchen'}
          </span>
        </td>
        <td><strong class="text-gold">${emp.points} Coins</strong></td>
        <td>${emp.workedDays} d (${emp.workedHours}h)</td>
        <td><strong>${emp.tipSharePercent}%</strong></td>
        <td><strong class="text-green" style="font-size:1.1rem;">${emp.tipAmount.toFixed(2)} €</strong></td>
      `;
      tbody.appendChild(tr);
    });
  };

  // Staff Management Renderer
  const renderStaff = () => {
    const grid = document.getElementById('staff-list-grid');
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

  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.currentTarget.classList.contains('planning-filter')) return;
      document.querySelectorAll('.pill-btn:not(.planning-filter)').forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
      appState.activeFilter = e.currentTarget.dataset.filter;
      renderDashboard();
    });
  });

  document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    saveState();
  });

  document.getElementById('current-month-select').addEventListener('change', (e) => {
    appState.currentMonth = e.target.value;
    saveState();
    showToast(`Month switched to ${e.target.options[e.target.selectedIndex].text}`);
  });

  // Submit Fixed Task
  document.getElementById('btn-submit-fixed-task').addEventListener('click', () => {
    const empId = document.getElementById('task-fixed-employee').value;
    const preset = document.getElementById('task-fixed-preset').value;

    let pts = 20;
    if (preset.includes('+15')) pts = 15;
    if (preset.includes('+25')) pts = 25;
    if (preset.includes('+30')) pts = 30;

    appState.tasks.push({
      id: 'task-' + Date.now(),
      employeeId: empId,
      desc: preset,
      points: pts,
      status: 'PENDING',
      timestamp: Date.now()
    });

    saveState();
    showToast("Task completion submitted for manager approval!");
  });

  // Submit Bonus Initiative
  document.getElementById('form-bonus-task').addEventListener('submit', (e) => {
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

  // Save Tip Parameters
  document.getElementById('btn-save-tips').addEventListener('click', () => {
    const totalAmount = parseFloat(document.getElementById('input-total-tips').value) || 0;
    const rule = document.getElementById('tip-distribution-rule').value;

    appState.tipsConfig[appState.currentMonth] = { totalAmount, rule };
    saveState();
    showToast("Tip parameters updated and shares recalculated!");
  });

  document.getElementById('btn-print-tips').addEventListener('click', () => {
    window.print();
  });

  // Add Staff Member
  document.getElementById('form-add-staff').addEventListener('submit', (e) => {
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

  // Export JSON Backup
  document.getElementById('btn-export-data').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tiprank_resto_backup_${appState.currentMonth}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("JSON backup file downloaded!");
  });

  // Import JSON Backup
  document.getElementById('input-import-data').addEventListener('change', (e) => {
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

  document.getElementById('btn-load-demo').addEventListener('click', () => {
    if (confirm("Reset application with default restaurant demo data?")) {
      initDefaultState();
      showToast("Demo data reloaded!");
    }
  });

  document.getElementById('btn-reset-month').addEventListener('click', () => {
    if (confirm("Warning: This will reset tasks and roster schedules for the current month. Proceed?")) {
      delete appState.schedules[appState.currentMonth];
      delete appState.tipsConfig[appState.currentMonth];
      appState.tasks = [];
      saveState();
      showToast("Current month data reset.");
    }
  });

  // Roster Filter Actions
  document.querySelectorAll('.planning-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.planning-filter').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      planningFilter = e.currentTarget.dataset.planFilter;
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
    document.getElementById('winner-days').textContent = `${winner.workedDays} d (${winner.workedHours}h)`;
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

  document.getElementById('btn-reveal-winner').addEventListener('click', triggerWinnerModal);
  document.getElementById('btn-celebrate-again').addEventListener('click', launchConfetti);
  document.getElementById('btn-close-winner').addEventListener('click', () => {
    document.getElementById('modal-winner').classList.add('hidden');
  });

  const showToast = (message) => {
    const container = document.getElementById('toast-container');
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

  // Initial Run
  loadState();
  renderAll();

});
