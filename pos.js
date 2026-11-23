/**
 * PUNTO DE VENTA (POS) - HAMBURGUESAS SHARON
 * Diseñado para uso rápido desde el celular por Oscar Uziel
 * Manejo de tickets, cobros, cortes del día y exportación al patrón
 */

// Credenciales oficiales requeridas
const AUTH_USER = "Oscar Uziel";
const AUTH_PASS = "nahomy";

// Estado de la caja
let currentTicket = [];
let currentPaymentMethod = "Efectivo";
let currentCategory = "all";
let allSales = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initLucideIcons();
  loadSalesFromStorage();
  renderPosCatalog();
  updateTicketUI();
  setupDatePicker();
  loadBossPhone();
});

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ----------------------------------------------------
// 1. AUTENTICACIÓN
// ----------------------------------------------------
function checkAuth() {
  const isAuth = localStorage.getItem('sharon_pos_auth') === 'true';
  const loginScreen = document.getElementById('login-screen');
  const posApp = document.getElementById('pos-app');

  if (isAuth) {
    loginScreen.classList.add('hidden');
    posApp.classList.remove('hidden');
    document.getElementById('cashier-name').textContent = AUTH_USER;
  } else {
    loginScreen.classList.remove('hidden');
    posApp.classList.add('hidden');
  }
}

function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const errorBox = document.getElementById('login-error');

  // Comparación insensible a mayúsculas/minúsculas para el usuario
  if (user.toLowerCase() === AUTH_USER.toLowerCase() && pass === AUTH_PASS) {
    localStorage.setItem('sharon_pos_auth', 'true');
    errorBox.classList.add('hidden');
    checkAuth();
    showPosToast(`¡Bienvenido, ${AUTH_USER}!`);
  } else {
    errorBox.classList.remove('hidden');
  }
}

function handleLogout() {
  if (confirm('¿Deseas cerrar la sesión de la caja?')) {
    localStorage.removeItem('sharon_pos_auth');
    checkAuth();
  }
}

// ----------------------------------------------------
// 2. CATÁLOGO DE BOTONES RÁPIDOS
// ----------------------------------------------------
// Aplanamos el menú para botones de cobro inmediato (incluyendo tamaños de Res)
const POS_QUICK_ITEMS = [
  // Hamburguesas
  { id: 'pos-res-normal', name: 'Hamburguesa Res (Normal)', price: 50, category: 'hamburguesas', icon: 'sandwich' },
  { id: 'pos-res-grande', name: 'Hamburguesa Res (Grande)', price: 60, category: 'hamburguesas', icon: 'sandwich' },
  { id: 'pos-pollo', name: 'Hamburguesa de Pollo', price: 65, category: 'hamburguesas', icon: 'drumstick' },
  { id: 'pos-arrachera', name: 'Hamburguesa de Arrachera', price: 70, category: 'hamburguesas', icon: 'flame' },

  // Combos
  { id: 'pos-combo-1', name: 'Combo 1 (Res + 3 Alitas + Papas)', price: 110, category: 'combos', icon: 'sparkles' },
  { id: 'pos-combo-2', name: 'Combo 2 (Res + Refresco + Papas)', price: 100, category: 'combos', icon: 'sparkles' },
  { id: 'pos-combo-3', name: 'Combo 3 (Res + Hot Dog + Papas)', price: 100, category: 'combos', icon: 'sparkles' },
  { id: 'pos-combo-4', name: 'Combo 4 (Res + Dog + 2 Alitas + Papas)', price: 120, category: 'combos', icon: 'sparkles' },
  { id: 'pos-combo-fam-1', name: 'Combo Familiar (4 Res Gde + Papas + 2L)', price: 310, category: 'combos', icon: 'users' },
  { id: 'pos-combo-fam-2', name: 'Combo Familiar 2 (Arr + Pollo + 2 Res + Papas)', price: 330, category: 'combos', icon: 'users' },

  // Hot Dog & Sincronizadas
  { id: 'pos-hot-dog', name: 'Hot - Dog Especial', price: 40, category: 'hotdogs-sincronizadas', icon: 'flame' },
  { id: 'pos-sincronizada', name: 'Sincronizadas Especiales', price: 40, category: 'hotdogs-sincronizadas', icon: 'layers' },

  // Alitas & Papas
  { id: 'pos-alitas', name: 'Orden de Alitas (c/ Papas)', price: 70, category: 'alitas-papas', icon: 'drumstick' },
  { id: 'pos-papas', name: 'Orden de Papas', price: 60, category: 'alitas-papas', icon: 'utensils' },

  // Refrescos
  { id: 'pos-refresco', name: 'Refresco', price: 30, category: 'bebidas', icon: 'cup-soda' }
];

