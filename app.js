/**
 * Hamburguesas Sharon - App Logic
 * Gestión interactiva de menú, filtros, modal de personalización y pedidos por WhatsApp
 */

// Estado global de la aplicación
let cart = [];
let activeCategory = 'all';
let searchQuery = '';
let deliveryMode = 'home'; // 'home' o 'pickup'

// Objeto temporal para el modal de personalización
let currentModalItem = null;
let currentModalSize = null;
let excludedIngredients = new Set();
let selectedDressings = new Set();
let modalQuantity = 1;

// Inicialización cuando carga el DOM
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  initLucideIcons();
  renderCategories();
  renderFeaturedCombos();
  renderMenuItems();
  setupEventListeners();
  updateCartUI();
});

// Inicializar iconos de Lucide
function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Configurar event listeners principales
function setupEventListeners() {
  // Buscador
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
    renderMenuItems();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    renderMenuItems();
  });

  // Drawer Carrito
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartDrawerBackdrop = document.getElementById('cart-drawer-backdrop');
  const cartDrawerPanel = document.getElementById('cart-drawer-panel');

  openCartBtn.addEventListener('click', openCartDrawer);
  closeCartBtn.addEventListener('click', closeCartDrawer);

  cartDrawerBackdrop.addEventListener('click', (e) => {
    if (e.target === cartDrawerBackdrop) {
      closeCartDrawer();
    }
  });

  // Modal Personalización
  document.getElementById('modal-add-btn').addEventListener('click', addCustomizedItemToCart);
}

// Renderizar Categorías
function renderCategories() {
  const container = document.getElementById('categories-tabs');
  if (!container) return;

  container.innerHTML = MENU_CATEGORIES.map(cat => {
    const isActive = cat.id === activeCategory;
    return `
      <button 
        onclick="setCategory('${cat.id}')"
        class="whitespace-nowrap px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
          isActive 
            ? 'bg-amber-500 text-black shadow-md scale-105' 
            : 'bg-gray-900/90 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800'
        }"
      >
        <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
        <span>${cat.name}</span>
      </button>
    `;
  }).join('');

  initLucideIcons();
}

function setCategory(catId) {
  activeCategory = catId;
  renderCategories();
  renderMenuItems();
}

function resetFilters() {
  activeCategory = 'all';
  searchQuery = '';
  document.getElementById('search-input').value = '';
  document.getElementById('clear-search-btn').classList.add('hidden');
  renderCategories();
  renderMenuItems();
}

// Renderizar Combos Destacados en la sección superior
function renderFeaturedCombos() {
  const container = document.getElementById('featured-combos-container');
  if (!container) return;

  // Mostramos 3 combos destacados (Combo 1, Combo 4, Combo Familiar)
  const featured = MENU_ITEMS.filter(item => 
    item.id === 'combo-1' || item.id === 'combo-4' || item.id === 'combo-familiar-1'
  );

  container.innerHTML = featured.map(item => `
    <div class="card-glow bg-[#181b22] border border-gray-800 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group">
      <div class="relative rounded-2xl overflow-hidden aspect-[16/10] mb-4">
        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-black shadow-md">
          ${item.badge || 'Ahorro'}
        </span>
        <span class="absolute bottom-3 right-3 px-3 py-1 rounded-xl font-bebas text-xl bg-black/80 text-amber-400 border border-amber-500/30">
          $${item.price} MXN
        </span>
      </div>

      <div class="space-y-2 flex-1">
        <h4 class="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">${item.name}</h4>
        <p class="text-xs text-gray-400 line-clamp-2">${item.description}</p>
        <ul class="text-[11px] text-gray-300 space-y-1 pt-1">
          ${(item.includes || []).map(inc => `<li class="flex items-center gap-1.5"><i data-lucide="check" class="w-3 h-3 text-emerald-400 shrink-0"></i> <span>${inc}</span></li>`).join('')}
        </ul>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
        <button onclick="openCustomizeModal('${item.id}')" class="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Ordenar Combo
        </button>
      </div>
    </div>
  `).join('');

  initLucideIcons();
}

