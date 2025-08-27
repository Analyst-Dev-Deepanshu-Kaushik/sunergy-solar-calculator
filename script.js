// Selectors & state
const body = document.body;
const themeToggle = document.getElementById('themeToggle');

const capacityEl = document.getElementById('capacity');
const unitsPerKWEl = document.getElementById('unitsPerKW');
const costPerUnitEl = document.getElementById('costPerUnit');
const monthsPerMonthEl = document.getElementById('monthsPerMonth');

const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const clearLogBtn = document.getElementById('clearLogBtn');

const dayUnitsEl = document.getElementById('dayUnits');
const monthUnitsEl = document.getElementById('monthUnits');
const yearUnitsEl = document.getElementById('yearUnits');
const dayCostEl = document.getElementById('dayCost');
const monthCostEl = document.getElementById('monthCost');
const yearCostEl = document.getElementById('yearCost');

const logBody = document.getElementById('logBody');

const LS_KEY = 'solar_calc_log_v_final';


// Theme toggle
function setTheme(dark) {
    if (dark) {
        body.classList.add('dark');
        themeToggle.textContent = '☀️';
    } else {
        body.classList.remove('dark');
        themeToggle.textContent = '🌙';
    }
}

// initialize theme (check saved preference)
const savedTheme = localStorage.getItem('solar_theme');
setTheme(savedTheme === 'dark');

themeToggle.addEventListener('click', () => {
    const isDark = body.classList.toggle('dark');
    localStorage.setItem('solar_theme', isDark ? 'dark' : 'light');
    setTheme(isDark);
});


// Utils
const fmt = n => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });


// Calculation & UI
function calculateAndShow() {
    const capacity = parseFloat(capacityEl.value) || 0;
    const unitsPerKW = parseFloat(unitsPerKWEl.value) || 0;
    const costPerUnit = parseFloat(costPerUnitEl.value) || 0;
    const daysInMonth = parseFloat(monthsPerMonthEl.value) || 30;

    // Basic validation
    if (capacity <= 0) {
        alert('Please enter a valid plant capacity (kW).');
        return null;
    }

    const unitsDay = capacity * unitsPerKW;
    const unitsMonth = unitsDay * daysInMonth;
    const unitsYear = unitsDay * 365;

    const costDay = unitsDay * costPerUnit;
    const costMonth = unitsMonth * costPerUnit;
    const costYear = unitsYear * costPerUnit;

    // Update stats
    dayUnitsEl.textContent = fmt(unitsDay);
    monthUnitsEl.textContent = fmt(unitsMonth);
    yearUnitsEl.textContent = fmt(unitsYear);
    dayCostEl.textContent = '₹ ' + fmt(costDay);
    monthCostEl.textContent = '₹ ' + fmt(costMonth);
    yearCostEl.textContent = '₹ ' + fmt(costYear);

    return {
        timestamp: new Date().toLocaleString(),
        capacity: capacity,
        unitsDay, unitsMonth, unitsYear,
        costDay, costMonth, costYear
    };
}


// Logging (localStorage)
function loadLog() {
    const raw = localStorage.getItem(LS_KEY);
    try {
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}
function saveLog(arr) {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
}
function appendLogEntry(entry) {
    const rows = loadLog();
    rows.push(entry);
    saveLog(rows);
    renderLog();
}
function renderLog() {
    const rows = loadLog();
    logBody.innerHTML = '';
    rows.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${r.timestamp}</td>
      <td>${fmt(r.capacity)}</td>
      <td>${fmt(r.unitsDay)}</td>
      <td>${fmt(r.unitsMonth)}</td>
      <td>${fmt(r.unitsYear)}</td>
      <td>₹ ${fmt(r.costDay)}</td>
      <td>₹ ${fmt(r.costMonth)}</td>
      <td>₹ ${fmt(r.costYear)}</td>
    `;
        logBody.appendChild(tr);
    });
}


// Export CSV
function exportCSV() {
    const rows = loadLog();
    if (!rows.length) {
        alert('No log entries to export.');
        return;
    }
    const header = ['Timestamp', 'Capacity (kW)', 'Units/Day', 'Units/Month', 'Units/Year', 'Cost/Day (₹)', 'Cost/Month (₹)', 'Cost/Year (₹)'];
    const csvRows = [header.join(',')];
    rows.forEach(r => {
        const row = [
            `"${r.timestamp}"`,
            r.capacity,
            r.unitsDay.toFixed(2),
            r.unitsMonth.toFixed(2),
            r.unitsYear.toFixed(2),
            r.costDay.toFixed(2),
            r.costMonth.toFixed(2),
            r.costYear.toFixed(2)
        ];
        csvRows.push(row.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solar_log.csv';
    a.click();
    URL.revokeObjectURL(url);
}


// Clear Log
function clearLog() {
    if (!confirm('Clear all saved log entries?')) return;
    localStorage.removeItem(LS_KEY);
    renderLog();
}


// Event bindings
calculateBtn.addEventListener('click', () => {
    const entry = calculateAndShow();
    if (entry) appendLogEntry(entry);
});

resetBtn.addEventListener('click', () => {
    capacityEl.value = '';
    unitsPerKWEl.value = '4';
    costPerUnitEl.value = '3.4';
    monthsPerMonthEl.value = '30';
    dayUnitsEl.textContent = '0.00';
    monthUnitsEl.textContent = '0.00';
    yearUnitsEl.textContent = '0.00';
    dayCostEl.textContent = '₹ 0.00';
    monthCostEl.textContent = '₹ 0.00';
    yearCostEl.textContent = '₹ 0.00';
});

exportBtn.addEventListener('click', exportCSV);
clearLogBtn.addEventListener('click', clearLog);


// render on load
renderLog();