function renderPosCatalog() {
  const grid = document.getElementById('pos-items-grid');
  if (!grid) return;

  const filtered = POS_QUICK_ITEMS.filter(item => 
    currentCategory === 'all' || item.category === currentCategory
  );

  grid.innerHTML = filtered.map(item => `
    <button 
      type="button" 
      onclick="addItemToTicket('${item.id}')"
      class="touch-btn bg-[#1a1d26] hover:bg-[#202533] border border-gray-800 hover:border-amber-500/50 rounded-2xl p-3 flex flex-col justify-between text-left transition-all shadow-md active:scale-95 group h-24"
    >
      <div class="flex items-start justify-between w-full">
        <span class="text-[11px] font-bold text-gray-200 group-hover:text-amber-400 line-clamp-2 leading-tight">
          ${item.name}
        </span>
      </div>
      <div class="w-full flex items-center justify-between pt-1">
        <span class="font-bebas text-xl text-amber-400 leading-none">$${item.price}</span>
        <span class="w-6 h-6 rounded-lg bg-gray-800 group-hover:bg-amber-500 group-hover:text-black text-gray-400 flex items-center justify-center font-bold text-xs transition-colors">
          +
        </span>
      </div>
    </button>
  `).join('');

  initLucideIcons();
}

function filterPosCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.pos-cat-btn').forEach(btn => {
    btn.className = 'pos-cat-btn px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap bg-gray-800 text-gray-300';
  });
  event.target.className = 'pos-cat-btn px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap bg-amber-500 text-black';
  renderPosCatalog();
}

// ----------------------------------------------------
// 3. GESTIÓN DEL TICKET ACTUAL
// ----------------------------------------------------
function addItemToTicket(itemId) {
  const product = POS_QUICK_ITEMS.find(p => p.id === itemId);
  if (!product) return;

  const existing = currentTicket.find(t => t.id === itemId);
  if (existing) {
    existing.qty += 1;
    existing.total = existing.qty * existing.price;
  } else {
    currentTicket.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      total: product.price
    });
  }

  playBeep();
  updateTicketUI();
}

function updateTicketItemQty(index, delta) {
  if (!currentTicket[index]) return;
  currentTicket[index].qty += delta;

  if (currentTicket[index].qty <= 0) {
    currentTicket.splice(index, 1);
  } else {
    currentTicket[index].total = currentTicket[index].qty * currentTicket[index].price;
  }
  updateTicketUI();
}

function removeTicketItem(index) {
  currentTicket.splice(index, 1);
  updateTicketUI();
}

function clearCurrentTicket() {
  if (currentTicket.length === 0) return;
  currentTicket = [];
  document.getElementById('cash-received-input').value = '';
  document.getElementById('cash-change-display').textContent = '$0.00';
  updateTicketUI();
}

function setPosPayment(method) {
  currentPaymentMethod = method;
  const cashBtn = document.getElementById('pay-cash-btn');
  const transferBtn = document.getElementById('pay-transfer-btn');
  const cashCalcPanel = document.getElementById('cash-calc-panel');

  if (method === 'Efectivo') {
    cashBtn.className = 'py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 bg-emerald-600 text-white shadow-md';
    transferBtn.className = 'py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 bg-gray-800 text-gray-400 hover:text-white';
    cashCalcPanel.classList.remove('hidden');
  } else {
    transferBtn.className = 'py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 bg-blue-600 text-white shadow-md';
    cashBtn.className = 'py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 bg-gray-800 text-gray-400 hover:text-white';
    cashCalcPanel.classList.add('hidden');
  }
}

function setQuickCash(amount) {
  document.getElementById('cash-received-input').value = amount;
  calculateChange();
}

function calculateChange() {
  const ticketTotal = currentTicket.reduce((acc, curr) => acc + curr.total, 0);
  const receivedInput = parseFloat(document.getElementById('cash-received-input').value) || 0;
  const changeDisplay = document.getElementById('cash-change-display');

  if (receivedInput >= ticketTotal) {
    const change = receivedInput - ticketTotal;
    changeDisplay.textContent = `$${change.toFixed(2)}`;
    changeDisplay.className = 'font-bebas text-lg text-emerald-400 leading-none';
  } else {
    changeDisplay.textContent = 'Faltan $' + (ticketTotal - receivedInput).toFixed(2);
    changeDisplay.className = 'text-[11px] font-bold text-red-400 leading-none';
  }
}

