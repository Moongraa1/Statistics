/**
 * CS2 Team Roster & Stats Tracker
 * Pure Vanilla JavaScript Application
 */

(function () {
  'use strict';

  // --- STORAGE KEYS & DEFAULTS ---
  const STORAGE_KEY = 'cs2_team_stats_v1';

  const DEFAULT_TEAM_DATA = {
    teamName: 'Team Dominance',
    players: [
      {
        id: 'p-1',
        name: 's1mple',
        role: 'Снайпер (AWP)',
        matches: 24,
        kills: 568,
        deaths: 374,
        assists: 86,
        clutches: 14,
        aces: 5
      },
      {
        id: 'p-2',
        name: 'b1t',
        role: 'Рифлер',
        matches: 24,
        kills: 492,
        deaths: 395,
        assists: 104,
        clutches: 8,
        aces: 2
      },
      {
        id: 'p-3',
        name: 'electronic',
        role: 'Капитан (IGL)',
        matches: 23,
        kills: 435,
        deaths: 410,
        assists: 130,
        clutches: 6,
        aces: 1
      },
      {
        id: 'p-4',
        name: 'Perfecto',
        role: 'Саппорт',
        matches: 24,
        kills: 398,
        deaths: 365,
        assists: 148,
        clutches: 19,
        aces: 1
      },
      {
        id: 'p-5',
        name: 'Boombl4',
        role: 'Энтри-фрагер',
        matches: 22,
        kills: 412,
        deaths: 428,
        assists: 112,
        clutches: 5,
        aces: 2
      }
    ],
    matches: [
      {
        id: 'm-1',
        date: '07.11.2026, 21:40',
        playerId: 'p-1',
        playerName: 's1mple',
        map: 'Mirage',
        result: 'Победа',
        kills: 28,
        deaths: 14,
        assists: 4,
        clutches: 2,
        aces: 1
      },
      {
        id: 'm-2',
        date: '07.11.2026, 20:15',
        playerId: 'p-2',
        playerName: 'b1t',
        map: 'Inferno',
        result: 'Победа',
        kills: 23,
        deaths: 16,
        assists: 6,
        clutches: 1,
        aces: 0
      },
      {
        id: 'm-3',
        date: '06.11.2026, 22:00',
        playerId: 'p-4',
        playerName: 'Perfecto',
        map: 'Nuke',
        result: 'Поражение',
        kills: 19,
        deaths: 15,
        assists: 9,
        clutches: 3,
        aces: 0
      }
    ]
  };

  // --- STATE ---
  let state = {
    teamName: '',
    players: [],
    matches: [],
    sortColumn: 'kd',
    sortAsc: false,
    searchFilter: ''
  };

  // --- DOM ELEMENTS ---
  const el = {
    teamNameHeading: document.getElementById('teamNameHeading'),
    editTeamNameBtn: document.getElementById('editTeamNameBtn'),
    exportBtn: document.getElementById('exportBtn'),
    importInput: document.getElementById('importInput'),
    resetAllBtn: document.getElementById('resetAllBtn'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    emptyLoadSampleBtn: document.getElementById('emptyLoadSampleBtn'),

    // Dashboard
    dashTotalPlayers: document.getElementById('dashTotalPlayers'),
    dashActiveRoles: document.getElementById('dashActiveRoles'),
    dashTotalMatches: document.getElementById('dashTotalMatches'),
    dashAvgMatches: document.getElementById('dashAvgMatches'),
    dashTeamKD: document.getElementById('dashTeamKD'),
    dashKDSub: document.getElementById('dashKDSub'),
    dashKills: document.getElementById('dashKills'),
    dashDeaths: document.getElementById('dashDeaths'),
    dashAssists: document.getElementById('dashAssists'),
    dashKDA: document.getElementById('dashKDA'),
    dashClutches: document.getElementById('dashClutches'),
    dashAces: document.getElementById('dashAces'),
    dashMvpName: document.getElementById('dashMvpName'),
    dashMvpStat: document.getElementById('dashMvpStat'),

    // Roster
    rosterCountBadge: document.getElementById('rosterCountBadge'),
    addPlayerForm: document.getElementById('addPlayerForm'),
    newPlayerNick: document.getElementById('newPlayerNick'),
    newPlayerRole: document.getElementById('newPlayerRole'),
    rosterSearchInput: document.getElementById('rosterSearchInput'),
    rosterTable: document.getElementById('rosterTable'),
    rosterTableBody: document.getElementById('rosterTableBody'),
    emptyState: document.getElementById('emptyState'),

    // Matches
    matchesCountBadge: document.getElementById('matchesCountBadge'),
    historyTable: document.getElementById('historyTable'),
    historyTableBody: document.getElementById('historyTableBody'),
    emptyHistoryState: document.getElementById('emptyHistoryState'),
    openMatchModalBtn: document.getElementById('openMatchModalBtn'),
    quickRecordMatchBtn: document.getElementById('quickRecordMatchBtn'),

    // Modal
    matchModal: document.getElementById('matchModal'),
    closeMatchModalBtn: document.getElementById('closeMatchModalBtn'),
    cancelMatchModalBtn: document.getElementById('cancelMatchModalBtn'),
    recordMatchForm: document.getElementById('recordMatchForm'),
    matchPlayerSelect: document.getElementById('matchPlayerSelect'),
    matchMapSelect: document.getElementById('matchMapSelect'),
    matchKills: document.getElementById('matchKills'),
    matchDeaths: document.getElementById('matchDeaths'),
    matchAssists: document.getElementById('matchAssists'),
    matchClutches: document.getElementById('matchClutches'),
    matchAces: document.getElementById('matchAces'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // --- INITIALIZATION ---
  function init() {
    loadState();
    bindEvents();
    renderAll();
  }

  // --- STATE MANAGEMENT & LOCAL STORAGE ---
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state.teamName = parsed.teamName || 'Team Dominance';
        state.players = Array.isArray(parsed.players) ? parsed.players : [];
        state.matches = Array.isArray(parsed.matches) ? parsed.matches : [];
      } else {
        // Load default CS2 squad on fresh start
        state.teamName = DEFAULT_TEAM_DATA.teamName;
        state.players = JSON.parse(JSON.stringify(DEFAULT_TEAM_DATA.players));
        state.matches = JSON.parse(JSON.stringify(DEFAULT_TEAM_DATA.matches));
        saveState();
      }
    } catch (err) {
      console.error('Ошибка загрузки данных из localStorage:', err);
      state.teamName = 'Team Dominance';
      state.players = [];
      state.matches = [];
    }
  }

  function saveState() {
    try {
      const payload = {
        teamName: state.teamName,
        players: state.players,
        matches: state.matches
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Ошибка сохранения данных в localStorage:', err);
      showToast('Ошибка сохранения данных в памяти браузера', 'error');
    }
  }

  // --- CALCULATIONS ---
  function computeKD(kills, deaths) {
    if (deaths === 0) {
      return Number(kills).toFixed(2);
    }
    return (kills / deaths).toFixed(2);
  }

  function computeKDA(kills, assists, deaths) {
    const divisor = Math.max(1, deaths);
    return ((kills + assists) / divisor).toFixed(2);
  }

  function computeKPM(kills, matches) {
    if (matches === 0) return '0.0';
    return (kills / matches).toFixed(1);
  }

  function getMVPPlayer() {
    // Player with highest K/D among those who have played at least 1 match
    const activePlayers = state.players.filter(p => p.matches > 0);
    if (!activePlayers.length) return null;

    let mvp = activePlayers[0];
    let maxKd = parseFloat(computeKD(mvp.kills, mvp.deaths));

    for (let i = 1; i < activePlayers.length; i++) {
      const p = activePlayers[i];
      const kd = parseFloat(computeKD(p.kills, p.deaths));
      if (kd > maxKd || (kd === maxKd && p.kills > mvp.kills)) {
        maxKd = kd;
        mvp = p;
      }
    }
    return mvp;
  }

  // --- RENDERING ---

  function renderAll() {
    renderTeamHeader();
    renderDashboard();
    renderRosterTable();
    renderMatchHistory();
    populatePlayerSelect();
  }

  function renderTeamHeader() {
    el.teamNameHeading.textContent = state.teamName || 'Team Dominance';
    document.title = `${state.teamName || 'CS2 Team'} | Roster & Stats Tracker`;
  }

  function renderDashboard() {
    const totalPlayers = state.players.length;
    let totalMatchesSum = 0;
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalClutches = 0;
    let totalAces = 0;

    const rolesSet = new Set();

    state.players.forEach(p => {
      totalMatchesSum += p.matches || 0;
      totalKills += p.kills || 0;
      totalDeaths += p.deaths || 0;
      totalAssists += p.assists || 0;
      totalClutches += p.clutches || 0;
      totalAces += p.aces || 0;
      if (p.role) rolesSet.add(p.role);
    });

    el.dashTotalPlayers.textContent = totalPlayers;
    el.dashActiveRoles.textContent = totalPlayers > 0 
      ? `${rolesSet.size} активных ролей` 
      : 'Ростер пуст';

    el.dashTotalMatches.textContent = totalMatchesSum;
    const avgMatches = totalPlayers > 0 ? (totalMatchesSum / totalPlayers).toFixed(1) : '0.0';
    el.dashAvgMatches.textContent = `${avgMatches} в ср. на игрока`;

    // Team K/D
    const teamKD = totalDeaths === 0 ? totalKills.toFixed(2) : (totalKills / totalDeaths).toFixed(2);
    el.dashTeamKD.textContent = teamKD;
    if (parseFloat(teamKD) >= 1.0) {
      el.dashTeamKD.style.color = 'var(--kd-high)';
      el.dashKDSub.textContent = 'Положительная статистика (>= 1.0)';
    } else {
      el.dashTeamKD.style.color = 'var(--kd-low)';
      el.dashKDSub.textContent = 'Отрицательная статистика (< 1.0)';
    }

    // Kills / Deaths / Assists
    el.dashKills.textContent = totalKills;
    el.dashDeaths.textContent = totalDeaths;
    el.dashAssists.textContent = totalAssists;

    const teamKDA = computeKDA(totalKills, totalAssists, totalDeaths);
    el.dashKDA.textContent = `Командный KDA: ${teamKDA}`;

    // Clutches & Aces
    el.dashClutches.textContent = totalClutches;
    el.dashAces.textContent = totalAces;

    // MVP
    const mvp = getMVPPlayer();
    if (mvp) {
      const mvpKd = computeKD(mvp.kills, mvp.deaths);
      el.dashMvpName.textContent = mvp.name;
      el.dashMvpStat.textContent = `K/D: ${mvpKd} (${mvp.kills} фр. за ${mvp.matches} матчей)`;
    } else {
      el.dashMvpName.textContent = '—';
      el.dashMvpStat.textContent = 'Сыграйте хотя бы 1 матч';
    }
  }

  function getSortedPlayers() {
    let list = [...state.players];

    // Filter by search query
    if (state.searchFilter.trim()) {
      const q = state.searchFilter.trim().toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.role && p.role.toLowerCase().includes(q))
      );
    }

    // Sort
    const col = state.sortColumn;
    const asc = state.sortAsc;

    list.sort((a, b) => {
      let valA, valB;

      switch (col) {
        case 'name':
          return asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'role':
          return asc ? (a.role || '').localeCompare(b.role || '') : (b.role || '').localeCompare(a.role || '');
        case 'matches':
          valA = a.matches; valB = b.matches;
          break;
        case 'kills':
          valA = a.kills; valB = b.kills;
          break;
        case 'deaths':
          valA = a.deaths; valB = b.deaths;
          break;
        case 'assists':
          valA = a.assists; valB = b.assists;
          break;
        case 'kd':
          valA = parseFloat(computeKD(a.kills, a.deaths));
          valB = parseFloat(computeKD(b.kills, b.deaths));
          break;
        case 'kda':
          valA = parseFloat(computeKDA(a.kills, a.assists, a.deaths));
          valB = parseFloat(computeKDA(b.kills, b.assists, b.deaths));
          break;
        case 'kpm':
          valA = parseFloat(computeKPM(a.kills, a.matches));
          valB = parseFloat(computeKPM(b.kills, b.matches));
          break;
        case 'clutches':
          valA = a.clutches; valB = b.clutches;
          break;
        case 'aces':
          valA = a.aces; valB = b.aces;
          break;
        default:
          valA = a.kills; valB = b.kills;
      }

      return asc ? valA - valB : valB - valA;
    });

    return list;
  }

  function renderRosterTable() {
    const list = getSortedPlayers();
    el.rosterCountBadge.textContent = `${state.players.length} бойцов`;

    // Sort indicators
    document.querySelectorAll('.roster-table th.sortable').forEach(th => {
      const sortKey = th.dataset.sort;
      const indicator = th.querySelector('.sort-indicator');
      if (sortKey === state.sortColumn) {
        th.classList.add('active-sort');
        if (indicator) indicator.textContent = state.sortAsc ? '▲' : '▼';
      } else {
        th.classList.remove('active-sort');
        if (indicator) indicator.textContent = '';
      }
    });

    if (state.players.length === 0) {
      el.rosterTableBody.innerHTML = '';
      el.rosterTable.classList.add('hidden');
      el.emptyState.classList.remove('hidden');
      return;
    }

    el.emptyState.classList.add('hidden');
    el.rosterTable.classList.remove('hidden');

    const mvp = getMVPPlayer();

    el.rosterTableBody.innerHTML = list.map(player => {
      const isMvp = mvp && mvp.id === player.id;
      const kdVal = computeKD(player.kills, player.deaths);
      const kdNum = parseFloat(kdVal);
      const kdaVal = computeKDA(player.kills, player.assists, player.deaths);
      const kpmVal = computeKPM(player.kills, player.matches);

      const kdClass = kdNum >= 1.0 ? 'stat-pill-high' : 'stat-pill-low';

      const initial = (player.name && player.name[0]) ? player.name[0].toUpperCase() : '?';

      return `
        <tr data-player-id="${player.id}">
          <!-- Player Identity -->
          <td>
            <div class="player-cell">
              <div class="player-avatar">${escapeHtml(initial)}</div>
              <div class="player-info-meta">
                <div class="player-name-text">
                  <span class="player-clickable-name" title="Кликните дважды, чтобы изменить никнейм" data-action="rename-player" data-id="${player.id}">${escapeHtml(player.name)}</span>
                  ${isMvp ? `
                    <span class="badge-mvp-pill" title="MVP команды: наивысший K/D">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      MVP
                    </span>
                  ` : ''}
                </div>
              </div>
            </div>
          </td>

          <!-- Role -->
          <td>
            <select class="role-badge-select" data-action="change-role" data-id="${player.id}">
              <option value="Снайпер (AWP)" ${player.role === 'Снайпер (AWP)' ? 'selected' : ''}>Снайпер (AWP)</option>
              <option value="Капитан (IGL)" ${player.role === 'Капитан (IGL)' ? 'selected' : ''}>Капитан (IGL)</option>
              <option value="Рифлер" ${player.role === 'Рифлер' ? 'selected' : ''}>Рифлер</option>
              <option value="Энтри-фрагер" ${player.role === 'Энтри-фрагер' ? 'selected' : ''}>Энтри-фрагер</option>
              <option value="Саппорт" ${player.role === 'Саппорт' ? 'selected' : ''}>Саппорт</option>
            </select>
          </td>

          <!-- Matches -->
          <td class="text-center">
            ${renderStepper(player.id, 'matches', player.matches)}
          </td>

          <!-- Kills -->
          <td class="text-center">
            ${renderStepper(player.id, 'kills', player.kills)}
          </td>

          <!-- Deaths -->
          <td class="text-center">
            ${renderStepper(player.id, 'deaths', player.deaths)}
          </td>

          <!-- Assists -->
          <td class="text-center">
            ${renderStepper(player.id, 'assists', player.assists)}
          </td>

          <!-- Calculated K/D -->
          <td class="text-center">
            <span class="stat-pill ${kdClass}" id="kd-${player.id}">${kdVal}</span>
          </td>

          <!-- Calculated KDA -->
          <td class="text-center">
            <span class="stat-pill stat-pill-neutral" id="kda-${player.id}">${kdaVal}</span>
          </td>

          <!-- Calculated Kills/Match -->
          <td class="text-center">
            <span class="stat-pill stat-pill-neutral" id="kpm-${player.id}">${kpmVal}</span>
          </td>

          <!-- Clutches -->
          <td class="text-center">
            ${renderStepper(player.id, 'clutches', player.clutches)}
          </td>

          <!-- Aces -->
          <td class="text-center">
            ${renderStepper(player.id, 'aces', player.aces)}
          </td>

          <!-- Actions -->
          <td class="text-right">
            <div class="table-actions">
              <button class="btn-table-action" data-action="quick-match" data-id="${player.id}" title="Записать результат сыгранного матча для этого игрока">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                +Матч
              </button>
              <button class="btn-table-action" data-action="reset-player" data-id="${player.id}" title="Сбросить статистику игрока">
                Сброс
              </button>
              <button class="btn-table-action action-delete" data-action="delete-player" data-id="${player.id}" title="Удалить игрока из состава">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderStepper(playerId, field, value) {
    return `
      <div class="stepper-control" data-player-id="${playerId}" data-field="${field}">
        <button type="button" class="stepper-btn btn-dec" data-action="step-dec" title="Уменьшить на 1">−</button>
        <input 
          type="number" 
          class="stepper-input" 
          value="${value}" 
          min="0" 
          max="9999" 
          data-action="step-input"
          data-field="${field}"
          data-player-id="${playerId}">
        <button type="button" class="stepper-btn btn-inc" data-action="step-inc" title="Увеличить на 1">+</button>
      </div>
    `;
  }

  function renderMatchHistory() {
    el.matchesCountBadge.textContent = `${state.matches.length} каток`;

    if (state.matches.length === 0) {
      el.historyTableBody.innerHTML = '';
      el.historyTable.classList.add('hidden');
      el.emptyHistoryState.classList.remove('hidden');
      return;
    }

    el.emptyHistoryState.classList.add('hidden');
    el.historyTable.classList.remove('hidden');

    el.historyTableBody.innerHTML = state.matches.map(m => {
      let resultClass = 'win';
      if (m.result === 'Поражение') resultClass = 'loss';
      if (m.result === 'Ничья') resultClass = 'tie';

      const matchKd = computeKD(m.kills, m.deaths);
      const kdPillClass = parseFloat(matchKd) >= 1.0 ? 'stat-pill-high' : 'stat-pill-low';

      return `
        <tr data-match-id="${m.id}">
          <td class="text-secondary" style="font-size: 0.8rem;">${escapeHtml(m.date)}</td>
          <td><strong>${escapeHtml(m.playerName)}</strong></td>
          <td><span class="match-map-tag">de_${escapeHtml(m.map.toLowerCase())}</span></td>
          <td><span class="result-badge ${resultClass}">${escapeHtml(m.result)}</span></td>
          <td class="text-center font-mono">${m.kills} / ${m.deaths} / ${m.assists}</td>
          <td class="text-center"><span class="stat-pill ${kdPillClass}">${matchKd}</span></td>
          <td class="text-center">${m.clutches > 0 ? `<span class="text-accent font-bold">${m.clutches}</span>` : '0'}</td>
          <td class="text-center">${m.aces > 0 ? `<span class="text-gold font-bold">★ ${m.aces}</span>` : '0'}</td>
          <td class="text-right">
            <button class="btn-table-action action-delete" data-action="delete-match" data-id="${m.id}" title="Откатить матч (вычтет эту статистику у игрока)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Откатить
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function populatePlayerSelect(selectedPlayerId) {
    if (state.players.length === 0) {
      el.matchPlayerSelect.innerHTML = '<option value="">Нет игроков в составе</option>';
      return;
    }

    el.matchPlayerSelect.innerHTML = state.players.map(p => {
      const isSel = selectedPlayerId && p.id === selectedPlayerId ? 'selected' : '';
      return `<option value="${p.id}" ${isSel}>${escapeHtml(p.name)} (${escapeHtml(p.role || 'Рифлер')})</option>`;
    }).join('');
  }

  // --- ACTIONS & DATA MUTATIONS ---

  function addPlayer(name, role) {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Введите корректный никнейм игрока', 'error');
      return false;
    }

    // Check duplicate nickname (case-insensitive)
    const exists = state.players.some(p => p.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast(`Игрок с никнеймом "${trimmed}" уже есть в составе!`, 'error');
      return false;
    }

    const newPlayer = {
      id: 'p-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: trimmed,
      role: role || 'Рифлер',
      matches: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      clutches: 0,
      aces: 0
    };

    state.players.push(newPlayer);
    saveState();
    renderAll();
    showToast(`Игрок ${trimmed} добавлен в ростер`, 'success');
    return true;
  }

  function renamePlayer(playerId) {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;

    const newName = prompt(`Новый никнейм для игрока ${player.name}:`, player.name);
    if (newName === null) return;

    const trimmed = newName.trim();
    if (!trimmed) {
      showToast('Никнейм не может быть пустым', 'error');
      return;
    }

    const exists = state.players.some(p => p.id !== playerId && p.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast(`Игрок с ником "${trimmed}" уже существует!`, 'error');
      return;
    }

    player.name = trimmed;
    saveState();
    renderAll();
    showToast('Никнейм успешно обновлен', 'info');
  }

  function updatePlayerField(playerId, field, rawValue) {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;

    const val = Math.max(0, parseInt(rawValue, 10) || 0);
    player[field] = val;

    saveState();

    // Fast recalculate & DOM update without full re-render for seamless typing
    updatePlayerRowValues(player);
    renderDashboard();

    // Trigger visual flash highlight on updated cell
    const stepperInput = document.querySelector(`.stepper-control[data-player-id="${playerId}"][data-field="${field}"]`);
    if (stepperInput) {
      stepperInput.classList.remove('flash-highlight');
      void stepperInput.offsetWidth; // re-trigger animation
      stepperInput.classList.add('flash-highlight');
    }
  }

  function updatePlayerRowValues(player) {
    const kdEl = document.getElementById(`kd-${player.id}`);
    const kdaEl = document.getElementById(`kda-${player.id}`);
    const kpmEl = document.getElementById(`kpm-${player.id}`);

    const kd = computeKD(player.kills, player.deaths);
    const kda = computeKDA(player.kills, player.assists, player.deaths);
    const kpm = computeKPM(player.kills, player.matches);

    if (kdEl) {
      kdEl.textContent = kd;
      kdEl.className = `stat-pill ${parseFloat(kd) >= 1.0 ? 'stat-pill-high' : 'stat-pill-low'}`;
    }
    if (kdaEl) kdaEl.textContent = kda;
    if (kpmEl) kpmEl.textContent = kpm;
  }

  function resetPlayerStats(playerId) {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;

    if (!confirm(`Обнулить всю статистику игрока ${player.name}?`)) return;

    player.matches = 0;
    player.kills = 0;
    player.deaths = 0;
    player.assists = 0;
    player.clutches = 0;
    player.aces = 0;

    saveState();
    renderAll();
    showToast(`Статистика игрока ${player.name} сброшена`, 'info');
  }

  function deletePlayer(playerId) {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;

    if (!confirm(`Удалить игрока "${player.name}" из ростера команды?`)) return;

    state.players = state.players.filter(p => p.id !== playerId);
    saveState();
    renderAll();
    showToast(`Игрок ${player.name} удален из состава`, 'info');
  }

  function recordMatch(data) {
    const player = state.players.find(p => p.id === data.playerId);
    if (!player) {
      showToast('Выберите существующего игрока', 'error');
      return false;
    }

    const kills = Math.max(0, parseInt(data.kills, 10) || 0);
    const deaths = Math.max(0, parseInt(data.deaths, 10) || 0);
    const assists = Math.max(0, parseInt(data.assists, 10) || 0);
    const clutches = Math.max(0, parseInt(data.clutches, 10) || 0);
    const aces = Math.max(0, parseInt(data.aces, 10) || 0);

    // 1. Update player stats
    player.matches = (player.matches || 0) + 1;
    player.kills = (player.kills || 0) + kills;
    player.deaths = (player.deaths || 0) + deaths;
    player.assists = (player.assists || 0) + assists;
    player.clutches = (player.clutches || 0) + clutches;
    player.aces = (player.aces || 0) + aces;

    // 2. Add to match history
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
                          ', ' + now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const newMatch = {
      id: 'm-' + Date.now(),
      date: dateFormatted,
      playerId: player.id,
      playerName: player.name,
      map: data.map || 'Mirage',
      result: data.result || 'Победа',
      kills,
      deaths,
      assists,
      clutches,
      aces
    };

    state.matches.unshift(newMatch); // most recent first

    saveState();
    renderAll();
    showToast(`Матч на ${newMatch.map} успешно записан для ${player.name}`, 'success');
    return true;
  }

  function deleteMatch(matchId) {
    const matchIndex = state.matches.findIndex(m => m.id === matchId);
    if (matchIndex === -1) return;

    const match = state.matches[matchIndex];
    if (!confirm(`Откатить матч на карте ${match.map} для игрока ${match.playerName}? Статистика будет возвращена назад.`)) {
      return;
    }

    // Rollback player stats if player still exists
    const player = state.players.find(p => p.id === match.playerId);
    if (player) {
      player.matches = Math.max(0, (player.matches || 1) - 1);
      player.kills = Math.max(0, (player.kills || 0) - match.kills);
      player.deaths = Math.max(0, (player.deaths || 0) - match.deaths);
      player.assists = Math.max(0, (player.assists || 0) - match.assists);
      player.clutches = Math.max(0, (player.clutches || 0) - match.clutches);
      player.aces = Math.max(0, (player.aces || 0) - match.aces);
    }

    state.matches.splice(matchIndex, 1);
    saveState();
    renderAll();
    showToast('Матч успешно удален, статистика скорректирована', 'info');
  }

  // --- JSON EXPORT / IMPORT & RESET ---

  function exportData() {
    const payload = {
      teamName: state.teamName,
      exportDate: new Date().toISOString(),
      players: state.players,
      matches: state.matches
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const filename = `cs2-${state.teamName.toLowerCase().replace(/\s+/g, '-')}-stats.json`;

    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    a.remove();

    showToast('Файл со статистикой команды скачан', 'success');
  }

  function handleImportFile(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);

        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.players)) {
          throw new Error('Некорректная структура файла JSON CS2 Tracker.');
        }

        state.teamName = parsed.teamName || state.teamName || 'Team Dominance';
        state.players = parsed.players.map((p, idx) => ({
          id: p.id || 'p-' + Date.now() + '-' + idx,
          name: String(p.name || 'Игрок').trim(),
          role: p.role || 'Рифлер',
          matches: Math.max(0, parseInt(p.matches, 10) || 0),
          kills: Math.max(0, parseInt(p.kills, 10) || 0),
          deaths: Math.max(0, parseInt(p.deaths, 10) || 0),
          assists: Math.max(0, parseInt(p.assists, 10) || 0),
          clutches: Math.max(0, parseInt(p.clutches, 10) || 0),
          aces: Math.max(0, parseInt(p.aces, 10) || 0)
        }));

        state.matches = Array.isArray(parsed.matches) ? parsed.matches : [];

        saveState();
        renderAll();
        showToast('Данные команды успешно импортированы!', 'success');
      } catch (err) {
        console.error('Ошибка парсинга JSON:', err);
        showToast('Ошибка импорта: поврежденный или неподходящий JSON-файл', 'error');
      } finally {
        el.importInput.value = '';
      }
    };

    reader.readAsText(file);
  }

  function resetAllData() {
    if (!confirm('ВНИМАНИЕ! Вы действительно хотите полностью очистить весь ростер и историю матчей? Это действие нельзя отменить.')) {
      return;
    }

    state.players = [];
    state.matches = [];
    saveState();
    renderAll();
    showToast('Все данные команды сброшены', 'info');
  }

  function loadSampleRoster() {
    state.teamName = DEFAULT_TEAM_DATA.teamName;
    state.players = JSON.parse(JSON.stringify(DEFAULT_TEAM_DATA.players));
    state.matches = JSON.parse(JSON.stringify(DEFAULT_TEAM_DATA.matches));
    saveState();
    renderAll();
    showToast('Демо-ростер CS2 успешно загружен!', 'success');
  }

  // --- MODAL CONTROLS ---

  function openMatchModal(targetPlayerId) {
    if (state.players.length === 0) {
      showToast('Сначала добавьте хотя бы одного игрока в состав!', 'error');
      return;
    }

    populatePlayerSelect(targetPlayerId);

    // Reset default values
    el.matchKills.value = '18';
    el.matchDeaths.value = '14';
    el.matchAssists.value = '4';
    el.matchClutches.value = '0';
    el.matchAces.value = '0';

    el.matchModal.classList.remove('hidden');
    el.matchKills.focus();
  }

  function closeMatchModal() {
    el.matchModal.classList.add('hidden');
  }

  // --- TOAST NOTIFICATIONS ---

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2ea44f" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f85149" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e4891b" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- EVENT LISTENERS ---

  function bindEvents() {
    // 1. Team Name Edit
    el.teamNameHeading.addEventListener('click', startTeamNameEdit);
    el.editTeamNameBtn.addEventListener('click', startTeamNameEdit);

    function startTeamNameEdit() {
      const currentName = state.teamName;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'team-name-input';
      input.value = currentName;
      input.maxLength = 32;

      el.teamNameHeading.replaceWith(input);
      input.focus();
      input.select();

      function finishEdit() {
        const val = input.value.trim() || 'Team Dominance';
        state.teamName = val;
        saveState();
        input.replaceWith(el.teamNameHeading);
        renderTeamHeader();
      }

      input.addEventListener('blur', finishEdit, { once: true });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          input.blur();
        } else if (e.key === 'Escape') {
          input.value = currentName;
          input.blur();
        }
      });
    }

    // 2. Global Actions
    el.exportBtn.addEventListener('click', exportData);

    el.importInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImportFile(e.target.files[0]);
      }
    });

    el.resetAllBtn.addEventListener('click', resetAllData);
    el.loadSampleBtn.addEventListener('click', loadSampleRoster);
    el.emptyLoadSampleBtn.addEventListener('click', loadSampleRoster);

    // 3. Add Player Form
    el.addPlayerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nick = el.newPlayerNick.value;
      const role = el.newPlayerRole.value;
      if (addPlayer(nick, role)) {
        el.newPlayerNick.value = '';
        el.newPlayerNick.focus();
      }
    });

    // 4. Search Filter
    el.rosterSearchInput.addEventListener('input', (e) => {
      state.searchFilter = e.target.value;
      renderRosterTable();
    });

    // 5. Table Sorting
    document.querySelectorAll('.roster-table th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (state.sortColumn === col) {
          state.sortAsc = !state.sortAsc;
        } else {
          state.sortColumn = col;
          // default descending for stats, ascending for text
          state.sortAsc = (col === 'name' || col === 'role');
        }
        renderRosterTable();
      });
    });

    // 6. Delegated Table Actions (Steppers, Roles, Delete, Reset, Quick Match)
    el.rosterTableBody.addEventListener('click', (e) => {
      const target = e.target;
      const actionBtn = target.closest('[data-action]');
      if (!actionBtn) return;

      const action = actionBtn.dataset.action;
      const playerId = actionBtn.dataset.id || actionBtn.closest('.stepper-control')?.dataset.playerId;

      if (action === 'step-dec') {
        const control = actionBtn.closest('.stepper-control');
        const field = control.dataset.field;
        const input = control.querySelector('.stepper-input');
        const cur = Math.max(0, parseInt(input.value, 10) || 0);
        const next = Math.max(0, cur - 1);
        input.value = next;
        updatePlayerField(playerId, field, next);
      } else if (action === 'step-inc') {
        const control = actionBtn.closest('.stepper-control');
        const field = control.dataset.field;
        const input = control.querySelector('.stepper-input');
        const cur = Math.max(0, parseInt(input.value, 10) || 0);
        const next = cur + 1;
        input.value = next;
        updatePlayerField(playerId, field, next);
      } else if (action === 'quick-match') {
        openMatchModal(playerId);
      } else if (action === 'reset-player') {
        resetPlayerStats(playerId);
      } else if (action === 'delete-player') {
        deletePlayer(playerId);
      }
    });

    // Double click to rename
    el.rosterTableBody.addEventListener('dblclick', (e) => {
      const nameEl = e.target.closest('[data-action="rename-player"]');
      if (nameEl) {
        renamePlayer(nameEl.dataset.id);
      }
    });

    // Direct input in stepper
    el.rosterTableBody.addEventListener('input', (e) => {
      const input = e.target.closest('.stepper-input');
      if (!input) return;

      const playerId = input.dataset.playerId;
      const field = input.dataset.field;
      updatePlayerField(playerId, field, input.value);
    });

    // Role select change
    el.rosterTableBody.addEventListener('change', (e) => {
      const select = e.target.closest('[data-action="change-role"]');
      if (!select) return;

      const playerId = select.dataset.id;
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        player.role = select.value;
        saveState();
        renderDashboard();
        showToast(`Роль игрока ${player.name} изменена на: ${player.role}`, 'info');
      }
    });

    // 7. Match History Actions (Delete/Rollback Match)
    el.historyTableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="delete-match"]');
      if (btn) {
        deleteMatch(btn.dataset.id);
      }
    });

    // 8. Modal Open / Close
    el.openMatchModalBtn.addEventListener('click', () => openMatchModal());
    el.quickRecordMatchBtn.addEventListener('click', () => openMatchModal());
    el.closeMatchModalBtn.addEventListener('click', closeMatchModal);
    el.cancelMatchModalBtn.addEventListener('click', closeMatchModal);

    el.matchModal.addEventListener('click', (e) => {
      if (e.target === el.matchModal) {
        closeMatchModal();
      }
    });

    // Escape closes modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !el.matchModal.classList.contains('hidden')) {
        closeMatchModal();
      }
    });

    // Submit Match Form
    el.recordMatchForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const playerId = el.matchPlayerSelect.value;
      const map = el.matchMapSelect.value;
      const resultRadio = document.querySelector('input[name="matchResult"]:checked');
      const result = resultRadio ? resultRadio.value : 'Победа';

      const kills = el.matchKills.value;
      const deaths = el.matchDeaths.value;
      const assists = el.matchAssists.value;
      const clutches = el.matchClutches.value;
      const aces = el.matchAces.value;

      const success = recordMatch({
        playerId,
        map,
        result,
        kills,
        deaths,
        assists,
        clutches,
        aces
      });

      if (success) {
        closeMatchModal();
      }
    });
  }

  // --- SANITIZE HTML HELPER ---
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- START APP ---
  document.addEventListener('DOMContentLoaded', init);

})();