// Renderizar Cuadrícula del Menú
function renderMenuItems() {
  const container = document.getElementById('menu-grid');
  const emptyState = document.getElementById('no-results');
  if (!container) return;

  const filtered = MENU_ITEMS.filter(item => {
    // Filtro por categoría
    const matchesCategory = (activeCategory === 'all') || (item.category === activeCategory);

    // Filtro por búsqueda
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery) ||
      (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(searchQuery)));

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  container.innerHTML = filtered.map(item => {
    // Determinar precio o rango de precios
    let priceLabel = `$${item.price} MXN`;
    if (item.hasSizes && item.sizes) {
      priceLabel = `Normal $${item.sizes[0].price} | Gde $${item.sizes[1].price}`;
    }

    return `
      <div class="card-glow bg-[#181b22] border border-gray-800/90 rounded-3xl p-5 flex flex-col justify-between relative group hover:border-amber-500/40">
        
        <div>
          <!-- Imagen del producto -->
          <div class="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4 bg-gray-900">
            <img src="${item.image}" alt="${item.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            
            ${item.badge ? `
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-black shadow-md flex items-center gap-1">
                ${item.badge}
              </span>
            ` : ''}

            <span class="absolute bottom-3 right-3 px-3 py-1 rounded-xl font-bebas text-lg bg-black/80 backdrop-blur-sm text-amber-400 border border-amber-500/30">
              ${priceLabel}
            </span>
          </div>

          <!-- Título y descripción -->
          <div class="space-y-2">
            <h3 class="font-bold text-lg text-white group-hover:text-amber-400 transition-colors leading-snug">
              ${item.name}
            </h3>
            <p class="text-xs text-gray-400 leading-relaxed">
              ${item.description}
            </p>

            ${item.ingredients ? `
              <div class="pt-1">
                <span class="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Incluye:</span>
                <p class="text-[11px] text-gray-300 line-clamp-2">
                  ${item.ingredients.join(', ')}
                </p>
              </div>
            ` : ''}

            ${item.includes ? `
              <div class="pt-1 space-y-0.5">
                ${item.includes.map(inc => `
                  <p class="text-[11px] text-gray-300 flex items-center gap-1">
                    <i data-lucide="check" class="w-3 h-3 text-emerald-400 shrink-0"></i>
                    <span>${inc}</span>
                  </p>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="mt-5 pt-4 border-t border-gray-800/80 flex items-center gap-2">
          <button 
            onclick="openCustomizeModal('${item.id}')"
            class="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <i data-lucide="sliders" class="w-3.5 h-3.5"></i>
            Personalizar y Pedir
          </button>

          <button 
            onclick="quickAddToCart('${item.id}')"
            title="Agregar rápido con todo"
            class="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 text-white flex items-center justify-center transition-all border border-gray-700"
          >
            <i data-lucide="plus" class="w-4 h-4 text-amber-400"></i>
          </button>
        </div>

      </div>
    `;
  }).join('');

  initLucideIcons();
}

// ----------------------------------------------------
// MODAL DE PERSONALIZACIÓN
// ----------------------------------------------------
function openCustomizeModal(itemId) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  currentModalItem = item;
  excludedIngredients = new Set();
  selectedDressings = new Set();
  modalQuantity = 1;

  // Llenar información básica
  document.getElementById('modal-item-title').textContent = item.name;
  document.getElementById('modal-item-img').src = item.image;
  document.getElementById('modal-item-img').alt = item.name;
  document.getElementById('modal-qty-display').textContent = modalQuantity;
  document.getElementById('modal-notes-input').value = '';

  // Configuración de Tamaños
  const sizeContainer = document.getElementById('modal-size-container');
  const sizesRadioContainer = document.getElementById('modal-sizes-radio');
  if (item.hasSizes && item.sizes) {
    sizeContainer.classList.remove('hidden');
    currentModalSize = item.sizes[0]; // default Normal
    sizesRadioContainer.innerHTML = item.sizes.map((s, idx) => `
      <label class="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
        idx === 0 ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-gray-700 bg-gray-900 text-gray-300'
      }" onclick="selectModalSize(${idx}, this)">
        <div class="flex items-center gap-2">
          <input type="radio" name="modal_size" value="${s.name}" ${idx === 0 ? 'checked' : ''} class="accent-amber-500">
          <span class="font-bold text-xs">${s.name}</span>
        </div>
        <span class="text-amber-400 font-bold text-xs">$${s.price} MXN</span>
      </label>
    `).join('');
  } else {
    sizeContainer.classList.add('hidden');
    currentModalSize = null;
  }

  // Configuración de Refresco/Sabores
  const flavorContainer = document.getElementById('modal-flavor-container');
  const flavorSelect = document.getElementById('modal-flavor-select');
  if (item.options && item.options.length > 0) {
    flavorContainer.classList.remove('hidden');
    flavorSelect.innerHTML = item.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
  } else {
    flavorContainer.classList.add('hidden');
  }

  // Configuración de Ingredientes
  const ingContainer = document.getElementById('modal-ingredients-container');
  const chipsContainer = document.getElementById('modal-ingredients-chips');
  const ingredientsList = item.ingredients || (item.allowsCustomBurger ? DEFAULT_BURGER_INGREDIENTS : null);

  if (ingredientsList && ingredientsList.length > 0) {
    ingContainer.classList.remove('hidden');
    chipsContainer.innerHTML = ingredientsList.map(ing => `
      <button 
        type="button"
        onclick="toggleIngredient('${ing}', this)"
        class="ingredient-chip px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-900 text-xs text-gray-200 hover:border-amber-500/60"
      >
        <span class="check-icon mr-1 text-emerald-400">✓</span> ${ing}
      </button>
    `).join('');
  } else {
    ingContainer.classList.add('hidden');
  }

  // Configuración de Aderezos
  const dressingsContainer = document.getElementById('modal-dressings-container');
  const dressingsCheckboxes = document.getElementById('modal-dressings-checkboxes');
  if (item.allowsDressingSelection || item.dressings) {
    dressingsContainer.classList.remove('hidden');
    dressingsCheckboxes.innerHTML = AVAILABLE_DRESSINGS.map(dressing => `
      <label class="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900 border border-gray-700 cursor-pointer text-xs text-gray-200 hover:border-amber-500/60">
        <input type="checkbox" value="${dressing}" onchange="toggleDressing('${dressing}', this)" class="accent-amber-500 rounded">
        <span>${dressing}</span>
      </label>
    `).join('');
  } else {
    dressingsContainer.classList.add('hidden');
  }

  updateModalPrice();

  // Mostrar modal con animación
  const modal = document.getElementById('customize-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  initLucideIcons();
}

function selectModalSize(index, element) {
  if (!currentModalItem || !currentModalItem.sizes) return;
  currentModalSize = currentModalItem.sizes[index];

  // Actualizar estilos de radio
  const labels = element.parentElement.querySelectorAll('label');
  labels.forEach(l => {
    l.classList.remove('border-amber-500', 'bg-amber-500/10', 'text-white');
    l.classList.add('border-gray-700', 'bg-gray-900', 'text-gray-300');
  });
  element.classList.remove('border-gray-700', 'bg-gray-900', 'text-gray-300');
  element.classList.add('border-amber-500', 'bg-amber-500/10', 'text-white');

  updateModalPrice();
}

function toggleIngredient(ingredient, element) {
  if (excludedIngredients.has(ingredient)) {
    excludedIngredients.delete(ingredient);
    element.classList.remove('excluded');
    element.querySelector('.check-icon').textContent = '✓';
    element.querySelector('.check-icon').className = 'check-icon mr-1 text-emerald-400';
  } else {
    excludedIngredients.add(ingredient);
    element.classList.add('excluded');
    element.querySelector('.check-icon').textContent = '✕';
    element.querySelector('.check-icon').className = 'check-icon mr-1 text-red-400';
  }
}

function toggleDressing(dressing, element) {
  if (element.checked) {
    selectedDressings.add(dressing);
  } else {
    selectedDressings.delete(dressing);
  }
}

function changeModalQty(delta) {
  modalQuantity = Math.max(1, modalQuantity + delta);
  document.getElementById('modal-qty-display').textContent = modalQuantity;
  updateModalPrice();
}

function updateModalPrice() {
  if (!currentModalItem) return;
  const unitPrice = currentModalSize ? currentModalSize.price : currentModalItem.price;
  const total = unitPrice * modalQuantity;
  document.getElementById('modal-item-base-price').textContent = `$${unitPrice} MXN`;
  document.getElementById('modal-total-price').textContent = `$${total} MXN`;
}

function closeCustomizeModal() {
  const modal = document.getElementById('customize-modal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
  currentModalItem = null;
}

// Agregar item personalizado al carrito
function addCustomizedItemToCart() {
  if (!currentModalItem) return;

  const unitPrice = currentModalSize ? currentModalSize.price : currentModalItem.price;
  const sizeName = currentModalSize ? currentModalSize.name : null;
  const notes = document.getElementById('modal-notes-input').value.trim();

  let flavor = null;
  const flavorSelect = document.getElementById('modal-flavor-select');
  if (currentModalItem.options && !flavorSelect.closest('#modal-flavor-container').classList.contains('hidden')) {
    flavor = flavorSelect.value;
  }

  const cartItem = {
    cartItemId: Date.now() + Math.random().toString(36).substr(2, 4),
    id: currentModalItem.id,
    name: currentModalItem.name,
    image: currentModalItem.image,
    size: sizeName,
    unitPrice: unitPrice,
    quantity: modalQuantity,
    excludedIngredients: Array.from(excludedIngredients),
    dressings: Array.from(selectedDressings),
    flavor: flavor,
    notes: notes,
    totalPrice: unitPrice * modalQuantity
  };

  cart.push(cartItem);
  saveCartToStorage();
  updateCartUI();
  closeCustomizeModal();
  showToast(`¡${currentModalItem.name} agregado al pedido!`);
}

// Agregar rápido sin abrir modal (con todo incluido)
function quickAddToCart(itemId) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  // Si tiene opciones de tamaño (como Res) o sabores, abrimos el modal para que elija
  if (item.hasSizes || item.options) {
    openCustomizeModal(itemId);
    return;
  }

  const cartItem = {
    cartItemId: Date.now() + Math.random().toString(36).substr(2, 4),
    id: item.id,
    name: item.name,
    image: item.image,
    size: null,
    unitPrice: item.price,
    quantity: 1,
    excludedIngredients: [],
    dressings: [],
    flavor: null,
    notes: '',
    totalPrice: item.price
  };

  cart.push(cartItem);
  saveCartToStorage();
  updateCartUI();
  showToast(`¡${item.name} agregado al pedido!`);
}

// ----------------------------------------------------
// GESTIÓN DEL CARRITO Y DRAWER
// ----------------------------------------------------
function openCartDrawer() {
  const backdrop = document.getElementById('cart-drawer-backdrop');
  const panel = document.getElementById('cart-drawer-panel');
  backdrop.classList.add('active');
  panel.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  const backdrop = document.getElementById('cart-drawer-backdrop');
  const panel = document.getElementById('cart-drawer-panel');
  backdrop.classList.remove('active');
  panel.classList.remove('active');
  document.body.style.overflow = 'auto';
}

function updateCartItemQty(cartItemId, delta) {
  const item = cart.find(i => i.cartItemId === cartItemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.cartItemId !== cartItemId);
  } else {
    item.totalPrice = item.unitPrice * item.quantity;
  }

  saveCartToStorage();
  updateCartUI();
}

function removeCartItem(cartItemId) {
  cart = cart.filter(i => i.cartItemId !== cartItemId);
  saveCartToStorage();
  updateCartUI();
  showToast('Producto eliminado');
}

function setDeliveryMode(mode) {
  deliveryMode = mode;
  const homeBtn = document.getElementById('delivery-tab-home');
  const pickupBtn = document.getElementById('delivery-tab-pickup');
  const addressContainer = document.getElementById('address-field-container');

  if (mode === 'home') {
    homeBtn.className = 'py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-amber-500 text-black';
    pickupBtn.className = 'py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-gray-400 hover:text-white';
    addressContainer.classList.remove('hidden');
  } else {
    pickupBtn.className = 'py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-amber-500 text-black';
    homeBtn.className = 'py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-gray-400 hover:text-white';
    addressContainer.classList.add('hidden');
  }
}

function toggleCashChangeField() {
  const paymentMethod = document.getElementById('payment-method').value;
  const changeInput = document.getElementById('customer-change');
  if (paymentMethod === 'Transferencia') {
    changeInput.placeholder = 'Referencia bancaria';
  } else {
    changeInput.placeholder = '¿Pagas con billete de...?';
  }
}

function updateCartUI() {
  const totalCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = cart.reduce((acc, curr) => acc + curr.totalPrice, 0);

  // Badges y contadores
  const badge = document.getElementById('cart-count-badge');
  badge.textContent = totalCount;
  badge.classList.toggle('scale-125', true);
  setTimeout(() => badge.classList.remove('scale-125'), 200);

  document.getElementById('drawer-items-count').textContent = `${totalCount} ${totalCount === 1 ? 'artículo' : 'artículos'} agregados`;
  document.getElementById('cart-subtotal').textContent = `$${subtotal} MXN`;
  document.getElementById('cart-total').textContent = `$${subtotal} MXN`;

  // Render de elementos dentro del drawer
  const container = document.getElementById('cart-items-container');
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
        <div class="w-16 h-16 rounded-2xl bg-gray-800 text-gray-500 flex items-center justify-center">
          <i data-lucide="shopping-cart" class="w-8 h-8"></i>
        </div>
        <h4 class="font-bold text-gray-300">Tu carrito está vacío</h4>
        <p class="text-xs text-gray-500 max-w-xs">Agrega unas deliciosas hamburguesas, sincronizadas o combos para comenzar tu orden.</p>
        <button onclick="closeCartDrawer()" class="mt-3 px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-xl hover:bg-amber-400 transition-colors">
          Explorar Menú
        </button>
      </div>
    `;
    initLucideIcons();
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="p-3.5 rounded-2xl bg-gray-900 border border-gray-800 space-y-2.5">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-3">
          <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-xl object-cover shrink-0">
          <div>
            <h5 class="font-bold text-sm text-white leading-tight">
              ${item.name} ${item.size ? `<span class="text-amber-400 font-semibold text-xs">(${item.size})</span>` : ''}
            </h5>
            <span class="text-xs text-amber-500 font-semibold">$${item.unitPrice} c/u</span>
          </div>
        </div>

        <button onclick="removeCartItem('${item.cartItemId}')" class="text-gray-500 hover:text-red-400 p-1 transition-colors" title="Eliminar">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Detalles y notas de personalización -->
      ${(item.excludedIngredients && item.excludedIngredients.length > 0) || (item.dressings && item.dressings.length > 0) || item.flavor || item.notes ? `
        <div class="p-2 rounded-xl bg-gray-950/70 border border-gray-800/80 text-[11px] space-y-1 text-gray-400">
          ${item.excludedIngredients && item.excludedIngredients.length > 0 ? `
            <p><strong class="text-red-400">Sin:</strong> ${item.excludedIngredients.join(', ')}</p>
          ` : ''}
          ${item.dressings && item.dressings.length > 0 ? `
            <p><strong class="text-amber-400">Aderezos:</strong> ${item.dressings.join(', ')}</p>
          ` : ''}
          ${item.flavor ? `
            <p><strong class="text-blue-400">Sabor:</strong> ${item.flavor}</p>
          ` : ''}
          ${item.notes ? `
            <p><strong class="text-gray-300">Nota:</strong> ${item.notes}</p>
          ` : ''}
        </div>
      ` : ''}

      <!-- Control de cantidades y Total -->
      <div class="flex items-center justify-between pt-1">
        <div class="flex items-center gap-2 bg-gray-800 px-2 py-1 rounded-xl">
          <button onclick="updateCartItemQty('${item.cartItemId}', -1)" class="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center font-bold text-xs">-</button>
          <span class="text-xs font-bold text-white px-1.5">${item.quantity}</span>
          <button onclick="updateCartItemQty('${item.cartItemId}', 1)" class="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center font-bold text-xs">+</button>
        </div>

        <span class="font-bebas text-lg text-amber-400">$${item.totalPrice} MXN</span>
      </div>
    </div>
  `).join('');

  initLucideIcons();
}