function updateTicketUI() {
  const list = document.getElementById('ticket-items-list');
  const totalDisplay = document.getElementById('pos-ticket-total');
  const grandTotal = currentTicket.reduce((acc, curr) => acc + curr.total, 0);

  totalDisplay.textContent = `$${grandTotal.toFixed(2)}`;
  calculateChange();

  if (currentTicket.length === 0) {
    list.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center p-6 text-gray-600">
        <i data-lucide="shopping-cart" class="w-8 h-8 mb-2 opacity-50"></i>
        <p class="text-xs">Toca los platillos para agregar al ticket</p>
      </div>
    `;
    initLucideIcons();
    return;
  }

  list.innerHTML = currentTicket.map((item, idx) => `
    <div class="p-2 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center justify-between gap-2">
      <div class="flex-1 min-w-0">
        <p class="font-bold text-gray-200 text-xs truncate leading-tight">${item.name}</p>
        <span class="text-[10px] text-amber-500 font-semibold">$${item.price} c/u</span>
      </div>

      <div class="flex items-center gap-1.5 bg-gray-800 px-1.5 py-0.5 rounded-lg shrink-0">
        <button type="button" onclick="updateTicketItemQty(${idx}, -1)" class="w-5 h-5 rounded bg-gray-700 text-white font-bold text-xs flex items-center justify-center">-</button>
        <span class="text-xs font-bold text-white px-1">${item.qty}</span>
        <button type="button" onclick="updateTicketItemQty(${idx}, 1)" class="w-5 h-5 rounded bg-gray-700 text-white font-bold text-xs flex items-center justify-center">+</button>
      </div>

      <div class="text-right shrink-0">
        <span class="font-bebas text-base text-amber-400 block leading-tight">$${item.total}</span>
        <button type="button" onclick="removeTicketItem(${idx})" class="text-[10px] text-gray-500 hover:text-red-400">quitar</button>
      </div>
    </div>
  `).join('');

  initLucideIcons();
}

// ----------------------------------------------------
// 4. REGISTRO Y FINALIZACIÓN DE VENTA
// ----------------------------------------------------
function completeSale() {
  if (currentTicket.length === 0) {
    showPosToast('Agrega al menos un platillo al ticket');
    return;
  }

  const grandTotal = currentTicket.reduce((acc, curr) => acc + curr.total, 0);
  const now = new Date();
  
  // Construir registro de venta
  const saleRecord = {
    ticketId: 'TKT-' + Date.now().toString().slice(-5),
    dateStr: getLocalDateString(now), // YYYY-MM-DD
    timeStr: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    cashier: AUTH_USER,
    items: [...currentTicket],
    total: grandTotal,
    paymentMethod: currentPaymentMethod,
    cashReceived: parseFloat(document.getElementById('cash-received-input').value) || grandTotal,
    timestamp: now.getTime()
  };

  allSales.push(saleRecord);
  saveSalesToStorage();

  // Limpiar caja para la siguiente venta
  clearCurrentTicket();
  showPosToast(`✅ Venta #${saleRecord.ticketId} registrada ($${grandTotal})`);
  playCashSound();

  // Si está viendo el corte o historial, refrescarlo
  loadDailyReport();
  loadHistoryView();
}

// ----------------------------------------------------
// 5. CORTE DEL DÍA Y EXPORTACIÓN AL PATRÓN
// ----------------------------------------------------
function setupDatePicker() {
  const picker = document.getElementById('report-date-picker');
  if (picker) {
    picker.value = getLocalDateString(new Date());
  }
}

function loadDailyReport() {
  const picker = document.getElementById('report-date-picker');
  const targetDate = picker ? picker.value : getLocalDateString(new Date());

  const daysSales = allSales.filter(s => s.dateStr === targetDate);

  const total = daysSales.reduce((acc, s) => acc + s.total, 0);
  const cashTotal = daysSales.filter(s => s.paymentMethod === 'Efectivo').reduce((acc, s) => acc + s.total, 0);
  const transferTotal = daysSales.filter(s => s.paymentMethod === 'Transferencia').reduce((acc, s) => acc + s.total, 0);
  const orderCount = daysSales.length;

  document.getElementById('metric-total-sales').textContent = `$${total.toFixed(2)}`;
  document.getElementById('metric-cash-sales').textContent = `$${cashTotal.toFixed(2)}`;
  document.getElementById('metric-transfer-sales').textContent = `$${transferTotal.toFixed(2)}`;
  document.getElementById('metric-orders-count').textContent = orderCount;

  // Desglose de piezas vendidas
  const productCountMap = {};
  daysSales.forEach(s => {
    s.items.forEach(it => {
      productCountMap[it.name] = (productCountMap[it.name] || 0) + it.qty;
    });
  });

  const breakdownContainer = document.getElementById('breakdown-items-list');
  const entries = Object.entries(productCountMap);

  if (entries.length === 0) {
    breakdownContainer.innerHTML = `<p class="text-gray-500 text-xs italic">Aún no hay ventas registradas en esta fecha.</p>`;
  } else {
    breakdownContainer.innerHTML = entries
      .sort((a, b) => b[1] - a[1]) // Más vendido primero
      .map(([name, qty]) => `
        <div class="flex items-center justify-between p-2 rounded-xl bg-gray-900 border border-gray-800 text-xs">
          <span class="text-gray-200 font-semibold">${name}</span>
          <span class="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 font-bold">${qty} piezas</span>
        </div>
      `).join('');
  }
}

// Enviar corte formateado al WhatsApp del patrón
function sendReportToBossWhatsApp() {
  const picker = document.getElementById('report-date-picker');
  const targetDate = picker ? picker.value : getLocalDateString(new Date());
  const daysSales = allSales.filter(s => s.dateStr === targetDate);

  if (daysSales.length === 0) {
    showPosToast('No hay ventas registradas en esta fecha para exportar.');
    return;
  }

  const total = daysSales.reduce((acc, s) => acc + s.total, 0);
  const cashTotal = daysSales.filter(s => s.paymentMethod === 'Efectivo').reduce((acc, s) => acc + s.total, 0);
  const transferTotal = daysSales.filter(s => s.paymentMethod === 'Transferencia').reduce((acc, s) => acc + s.total, 0);
  const orderCount = daysSales.length;

  const productCountMap = {};
  daysSales.forEach(s => {
    s.items.forEach(it => {
      productCountMap[it.name] = (productCountMap[it.name] || 0) + it.qty;
    });
  });

  // Mensaje elegante para el patrón
  let msg = `📊 *CORTE DE CAJA - HAMBURGUESAS SHARON* 🍔\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📅 *Fecha:* ${targetDate}\n`;
  msg += `👤 *Cajero:* ${AUTH_USER}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *VENTA TOTAL DEL DÍA: $${total.toFixed(2)} MXN*\n`;
  msg += `💵 *Efectivo a entregar en caja:* $${cashTotal.toFixed(2)} MXN\n`;
  msg += `📱 *En Transferencias:* $${transferTotal.toFixed(2)} MXN\n`;
  msg += `📦 *Total de órdenes atendidas:* ${orderCount} tickets\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 *DESGLOSE DE PRODUCTOS VENDIDOS:*\n`;

  Object.entries(productCountMap)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, qty]) => {
      msg += ` • ${qty}x ${name}\n`;
    });

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Generado automáticamente desde el Punto de Venta móvil.`;

  const bossPhone = localStorage.getItem('sharon_boss_phone') || '';
  const cleanPhone = bossPhone.replace(/\D/g, '');

  let waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  if (cleanPhone.length >= 10) {
    const fullPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
    waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`;
  }

  window.open(waUrl, '_blank');
  showPosToast('Abriendo WhatsApp para enviar el reporte...');
}

