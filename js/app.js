/**
 * TipRank Resto - Core Application Logic
 * Application Web Interne de Gestion des Tips & Employé du Mois (Front & Kitchen)
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. ÉTAT INITIAL ET DONNÉES DU PERSONNEL RÉEL
  // ==========================================

  const DEFAULT_STAFF = [
    // Équipe Front (Salle / Bar)
    { id: 'emp-1', name: 'Vinod', role: 'FRONT', color: '#3b82f6', avatar: 'VN' },
    { id: 'emp-2', name: 'Siri', role: 'FRONT', color: '#8b5cf6', avatar: 'SR' },
    { id: 'emp-3', name: 'Bruno', role: 'FRONT', color: '#06b6d4', avatar: 'BR' },
    
    // Équipe Kitchen (Cuisine)
    { id: 'emp-4', name: 'Aadhi', role: 'KITCHEN', color: '#ec4899', avatar: 'AD' },
    { id: 'emp-5', name: 'Bhanu', role: 'KITCHEN', color: '#f59e0b', avatar: 'BH' },
    { id: 'emp-6', name: 'Karthik', role: 'KITCHEN', color: '#10b981', avatar: 'KR' },
    { id: 'emp-7', name: 'Muthyam', role: 'KITCHEN', color: '#6366f1', avatar: 'MT' }
  ];

  // Helper pour générer un mois au format YYYY-MM
  const getCurrentMonthKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const getDaysInMonth = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  // State global
  let appState = {
    currentMonth: getCurrentMonthKey(),
    theme: 'dark',
    activeFilter: 'ALL',
    staff: [],
    schedules: {}, // { "2026-07": { "emp-1": { 1: true, 2: false, ... } } }
    tasks: [],     // [ { id, employeeId, desc, points, status: 'APPROVED'|'PENDING'|'REJECTED', date } ]
    tipsConfig: {} // { "2026-07": { totalAmount: 1850, rule: 'RATIO_60_40' } }
  };

  // ==========================================
  // 2. GESTION DU STORAGE & DÉMO
  // ==========================================

  const loadState = () => {
    const saved = localStorage.getItem('tiprank_resto_state');
    if (saved) {
      try {
        appState = JSON.parse(saved);
        if (!appState.currentMonth) appState.currentMonth = getCurrentMonthKey();
        // Vérifier si le staff et les plannings sont au format avec les jours OFF réels
        if (!appState.staff || appState.staff.length === 0 || !appState.staff.some(s => s.name === 'Vinod')) {
          initDefaultState();
        }
      } catch (e) {
        console.error("Erreur de lecture du LocalStorage", e);
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
    appState.tasks = [];
    appState.schedules = {};
    appState.tipsConfig = {};
    appState.theme = 'dark';
    
    // Génération automatique d'un jeu de données réalistes pour le staff du restaurant
    generateDemoData();
  };

  // Rôle et jours de repos hebdomadaires réels pour chaque employé
  // JS Date.getDay(): 0=Dimanche, 1=Lundi, 2=Mardi, 3=Mercredi, 4=Jeudi, 5=Vendredi, 6=Samedi
  const DEFAULT_OFF_DAYS_CONFIG = {
    'emp-1': [4],       // Vinod -> Jeudi
    'emp-2': [2, 3],    // Siri -> Mardi, Mercredi
    'emp-3': [1],       // Bruno -> Lundi
    'emp-4': [4],       // Aadhi -> Jeudi
    'emp-5': [2],       // Bhanu -> Mardi
    'emp-6': [1],       // Karthik -> Lundi
    'emp-7': [3]        // Muthyam -> Mercredi
  };

  const getDayOfWeekAbbr = (year, month, day) => {
    const date = new Date(year, month - 1, day);
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[date.getDay()];
  };

  const generateDemoData = () => {
    const mKey = appState.currentMonth;
    const daysCount = getDaysInMonth(mKey);
    const [year, month] = mKey.split('-').map(Number);

    // Initialiser les plannings avec les repos hebdomadaires réels transmis
    if (!appState.schedules[mKey]) {
      appState.schedules[mKey] = {};
      appState.staff.forEach((emp) => {
        appState.schedules[mKey][emp.id] = {};
        const empOffWeekdays = DEFAULT_OFF_DAYS_CONFIG[emp.id] || [];

        for (let d = 1; d <= daysCount; d++) {
          const date = new Date(year, month - 1, d);
          const dayOfWeek = date.getDay();
          // Est OFF si le jour de la semaine correspond à son jour de repos fixe
          const isOff = empOffWeekdays.includes(dayOfWeek);
          appState.schedules[mKey][emp.id][d] = !isOff;
        }
      });
    }

    // Config Tips par défaut (ex: 2450 € distribuer)
    if (!appState.tipsConfig[mKey]) {
      appState.tipsConfig[mKey] = {
        totalAmount: 2450,
        rule: 'RATIO_60_40'
      };
    }

    // Tâches de démonstration attribuées au personnel réel
    appState.tasks = [
      { id: 't-1', employeeId: 'emp-1', desc: 'Front (Vinod): Clôture caisse & rangement bar (+15 pts)', points: 15, status: 'APPROVED', timestamp: Date.now() - 36000000 },
      { id: 't-2', employeeId: 'emp-4', desc: 'Kitchen (Aadhi): Nettoyage approfondi cuisine & désinfection (+15 pts)', points: 15, status: 'APPROVED', timestamp: Date.now() - 32000000 },
      { id: 't-3', employeeId: 'emp-2', desc: 'Front (Siri): Gestion de banquet 30 personnes avec zéro erreur', points: 25, status: 'APPROVED', timestamp: Date.now() - 24000000 },
      { id: 't-4', employeeId: 'emp-5', desc: 'Kitchen (Bhanu): Préparation mise en place du soir exceptionnelle', points: 20, status: 'APPROVED', timestamp: Date.now() - 12000000 },
      { id: 't-5', employeeId: 'emp-3', desc: 'Front (Bruno): Réassort complet des frigos & inventaire boisson (+10 pts)', points: 10, status: 'APPROVED', timestamp: Date.now() - 8000000 },
      { id: 't-6', employeeId: 'emp-6', desc: 'Kitchen (Karthik): Remplacement d\'un collègue sur repos (+25 pts)', points: 25, status: 'APPROVED', timestamp: Date.now() - 5000000 },
      { id: 't-7', employeeId: 'emp-7', desc: 'Kitchen (Muthyam): Optimisation du poste de grillade pendant le rush', points: 20, status: 'PENDING', timestamp: Date.now() - 3600000 },
      { id: 't-8', employeeId: 'emp-1', desc: 'Front (Vinod): Compliment client rédigé sur Google Avis (+20 pts)', points: 20, status: 'PENDING', timestamp: Date.now() - 1800000 }
    ];

    saveState();
  };

  // ==========================================
  // 3. MOTEUR DE CALCULS & MÉTRIQUES
  // ==========================================

  // Calcul du nombre de jours travaillés et des heures (11h/shift) pour un employé
  const getEmployeeAttendance = (empId, monthKey = appState.currentMonth) => {
    const daysMap = appState.schedules[monthKey]?.[empId] || {};
    const workedDays = Object.values(daysMap).filter(isWorked => isWorked === true).length;
    return {
      workedDays,
      workedHours: workedDays * 11
    };
  };

  // Calcul du total des points de tâches validées pour un employé
  const getEmployeePoints = (empId) => {
    return appState.tasks
      .filter(t => t.employeeId === empId && t.status === 'APPROVED')
      .reduce((sum, t) => sum + (t.points || 0), 0);
  };

  // Calculateur général des Tips par Employé
  const calculateTipDistribution = () => {
    const mKey = appState.currentMonth;
    const config = appState.tipsConfig[mKey] || { totalAmount: 0, rule: 'RATIO_60_40' };
    const totalAmount = parseFloat(config.totalAmount) || 0;
    const rule = config.rule;

    let totalFrontHours = 0;
    let totalKitchenHours = 0;

    const empStats = appState.staff.map(emp => {
      const att = getEmployeeAttendance(emp.id, mKey);
      if (emp.role === 'FRONT') totalFrontHours += att.workedHours;
      if (emp.role === 'KITCHEN') totalKitchenHours += att.workedHours;
      return {
        ...emp,
        workedDays: att.workedDays,
        workedHours: att.workedHours,
        points: getEmployeePoints(emp.id),
        tipAmount: 0,
        tipSharePercent: 0
      };
    });

    const grandTotalHours = totalFrontHours + totalKitchenHours;

    if (totalAmount <= 0 || grandTotalHours <= 0) {
      return { empStats, totalFrontHours, totalKitchenHours, grandTotalHours, frontPool: 0, kitchenPool: 0 };
    }

    let frontPool = 0;
    let kitchenPool = 0;

    if (rule === 'EQUAL_HOURLY') {
      const hourlyRate = totalAmount / grandTotalHours;
      empStats.forEach(stat => {
        stat.tipAmount = stat.workedHours * hourlyRate;
      });
      frontPool = totalFrontHours * hourlyRate;
      kitchenPool = totalKitchenHours * hourlyRate;

    } else if (rule.startsWith('RATIO_')) {
      let frontRatio = 0.60;
      let kitchenRatio = 0.40;

      if (rule === 'RATIO_65_35') { frontRatio = 0.65; kitchenRatio = 0.35; }
      if (rule === 'RATIO_70_30') { frontRatio = 0.70; kitchenRatio = 0.30; }

      frontPool = totalAmount * frontRatio;
      kitchenPool = totalAmount * kitchenRatio;

      const frontHourlyRate = totalFrontHours > 0 ? frontPool / totalFrontHours : 0;
      const kitchenHourlyRate = totalKitchenHours > 0 ? kitchenPool / totalKitchenHours : 0;

      empStats.forEach(stat => {
        if (stat.role === 'FRONT') stat.tipAmount = stat.workedHours * frontHourlyRate;
        if (stat.role === 'KITCHEN') stat.tipAmount = stat.workedHours * kitchenHourlyRate;
      });

    } else if (rule === 'PERFORMANCE_BONUS') {
      // 90% aux heures, 10% cagnotte top 3
      const basePool = totalAmount * 0.90;
      const bonusPool = totalAmount * 0.10;
      const baseHourlyRate = basePool / grandTotalHours;

      // Classer temporairement par points
      const sortedByPoints = [...empStats].sort((a, b) => b.points - a.points);
      const top3 = sortedByPoints.slice(0, 3);
      const bonusShares = [0.50, 0.30, 0.20]; // 50% au 1er, 30% au 2e, 20% au 3e

      empStats.forEach(stat => {
        let tip = stat.workedHours * baseHourlyRate;
        const topIndex = top3.findIndex(t => t.id === stat.id);
        if (topIndex !== -1 && bonusShares[topIndex]) {
          tip += bonusPool * bonusShares[topIndex];
        }
        stat.tipAmount = tip;
      });
    }

    // Calcul du % de chaque employé
    empStats.forEach(stat => {
      stat.tipSharePercent = totalAmount > 0 ? ((stat.tipAmount / totalAmount) * 100).toFixed(1) : 0;
    });

    return { empStats, totalFrontHours, totalKitchenHours, grandTotalHours, frontPool, kitchenPool };
  };

  // ==========================================
  // 4. RENDUS D'INTERFACES (VIEWS)
  // ==========================================

  // Synchroniser le Thème
  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', appState.theme);
  };

  // Rendu du Sélecteur de Mois
  const renderMonthSelector = () => {
    const select = document.getElementById('current-month-select');
    select.innerHTML = '';

    const months = [
      { key: '2026-07', label: 'Juillet 2026' },
      { key: '2026-08', label: 'Août 2026' },
      { key: '2026-09', label: 'Septembre 2026' }
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

  // Rendu de l'onglet Dashboard & Leaderboard
  const renderDashboard = () => {
    const { empStats, grandTotalHours, totalFrontHours, totalKitchenHours } = calculateTipDistribution();
    const config = appState.tipsConfig[appState.currentMonth] || { totalAmount: 0 };
    const totalTips = parseFloat(config.totalAmount) || 0;

    // Mise à jour des cartes de métriques
    document.getElementById('stat-total-tips').textContent = `${totalTips.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`;
    const hourlyTipsRate = grandTotalHours > 0 ? (totalTips / grandTotalHours).toFixed(2) : '0.00';
    document.getElementById('stat-tips-rate').textContent = `${hourlyTipsRate} € / heure travaillée`;

    document.getElementById('stat-total-hours').textContent = `${grandTotalHours} h`;
    document.getElementById('stat-total-shifts').textContent = `${Math.round(grandTotalHours / 11)} shifts de 11h`;

    const approvedTasks = appState.tasks.filter(t => t.status === 'APPROVED');
    const totalPoints = approvedTasks.reduce((sum, t) => sum + (t.points || 0), 0);
    document.getElementById('stat-completed-tasks').textContent = approvedTasks.length;
    document.getElementById('stat-points-earned').textContent = `${totalPoints} pts accumulés`;

    const frontCount = appState.staff.filter(s => s.role === 'FRONT').length;
    const kitchenCount = appState.staff.filter(s => s.role === 'KITCHEN').length;
    document.getElementById('stat-staff-count').textContent = appState.staff.length;
    document.getElementById('stat-team-breakdown').textContent = `${frontCount} Front / ${kitchenCount} Kitchen`;

    // Filtrage pour le classement
    let filteredList = [...empStats];
    if (appState.activeFilter !== 'ALL') {
      filteredList = filteredList.filter(e => e.role === appState.activeFilter);
    }

    // Tri par score total (Points + Bonus présence)
    filteredList.sort((a, b) => {
      const scoreA = a.points + (a.workedDays * 2);
      const scoreB = b.points + (b.workedDays * 2);
      return scoreB - scoreA;
    });

    // Rendu du Podium (Top 3)
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
            <div class="podium-pts">${emp.points} pts</div>
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
      podiumContainer.innerHTML = `<p class="text-muted">Ajoutez au moins 2 employés pour débloquer le podium !</p>`;
    }

    // Rendu du Tableau
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
            <strong>${emp.name}</strong>
          </div>
        </td>
        <td>
          <span class="badge ${emp.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}">
            ${emp.role === 'FRONT' ? 'Front (Salle)' : 'Kitchen (Cuisine)'}
          </span>
        </td>
        <td>${emp.workedDays} jours</td>
        <td>${emp.workedHours} h</td>
        <td><strong class="text-gold">${emp.points} pts</strong></td>
        <td><strong>${emp.tipAmount.toFixed(2)} €</strong> (${emp.tipSharePercent}%)</td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
  };

  // Rendu de l'onglet Planning (Jours OFF)
  let planningFilter = 'ALL';

  const renderPlanning = () => {
    const table = document.getElementById('planning-table');
    table.innerHTML = '';

    const daysCount = getDaysInMonth(appState.currentMonth);
    const monthSchedules = appState.schedules[appState.currentMonth] || {};

    // Filtrage des employés selon le filtre du planning
    let staffList = [...appState.staff];
    if (planningFilter !== 'ALL') {
      staffList = staffList.filter(s => s.role === planningFilter);
    }

    // Calcul des métriques globales de l'équipe
    let totalTeamWorkedDays = 0;
    let totalTeamHours = 0;

    staffList.forEach(emp => {
      const att = getEmployeeAttendance(emp.id, appState.currentMonth);
      totalTeamWorkedDays += att.workedDays;
      totalTeamHours += att.workedHours;
    });

    const avgDays = staffList.length > 0 ? (totalTeamWorkedDays / staffList.length).toFixed(1) : 0;
    const avgHours = staffList.length > 0 ? Math.round(totalTeamHours / staffList.length) : 0;

    document.getElementById('plan-total-staff').textContent = `${staffList.length} membres (${planningFilter === 'ALL' ? 'Front & Kitchen' : planningFilter})`;
    document.getElementById('plan-total-team-hours').textContent = `${totalTeamHours} h (${totalTeamWorkedDays} shifts)`;
    document.getElementById('plan-avg-days').textContent = `${avgDays} jours (${avgHours}h)`;

    // Header : Employé + Jours 1..N avec jour de la semaine + Total Heures
    const [year, month] = appState.currentMonth.split('-').map(Number);
    let headerHTML = `<thead><tr><th class="cell-name">Membre de l'Équipe</th>`;
    for (let d = 1; d <= daysCount; d++) {
      const dayAbbr = getDayOfWeekAbbr(year, month, d);
      headerHTML += `<th><span style="font-size:0.65rem; color:var(--text-muted); display:block; font-weight:600;">${dayAbbr}</span>${d}</th>`;
    }
    headerHTML += `<th>Total Jours</th><th>Total Heures</th></tr></thead>`;

    let bodyHTML = `<tbody>`;

    if (staffList.length === 0) {
      bodyHTML += `<tr><td colspan="${daysCount + 3}" style="text-align:center; padding:2rem;" class="text-muted">Aucun employé dans cette catégorie.</td></tr>`;
    } else {
      staffList.forEach(emp => {
        const empSchedule = monthSchedules[emp.id] || {};
        let workedDays = 0;

        let rowHTML = `<tr><td class="cell-name">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="dot" style="background:${emp.color}"></span>
            <span>${emp.name}</span>
            <span class="badge ${emp.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}" style="font-size:0.65rem; padding:0.1rem 0.4rem;">
              ${emp.role}
            </span>
          </div>
        </td>`;

        for (let d = 1; d <= daysCount; d++) {
          const isWorked = empSchedule[d] !== false; // true par défaut
          if (isWorked) workedDays++;

          rowHTML += `
            <td class="shift-cell ${isWorked ? 'is-work' : 'is-off'}" 
                data-emp="${emp.id}" 
                data-day="${d}" 
                title="${isWorked ? 'Shift 11h30-22h30 (11h travaillées)' : 'Jour OFF (Repos)'}">
              ${isWorked ? '11h' : 'OFF'}
            </td>
          `;
        }

        const totalHours = workedDays * 11;
        rowHTML += `<td><strong>${workedDays} j</strong></td><td><strong class="text-blue">${totalHours} h</strong></td></tr>`;
        bodyHTML += rowHTML;
      });
    }

    bodyHTML += `</tbody>`;
    table.innerHTML = headerHTML + bodyHTML;

    // Ajouter les listeners de clic sur chaque case
    table.querySelectorAll('.shift-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
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
        showToast("Planning mis à jour !");
      });
    });
  };

  // Event Listeners Spécifiques au Planning
  document.querySelectorAll('.planning-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.planning-filter').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      planningFilter = e.currentTarget.dataset.planFilter;
      renderPlanning();
    });
  });

  document.getElementById('btn-plan-all-work').addEventListener('click', () => {
    const daysCount = getDaysInMonth(appState.currentMonth);
    if (!appState.schedules[appState.currentMonth]) appState.schedules[appState.currentMonth] = {};
    
    appState.staff.forEach(emp => {
      appState.schedules[appState.currentMonth][emp.id] = {};
      for (let d = 1; d <= daysCount; d++) {
        appState.schedules[appState.currentMonth][emp.id][d] = true;
      }
    });

    saveState();
    showToast("Tous les jours marqués comme travaillés !");
  });

  document.getElementById('btn-plan-standard-off').addEventListener('click', () => {
    const daysCount = getDaysInMonth(appState.currentMonth);
    const [year, month] = appState.currentMonth.split('-').map(Number);
    if (!appState.schedules[appState.currentMonth]) appState.schedules[appState.currentMonth] = {};
    
    appState.staff.forEach((emp) => {
      appState.schedules[appState.currentMonth][emp.id] = {};
      const empOffWeekdays = DEFAULT_OFF_DAYS_CONFIG[emp.id] || [];

      for (let d = 1; d <= daysCount; d++) {
        const date = new Date(year, month - 1, d);
        const dayOfWeek = date.getDay();
        const isOff = empOffWeekdays.includes(dayOfWeek);
        appState.schedules[appState.currentMonth][emp.id][d] = !isOff;
      }
    });

    saveState();
    showToast("Planning des repos réels de l'équipe appliqué avec succès !");
  });

  // Rendu de l'onglet Tâches & Validation
  const renderTasks = () => {
    // Selects d'employés
    const selectFixed = document.getElementById('task-fixed-employee');
    const selectBonus = document.getElementById('task-bonus-employee');

    const optionsHTML = appState.staff.map(s => `<option value="${s.id}">${s.name} (${s.role})</option>`).join('');
    selectFixed.innerHTML = optionsHTML;
    selectBonus.innerHTML = optionsHTML;

    // Badges en attente
    const pendingTasks = appState.tasks.filter(t => t.status === 'PENDING');
    const pendingBadge = document.getElementById('pending-badge');
    const pendingCountBadge = document.getElementById('pending-count-badge');
    const mobilePendingDot = document.getElementById('mobile-pending-dot');

    if (pendingTasks.length > 0) {
      pendingBadge.textContent = pendingTasks.length;
      pendingBadge.classList.remove('hidden');
      pendingCountBadge.textContent = `${pendingTasks.length} en attente`;
      mobilePendingDot.classList.remove('hidden');
    } else {
      pendingBadge.classList.add('hidden');
      pendingCountBadge.textContent = `0 en attente`;
      mobilePendingDot.classList.add('hidden');
    }

    // Liste des tâches à valider
    const pendingList = document.getElementById('pending-tasks-list');
    pendingList.innerHTML = '';

    if (pendingTasks.length === 0) {
      pendingList.innerHTML = `<p class="text-muted" style="padding:1rem; text-align:center;">Aucune tâche en attente de validation par le manager. 👍</p>`;
    } else {
      pendingTasks.forEach(task => {
        const emp = appState.staff.find(s => s.id === task.employeeId) || { name: 'Inconnu' };
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = `
          <div>
            <div class="task-user">${emp.name}</div>
            <div class="task-desc">${task.desc}</div>
          </div>
          <div style="display:flex; align-items:center; gap:1rem;">
            <span class="task-pts">+${task.points} pts</span>
            <div class="task-actions">
              <button class="btn btn-success btn-sm btn-approve" data-id="${task.id}"><i data-lucide="check"></i> Valider</button>
              <button class="btn btn-danger-outline btn-sm btn-reject" data-id="${task.id}"><i data-lucide="x"></i> Refuser</button>
            </div>
          </div>
        `;
        pendingList.appendChild(item);
      });
    }

    // Historique des tâches validées
    const validatedTasks = appState.tasks.filter(t => t.status === 'APPROVED').reverse();
    const historyList = document.getElementById('validated-tasks-list');
    historyList.innerHTML = '';

    if (validatedTasks.length === 0) {
      historyList.innerHTML = `<p class="text-muted">Aucune tâche validée ce mois-ci.</p>`;
    } else {
      validatedTasks.slice(0, 8).forEach(task => {
        const emp = appState.staff.find(s => s.id === task.employeeId) || { name: 'Inconnu' };
        const item = document.createElement('div');
        item.className = 'task-item';
        item.style.opacity = '0.85';
        item.innerHTML = `
          <div>
            <div class="task-user">${emp.name}</div>
            <div class="task-desc">${task.desc}</div>
          </div>
          <span class="badge badge-purple">+${task.points} pts validés</span>
        `;
        historyList.appendChild(item);
      });
    }

    // Attach Event Listeners pour boutons Valider/Refuser
    pendingList.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.currentTarget.dataset.id;
        const task = appState.tasks.find(t => t.id === taskId);
        if (task) {
          task.status = 'APPROVED';
          saveState();
          showToast("Tâche validée avec succès !");
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
          showToast("Tâche refusée.");
        }
      });
    });

    if (window.lucide) lucide.createIcons();
  };

  // Rendu de l'onglet Tips Calculator
  const renderTips = () => {
    const config = appState.tipsConfig[appState.currentMonth] || { totalAmount: 0, rule: 'RATIO_60_40' };
    document.getElementById('input-total-tips').value = config.totalAmount || '';
    document.getElementById('tip-distribution-rule').value = config.rule || 'RATIO_60_40';

    const { empStats, frontPool, kitchenPool, totalFrontHours, totalKitchenHours } = calculateTipDistribution();

    document.getElementById('summary-front-amount').textContent = `${frontPool.toFixed(2)} €`;
    document.getElementById('summary-front-sub').textContent = `${totalFrontHours}h cumulées salle & bar`;

    document.getElementById('summary-kitchen-amount').textContent = `${kitchenPool.toFixed(2)} €`;
    document.getElementById('summary-kitchen-sub').textContent = `${totalKitchenHours}h cumulées cuisine`;

    const tbody = document.getElementById('tips-detail-tbody');
    tbody.innerHTML = '';

    empStats.forEach(emp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${emp.name}</strong></td>
        <td>
          <span class="badge ${emp.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}">
            ${emp.role === 'FRONT' ? 'Front' : 'Kitchen'}
          </span>
        </td>
        <td>${emp.workedDays} jours</td>
        <td>${emp.workedHours} h</td>
        <td><strong>${emp.tipSharePercent}%</strong></td>
        <td><strong class="text-green" style="font-size:1.1rem;">${emp.tipAmount.toFixed(2)} €</strong></td>
      `;
      tbody.appendChild(tr);
    });
  };

  // Rendu de la gestion d'Équipe
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
            <div>
              <span class="badge ${emp.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}" style="margin-top:0.25rem;">
                ${emp.role === 'FRONT' ? 'Front (Salle)' : 'Kitchen (Cuisine)'}
              </span>
            </div>
          </div>
        </div>
        <button class="btn-icon btn-delete-staff" data-id="${emp.id}" title="Supprimer" style="color:var(--color-danger)">
          <i data-lucide="trash-2"></i>
        </button>
      `;
      grid.appendChild(card);
    });

    grid.querySelectorAll('.btn-delete-staff').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm("Supprimer ce membre de l'équipe ?")) {
          appState.staff = appState.staff.filter(s => s.id !== id);
          saveState();
          showToast("Membre supprimé.");
        }
      });
    });

    if (window.lucide) lucide.createIcons();
  };

  // Rendu Général
  const renderAll = () => {
    applyTheme();
    renderMonthSelector();
    renderDashboard();
    renderPlanning();
    renderTasks();
    renderTips();
    renderStaff();
  };

  // ==========================================
  // 5. GESTION DES ÉVÉNEMENTS & INTERACTIONS
  // ==========================================

  // Changement d'onglet
  const switchTab = (tabId) => {
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

    // Re-render la vue active
    if (tabId === 'dashboard') renderDashboard();
    if (tabId === 'planning') renderPlanning();
    if (tabId === 'tasks') renderTasks();
    if (tabId === 'tips') renderTips();
    if (tabId === 'staff') renderStaff();
  };

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Filtre Leaderboard (ALL / FRONT / KITCHEN)
  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
      appState.activeFilter = e.currentTarget.dataset.filter;
      renderDashboard();
    });
  });

  // Changement de Thème (Sombre / Clair)
  document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    saveState();
  });

  // Changement de Mois
  document.getElementById('current-month-select').addEventListener('change', (e) => {
    appState.currentMonth = e.target.value;
    saveState();
    showToast(`Mois changé : ${e.target.options[e.target.selectedIndex].text}`);
  });

  // Soumission Tâche Fixe
  document.getElementById('btn-submit-fixed-task').addEventListener('click', () => {
    const empId = document.getElementById('task-fixed-employee').value;
    const preset = document.getElementById('task-fixed-preset').value;

    let pts = 15;
    if (preset.includes('+10')) pts = 10;
    if (preset.includes('+25')) pts = 25;

    appState.tasks.push({
      id: 'task-' + Date.now(),
      employeeId: empId,
      desc: preset,
      points: pts,
      status: 'PENDING',
      timestamp: Date.now()
    });

    saveState();
    showToast("Tâche fixe soumise pour validation !");
  });

  // Soumission Tâche Bonus
  document.getElementById('form-bonus-task').addEventListener('submit', (e) => {
    e.preventDefault();
    const empId = document.getElementById('task-bonus-employee').value;
    const desc = document.getElementById('task-bonus-desc').value.trim();
    const pts = parseInt(document.getElementById('task-bonus-pts').value);

    if (!desc) return;

    appState.tasks.push({
      id: 'task-' + Date.now(),
      employeeId: empId,
      desc: `Initiative : ${desc}`,
      points: pts,
      status: 'PENDING',
      timestamp: Date.now()
    });

    document.getElementById('task-bonus-desc').value = '';
    saveState();
    showToast("Initiative bonus déclarée ! En attente du manager.");
  });

  // Enregistrer Paramètres Tips
  document.getElementById('btn-save-tips').addEventListener('click', () => {
    const totalAmount = parseFloat(document.getElementById('input-total-tips').value) || 0;
    const rule = document.getElementById('tip-distribution-rule').value;

    appState.tipsConfig[appState.currentMonth] = { totalAmount, rule };
    saveState();
    showToast("Nouveaux montants de pourboires enregistrés !");
  });

  // Imprimer Fiches Tips
  document.getElementById('btn-print-tips').addEventListener('click', () => {
    window.print();
  });

  // Ajouter un membre d'équipe
  document.getElementById('form-add-staff').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('staff-name').value.trim();
    const role = document.getElementById('staff-role').value;
    const color = document.getElementById('staff-color').value;

    if (!name) return;

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    appState.staff.push({
      id: 'emp-' + Date.now(),
      name,
      role,
      color,
      avatar: initials || 'EX'
    });

    document.getElementById('staff-name').value = '';
    saveState();
    showToast(`Nouveau membre ${name} ajouté !`);
  });

  // Exporter Sauvegarde JSON
  document.getElementById('btn-export-data').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tiprank_resto_backup_${appState.currentMonth}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Fichier de sauvegarde téléchargé !");
  });

  // Importer Sauvegarde JSON
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
          showToast("Données importées avec succès !");
        } else {
          alert("Format de fichier invalide.");
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier JSON.");
      }
    };
    reader.readAsText(file);
  });

  // Charger Démo
  document.getElementById('btn-load-demo').addEventListener('click', () => {
    if (confirm("Réinitialiser avec les données de démonstration du restaurant ?")) {
      initDefaultState();
      showToast("Données de démo chargées !");
    }
  });

  // Réinitialiser le Mois
  document.getElementById('btn-reset-month').addEventListener('click', () => {
    if (confirm("Attention: Cela va réinitialiser les tâches et le planning du mois courant. Continuer ?")) {
      delete appState.schedules[appState.currentMonth];
      delete appState.tipsConfig[appState.currentMonth];
      appState.tasks = [];
      saveState();
      showToast("Mois réinitialisé.");
    }
  });

  // ==========================================
  // 6. CELEBRATION MODAL & CONFETTI
  // ==========================================

  const triggerWinnerModal = () => {
    const { empStats } = calculateTipDistribution();

    // Tri par score total (Points + Présence)
    const sorted = [...empStats].sort((a, b) => (b.points + b.workedDays * 2) - (a.points + a.workedDays * 2));
    const winner = sorted[0];

    if (!winner) {
      alert("Aucun employé disponible pour élire le gagnant.");
      return;
    }

    document.getElementById('winner-name').textContent = winner.name;
    document.getElementById('winner-team-badge').textContent = winner.role === 'FRONT' ? 'Équipe Front (Salle)' : 'Équipe Kitchen (Cuisine)';
    document.getElementById('winner-team-badge').className = `badge ${winner.role === 'FRONT' ? 'badge-front' : 'badge-kitchen'}`;

    document.getElementById('winner-points').textContent = `${winner.points} pts`;
    document.getElementById('winner-days').textContent = `${winner.workedDays} j (${winner.workedHours}h)`;
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

  // Notifications Toast
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

  // ==========================================
  // 7. DÉMARRAGE INITIAL
  // ==========================================
  loadState();
  renderAll();

});