// ----------------------------------------------------
// GENERACIÓN Y ENVÍO DEL PEDIDO A WHATSAPP
// ----------------------------------------------------
function submitOrderToWhatsApp() {
  if (cart.length === 0) {
    showToast('Tu carrito está vacío. Agrega productos primero.');
    return;
  }

  const customerName = document.getElementById('customer-name').value.trim();
  const customerPhone = document.getElementById('customer-phone').value.trim();
  const customerAddress = document.getElementById('customer-address').value.trim();
  const paymentMethod = document.getElementById('payment-method').value;
  const customerChange = document.getElementById('customer-change').value.trim();

  // Validaciones
  if (!customerName) {
    showToast('Por favor escribe tu nombre completo');
    document.getElementById('customer-name').focus();
    return;
  }

  if (!customerPhone) {
    showToast('Por favor escribe tu número de teléfono');
    document.getElementById('customer-phone').focus();
    return;
  }

  if (deliveryMode === 'home' && !customerAddress) {
    showToast('Por favor ingresa tu dirección para la entrega');
    document.getElementById('customer-address').focus();
    return;
  }

  const subtotal = cart.reduce((acc, curr) => acc + curr.totalPrice, 0);

  // Formato del mensaje para WhatsApp
  let message = `🍔 *NUEVO PEDIDO - HAMBURGUESAS SHARON* 🍔\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `👤 *Cliente:* ${customerName}\n`;
  message += `📞 *Teléfono:* ${customerPhone}\n`;
  
  if (deliveryMode === 'home') {
    message += `🛵 *Tipo de entrega:* A Domicilio (Envío GRATIS)\n`;
    message += `📍 *Dirección:* ${customerAddress}\n`;
  } else {
    message += `🛍️ *Tipo de entrega:* Pickup (Recoger en puesto)\n`;
  }

  message += `💳 *Método de pago:* ${paymentMethod}\n`;
  if (customerChange) {
    message += `💵 *Detalle de pago:* ${customerChange}\n`;
  }

  message += `\n📝 *DETALLE DE LA ORDEN:*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;

  cart.forEach((item, index) => {
    const sizeStr = item.size ? ` (${item.size})` : '';
    message += `*${item.quantity}x* ${item.name}${sizeStr} - $${item.totalPrice} MXN\n`;

    if (item.excludedIngredients && item.excludedIngredients.length > 0) {
      message += `   ↳ 🚫 *Sin:* ${item.excludedIngredients.join(', ')}\n`;
    }
    if (item.dressings && item.dressings.length > 0) {
      message += `   ↳ 🥫 *Aderezos:* ${item.dressings.join(', ')}\n`;
    }
    if (item.flavor) {
      message += `   ↳ 🥤 *Sabor:* ${item.flavor}\n`;
    }
    if (item.notes) {
      message += `   ↳ ✍️ *Nota:* ${item.notes}\n`;
    }
  });

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🛵 *Envío:* ¡GRATIS!\n`;
  message += `💰 *TOTAL A PAGAR: $${subtotal} MXN*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `¡Muchas gracias por su preferencia!`;

  // Generar link de WhatsApp
  const phone = RESTAURANT_INFO.whatsappNumber; // 527727365672
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  // Abrir WhatsApp en nueva pestaña
  window.open(waUrl, '_blank');
  showToast('¡Abriendo WhatsApp para enviar tu pedido!');
}

// ----------------------------------------------------
// MODAL DE CÓDIGO QR
// ----------------------------------------------------
function openQRModal() {
  const modal = document.getElementById('qr-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    initLucideIcons();
  }
}

function closeQRModal() {
  const modal = document.getElementById('qr-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// ----------------------------------------------------
// PERSISTENCIA Y TOASTS
// ----------------------------------------------------
function saveCartToStorage() {
  try {
    localStorage.setItem('sharon_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Error al guardar carrito en localStorage', e);
  }
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('sharon_cart');
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error al cargar carrito de localStorage', e);
    cart = [];
  }
}

function showToast(text) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>
    <span>${text}</span>
  `;

  container.appendChild(toast);
  initLucideIcons();

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