// Descargar archivo Excel (CSV) compatible
function exportSalesToCSV() {
  const picker = document.getElementById('report-date-picker');
  const targetDate = picker ? picker.value : getLocalDateString(new Date());
  const daysSales = allSales.filter(s => s.dateStr === targetDate);

  if (daysSales.length === 0) {
    showPosToast('No hay ventas registradas para exportar en esta fecha');
    return;
  }

  // BOM UTF-8 para que Excel en Windows reconozca acentos perfectamente
  let csv = '\uFEFF';
  csv += 'ID Ticket,Fecha,Hora,Cajero,Artículos,Método de Pago,Total (MXN)\n';

  daysSales.forEach(s => {
    const itemsSummary = s.items.map(i => `${i.qty}x ${i.name}`).join(' | ');
    // Escapar comillas dobles
    const cleanItems = `"${itemsSummary.replace(/"/g, '""')}"`;
    csv += `${s.ticketId},${s.dateStr},${s.timeStr},"${s.cashier}",${cleanItems},${s.paymentMethod},${s.total}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `corte_sharon_${targetDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showPosToast('Archivo de Excel (CSV) descargado');
}

function saveBossPhone() {
  const val = document.getElementById('boss-phone-input').value.trim();
  localStorage.setItem('sharon_boss_phone', val);
  showPosToast('Teléfono del patrón guardado');
}

function loadBossPhone() {
  const saved = localStorage.getItem('sharon_boss_phone');
  const input = document.getElementById('boss-phone-input');
  if (saved && input) {
    input.value = saved;
  }
}

// ----------------------------------------------------
// 6. HISTORIAL DE TICKETS
// ----------------------------------------------------
function loadHistoryView() {
  const container = document.getElementById('history-tickets-container');
  const badge = document.getElementById('history-total-badge');
  if (!container) return;

  const picker = document.getElementById('report-date-picker');
  const targetDate = picker ? picker.value : getLocalDateString(new Date());

  const daysSales = allSales.filter(s => s.dateStr === targetDate).reverse(); // Más recientes arriba
  badge.textContent = `${daysSales.length} Ventas`;

  if (daysSales.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 text-gray-500 text-xs">
        <i data-lucide="receipt" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
        No hay ventas registradas en esta fecha.
      </div>
    `;
    initLucideIcons();
    return;
  }

  container.innerHTML = daysSales.map(sale => `
    <div class="p-3.5 rounded-2xl bg-[#161922] border border-gray-800 flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <span class="font-black text-white">#${sale.ticketId}</span>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${
            sale.paymentMethod === 'Efectivo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
          }">${sale.paymentMethod}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-gray-400 text-[11px]">${sale.timeStr}</span>
          <button onclick="deleteSale('${sale.ticketId}')" class="text-red-400 hover:text-red-300 text-xs" title="Borrar ticket por error">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      <div class="text-[11px] text-gray-300 border-t border-gray-800/60 pt-2 space-y-1">
        ${sale.items.map(it => `
          <div class="flex justify-between">
            <span>${it.qty}x ${it.name}</span>
            <span class="text-gray-400">$${it.total}</span>
          </div>
        `).join('')}
      </div>

      <div class="border-t border-gray-800/80 pt-1.5 flex justify-between items-center text-xs font-bold text-amber-400">
        <span>TOTAL COBRADO:</span>
        <span class="font-bebas text-lg leading-none">$${sale.total.toFixed(2)} MXN</span>
      </div>
    </div>
  `).join('');

  initLucideIcons();
}

function deleteSale(ticketId) {
  if (confirm(`¿Seguro que deseas eliminar la venta #${ticketId}? Esta acción restará la venta del corte.`)) {
    allSales = allSales.filter(s => s.ticketId !== ticketId);
    saveSalesToStorage();
    loadDailyReport();
    loadHistoryView();
    showPosToast(`Venta #${ticketId} eliminada`);
  }
}

// ----------------------------------------------------
// 7. PESTAÑAS (TABS)
// ----------------------------------------------------
function switchTab(tab) {
  const views = {
    caja: document.getElementById('view-caja'),
    corte: document.getElementById('view-corte'),
    historial: document.getElementById('view-historial')
  };

  const btns = {
    caja: document.getElementById('tab-btn-caja'),
    corte: document.getElementById('tab-btn-corte'),
    historial: document.getElementById('tab-btn-historial')
  };

  Object.keys(views).forEach(k => {
    if (k === tab) {
      views[k].classList.remove('hidden');
      btns[k].className = 'flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all bg-amber-500 text-black shadow-sm';
    } else {
      views[k].classList.add('hidden');
      btns[k].className = 'flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-gray-400 hover:text-white';
    }
  });

  if (tab === 'corte') loadDailyReport();
  if (tab === 'historial') loadHistoryView();

  initLucideIcons();
}

// ----------------------------------------------------
// 8. PERSISTENCIA EN LOCALSTORAGE & AUDIO
// ----------------------------------------------------
function saveSalesToStorage() {
  try {
    localStorage.setItem('sharon_pos_sales', JSON.stringify(allSales));
  } catch (e) {
    console.error('Error al guardar ventas', e);
  }
}

function loadSalesFromStorage() {
  try {
    const saved = localStorage.getItem('sharon_pos_sales');
    if (saved) {
      allSales = JSON.parse(saved);
    }
  } catch (e) {
    allSales = [];
  }
}

function getLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function showPosToast(msg) {
  const container = document.getElementById('pos-toast-container');
  if (!container) return;

  const t = document.createElement('div');
  t.className = 'bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full border border-gray-700 shadow-xl flex items-center gap-2 animate-bounce';
  t.innerHTML = `<span>${msg}</span>`;

  container.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// Sonidos ligeros usando Web Audio API (sin archivos externos)
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 650;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

function playCashSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}
