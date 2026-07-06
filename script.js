  // ---------- navigation helpers ----------
  function showScreen(id){
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // ---------- landing ----------
  document.getElementById('btn-ambulance').addEventListener('click', () => {
    showScreen('screen-keypad');
  });
  document.getElementById('btn-register').addEventListener('click', () => {
    showScreen('screen-form');
  });

  // ---------- populate date selects ----------
  const diaSel = document.getElementById('f-dia');
  const mesSel = document.getElementById('f-mes');
  const anioSel = document.getElementById('f-anio');
  diaSel.innerHTML = '<option value="">Día</option>' + Array.from({length:31}, (_,i)=>`<option>${i+1}</option>`).join('');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  mesSel.innerHTML = '<option value="">Mes</option>' + meses.map(m=>`<option>${m}</option>`).join('');
  let years = [];
  for(let y=2015; y>=1930; y--) years.push(y);
  anioSel.innerHTML = '<option value="">Año</option>' + years.map(y=>`<option>${y}</option>`).join('');

  // ---------- form validation ----------
  function setInvalid(fieldId, invalid){
    const el = document.getElementById(fieldId);
    el.classList.toggle('invalid', invalid);
  }

  function validateForm(){
    let valid = true;

    const nombre = document.getElementById('f-nombre').value.trim();
    setInvalid('fld-nombre', !nombre); if(!nombre) valid = false;

    const idn = document.getElementById('f-id').value.trim();
    setInvalid('fld-id', !idn); if(!idn) valid = false;

    const sexo = document.querySelector('input[name="sexo"]:checked');
    setInvalid('fld-sexo', !sexo); if(!sexo) valid = false;

    const correo = document.getElementById('f-correo').value.trim();
    const correoOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    document.getElementById('err-correo-msg').textContent = correo ? 'Ingresa un correo válido' : 'Este campo es obligatorio';
    setInvalid('fld-correo', !correoOk); if(!correoOk) valid = false;

    const fechaOk = diaSel.value && mesSel.value && anioSel.value;
    setInvalid('fld-fecha', !fechaOk); if(!fechaOk) valid = false;

    const tel = document.getElementById('f-tel').value.trim();
    const telOk = /^[0-9\-]{7,}$/.test(tel);
    document.getElementById('err-tel-text').textContent = tel
      ? 'Porfavor introduzca correctamente el número de teléfono'
      : 'Este campo es obligatorio';
    document.getElementById('err-tel-banner').classList.toggle('show', !telOk);
    setInvalid('fld-tel', !telOk); if(!telOk) valid = false;

    return valid;
  }

  document.getElementById('btn-crear-cuenta').addEventListener('click', () => {
    if(validateForm()){
      const nombre = document.getElementById('f-nombre').value.trim();
      document.getElementById('agenda-user-name').textContent = nombre;
      startPermissions();
    } else {
      const firstInvalid = document.querySelector('.field.invalid');
      if(firstInvalid) firstInvalid.scrollIntoView({behavior:'smooth', block:'center'});
    }
  });

  // ---------- permission chain ----------
  const permissionQueue = ['location','calendar','notif'];
  let permIndex = 0;

  function startPermissions(){
    permIndex = 0;
    showScreen('screen-permission-' + permissionQueue[permIndex]);
  }

  function nextPermission(){
    permIndex++;
    if(permIndex < permissionQueue.length){
      showScreen('screen-permission-' + permissionQueue[permIndex]);
    } else {
      switchTab('noticias');
    }
  }

  function permissionChoice(type, choice){
    if(choice === 'always'){
      nextPermission();
    } else {
      showScreen('screen-warning-' + type);
    }
  }

  function warningChoice(type, confirmed){
    if(confirmed){
      nextPermission();
    } else {
      showScreen('screen-permission-' + type);
    }
  }

  // ---------- main app: tabs / nav ----------
  let lastMainTab = 'noticias';
  function switchTab(tab){
    const map = {
      noticias: 'screen-noticias',
      centros: 'screen-centros',
      especialistas: 'screen-especialistas',
      medicamentos: 'screen-medicamentos',
      agenda: 'screen-agenda'
    };
    lastMainTab = tab;
    showScreen(map[tab]);
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    closeAllMenus();
  }

  function openInfoScreen(name){
    closeAllMenus();
    if(name === 'cuenta') renderCuenta();
    showScreen('screen-' + name);
  }

  function renderCuenta(){
    const nombre = document.getElementById('f-nombre').value.trim();
    document.getElementById('acc-name').textContent = nombre || 'Usuario';
    const anio = anioSel.value;
    document.getElementById('acc-age').textContent = anio ? `Edad - ${2026 - parseInt(anio)} años` : 'Edad no disponible';
    document.getElementById('acc-id').textContent = document.getElementById('f-id').value.trim() || '—';
    const sexo = document.querySelector('input[name="sexo"]:checked');
    document.getElementById('acc-sexo').textContent = sexo ? sexo.value : '—';
    document.getElementById('acc-correo').textContent = document.getElementById('f-correo').value.trim() || '—';
    const fecha = (diaSel.value && mesSel.value && anioSel.value) ? `${diaSel.value} ${mesSel.value} ${anioSel.value}` : '—';
    document.getElementById('acc-fecha').textContent = fecha;
    document.getElementById('acc-tel').textContent = document.getElementById('f-tel').value.trim() || '—';
  }

  // ---------- Accesibilidad ----------
  function setTextSize(size, btn){
    document.querySelectorAll('.text-size-row button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const zoom = size === 'small' ? 0.9 : size === 'large' ? 1.15 : 1;
    document.getElementById('app-shell').style.zoom = zoom;
  }

  function toggleContrast(btn){
    btn.classList.toggle('on');
    document.getElementById('app-shell').style.filter = btn.classList.contains('on') ? 'contrast(1.25) saturate(1.15)' : '';
  }

  function toggleDarkMode(btn){
    btn.classList.toggle('on');
    document.getElementById('app-shell').classList.toggle('dark-mode', btn.classList.contains('on'));
  }

  // ---------- Comentarios ----------
  let feedbackRating = 0;
  function rateFeedback(n){
    feedbackRating = n;
    document.querySelectorAll('#feedback-stars span').forEach((s, i) => {
      s.classList.toggle('filled', i < n);
    });
  }

  function submitFeedback(){
    document.getElementById('feedback-toast').classList.add('show');
    setTimeout(() => {
      document.getElementById('feedback-toast').classList.remove('show');
      document.getElementById('feedback-text').value = '';
      rateFeedback(0);
      switchTab(lastMainTab);
    }, 1600);
  }

  function closeAllMenus(){
    document.querySelectorAll('.menu-panel').forEach(m => m.classList.remove('show'));
  }

  function toggleMenu(){
    const panel = event.currentTarget.nextElementSibling;
    const wasOpen = panel.classList.contains('show');
    closeAllMenus();
    if(!wasOpen) panel.classList.add('show');
  }

  document.addEventListener('click', (e) => {
    if(!e.target.closest('.hamburger-btn') && !e.target.closest('.menu-panel')){
      closeAllMenus();
    }
  });

  function toggleFilter(name){
    const panel = document.getElementById('filter-' + name);
    panel.classList.toggle('show');
  }

  function setEspTab(which){
    document.getElementById('esp-tab-doctores').classList.toggle('active', which === 'doctores');
    document.getElementById('esp-tab-especialidades').classList.toggle('active', which === 'especialidades');
    document.getElementById('filter-especialidades').classList.toggle('show', which === 'especialidades');
  }

  function applyCentrosFilter(changed){
    const panel = document.getElementById('filter-centros');
    const boxes = panel.querySelectorAll('input[type=checkbox]');
    const todos = panel.querySelector('input[data-type="todos"]');
    if(changed === todos){
      if(todos.checked){ boxes.forEach(b => { if(b !== todos) b.checked = false; }); }
      else { todos.checked = true; }
    } else {
      if(changed && changed.checked) todos.checked = false;
      const anyOther = Array.from(boxes).some(b => b !== todos && b.checked);
      if(!anyOther) todos.checked = true;
    }
    const q = (document.getElementById('centros-search')?.value || '').trim().toLowerCase();
    const active = Array.from(boxes).filter(b => b !== todos && b.checked).map(b => b.dataset.type);
    const showAll = todos.checked || active.length === 0;
    let visible = 0;
    document.querySelectorAll('#screen-centros .hosp-card').forEach(card => {
      const typeOk = showAll || active.includes(card.dataset.type);
      const nameOk = !q || (card.dataset.name || '').toLowerCase().includes(q);
      const show = typeOk && nameOk;
      card.style.display = show ? '' : 'none';
      if(show) visible++;
    });
    const empty = document.getElementById('centros-empty');
    if(empty) empty.style.display = (q && visible === 0) ? 'block' : 'none';
  }


  function applyEspFilter(changed){
    const panel = document.getElementById('filter-especialidades');
    const boxes = panel.querySelectorAll('input[type=checkbox]');
    const todos = panel.querySelector('input[data-spec="todos"]');
    if(changed === todos){
      if(todos.checked){ boxes.forEach(b => { if(b !== todos) b.checked = false; }); }
      else { todos.checked = true; }
    } else {
      if(changed && changed.checked) todos.checked = false;
      const anyOther = Array.from(boxes).some(b => b !== todos && b.checked);
      if(!anyOther) todos.checked = true;
    }
    applyDoctorsView();
  }

  function filterDoctors(){ applyDoctorsView(); }

  function applyDoctorsView(){
    const panel = document.getElementById('filter-especialidades');
    const todos = panel.querySelector('input[data-spec="todos"]');
    const active = Array.from(panel.querySelectorAll('input[type=checkbox]'))
      .filter(b => b !== todos && b.checked)
      .map(b => b.dataset.spec.toLowerCase());
    const showAll = todos.checked || active.length === 0;
    const query = (document.getElementById('doc-search')?.value || '').trim().toLowerCase();
    document.querySelectorAll('#screen-especialistas .doc-card').forEach(card => {
      const name = (card.querySelector('.doc-name')?.textContent || '').toLowerCase();
      const specText = (card.querySelector('.doc-spec')?.textContent || '').toLowerCase();
      const matchesSpec = showAll || active.some(s => specText.includes(s));
      const matchesName = !query || name.includes(query);
      card.style.display = (matchesSpec && matchesName) ? '' : 'none';
    });
  }

  // =========================================================================
  //  MEDICAMENTOS / CARRITO — modelo de datos multi-producto y multi-farmacia
  // =========================================================================

  // Catálogo leído una sola vez desde las tarjetas del DOM: id -> info del medicamento
  const MED_INFO = {};
  function buildMedCatalog(){
    document.querySelectorAll('#med-list .med-card[data-id]').forEach(card => {
      const id = card.dataset.id;
      const priceText = card.querySelector('.med-price')?.textContent || '$0.00';
      const hoursEl = card.querySelector('.med-hours');
      MED_INFO[id] = {
        id,
        name: card.querySelector('.med-name')?.textContent.trim() || '',
        box: card.querySelector('.med-box')?.textContent.trim() || '',
        stock: card.querySelector('.med-stock')?.textContent.trim() || '',
        pharm: card.querySelector('.med-pharm')?.textContent.trim() || '',
        hoursText: hoursEl?.textContent.trim() || '',
        hoursClass: hoursEl?.classList.contains('closed') ? 'closed' : 'open',
        price: parseFloat(priceText.replace('$','')) || 0,
        color: card.querySelector('.med-thumb')?.style.background || '#999',
        icon: card.querySelector('.med-thumb')?.textContent.trim() || '💊'
      };
    });
  }
  buildMedCatalog();

  // Direcciones conocidas de cada farmacia (usadas en el carrito, mapa y confirmación de pago)
  const PHARMACY_ADDRESSES = {
    'Farmacia Arrocha': 'Vía España, Plaza Concordia, Ciudad de Panamá.',
    'Farmacia EL Javillo': 'Calle 5ta, El Javillo, La Chorrera, Panamá.',
    'Farmacia Plus': 'Av. Central, Local 12, Ciudad de Panamá.',
    'Farmacia Metro': 'Av. Ricardo J. Alfaro, Metromall, Ciudad de Panamá.',
    'Farmacia Revilla': 'Calle 50, Bella Vista, Ciudad de Panamá.'
  };

  // cart: { [medId]: cantidad }
  let cart = {};

  function cartTotalCount(){
    return Object.values(cart).reduce((sum, q) => sum + q, 0);
  }

  function addToCart(id, delta = 1){
    const current = cart[id] || 0;
    const next = Math.max(0, current + delta);
    if(next === 0){ delete cart[id]; } else { cart[id] = next; }
    renderMedCardActions(id);
    updateCartBar();
    // si el carrito ya está abierto, refleja el cambio en vivo
    if(document.getElementById('screen-cart').classList.contains('active')){
      renderCartItems();
      updateCartSummary();
    }
  }

  function renderMedCardActions(id){
    const container = document.getElementById('actions-' + id);
    if(!container) return;
    const qty = cart[id] || 0;
    // Solo mostramos el botón "+ Agregar" en el listado de medicamentos.
    // La cantidad se gestiona desde la pantalla del carrito.
    const label = qty > 0 ? `Agregado (${qty})` : '+ Agregar';
    const cls = qty > 0 ? 'med-add-btn added' : 'med-add-btn';
    container.innerHTML = `<button class="${cls}" onclick="addToCart('${id}',1)">${label}</button>`;
  }

  function renderAllMedCardActions(){
    Object.keys(MED_INFO).forEach(renderMedCardActions);
  }
  renderAllMedCardActions();

  function updateCartBar(){
    const count = cartTotalCount();
    document.getElementById('cart-count').textContent = count;
    document.getElementById('cart-bar').classList.toggle('show', count > 0);
  }

  function getCartPharmacyNames(){
    const names = Object.keys(cart).map(id => MED_INFO[id]?.pharm).filter(Boolean);
    return [...new Set(names)];
  }

  function showCart(){
    renderCartItems();
    updateCartSummary();
    showScreen('screen-cart');
  }

  function renderCartItems(){
    const container = document.getElementById('cart-items');
    const ids = Object.keys(cart);
    if(ids.length === 0){
      container.innerHTML = `<div class="cart-empty">Tu carrito está vacío. Agrega medicamentos desde la lista.</div>`;
      return;
    }
    container.innerHTML = ids.map(id => {
      const info = MED_INFO[id];
      const qty = cart[id];
      return `
        <div class="cart-item">
          <div class="med-thumb" style="background:${info.color}">${info.icon}</div>
          <div class="med-body">
            <div class="med-name">${info.name}</div>
            <div class="med-box">${info.box}</div>
            <div class="med-pharm">${info.pharm}</div>
            <div class="med-hours ${info.hoursClass}">${info.hoursText}</div>
            <div class="qty-row">
              <div class="med-price">$${info.price.toFixed(2)}</div>
              <button onclick="addToCart('${id}',-1)">−</button>
              <span class="qty-val">${qty}</span>
              <button onclick="addToCart('${id}',1)">+</button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  let fulfillMode = 'pickup';
  function setFulfill(mode){
    fulfillMode = mode;
    document.getElementById('fulfill-pickup').classList.toggle('active', mode === 'pickup');
    document.getElementById('fulfill-delivery').classList.toggle('active', mode === 'delivery');
    document.getElementById('sum-delivery-row').style.display = mode === 'delivery' ? 'flex' : 'none';
    document.getElementById('change-loc-link').style.display = mode === 'delivery' ? 'block' : 'none';
    document.getElementById('view-pharmacy-link').style.display = mode === 'pickup' ? 'block' : 'none';
    updateCartSummary();
  }

  function showPharmacyMap(){
    const pharmacies = getCartPharmacyNames();
    const textEl = document.getElementById('pharmacy-map-text');
    if(pharmacies.length === 0){
      textEl.innerHTML = 'Tu carrito está vacío.';
    } else {
      textEl.innerHTML = pharmacies.map(p => `
        <div style="margin-bottom:10px;">
          <b>${p}</b><br>
          Dirección: ${PHARMACY_ADDRESSES[p] || 'Dirección no disponible.'}
        </div>
      `).join('') + '<div>¡Lo esperamos!</div>';
    }
    document.getElementById('pharmacy-map-overlay').classList.add('show');
  }

  function openPaymentModal(){
    if(cartTotalCount() === 0) return;
    const total = document.getElementById('sum-total').textContent;
    document.getElementById('payment-modal-card').innerHTML = `
      <div class="loc-title" style="border-bottom:1px solid var(--border); padding-bottom:12px;">Método de pago</div>
      <button class="pay-option" onclick="selectPayment('efectivo', '${total}')">💵 Efectivo</button>
      <button class="pay-option" onclick="selectPayment('tarjeta', '${total}')">💳 Tarjeta</button>
      <button class="pay-option" onclick="selectPayment('yappy', '${total}')">🟣 Yappy</button>
    `;
    document.getElementById('payment-modal-overlay').classList.add('show');
  }

  function selectPayment(method, total){
    const pharmacies = getCartPharmacyNames();
    const pharmLabel = pharmacies.length > 1
      ? `las farmacias ${pharmacies.join(', ')}`
      : `la farmacia ${pharmacies[0] || ''}`;
    const card = document.getElementById('payment-modal-card');

    if(method === 'efectivo'){
      const pharmList = pharmacies.map(p => `
        <div style="margin-top:8px;">
          <b>${p}</b><br>
          <span style="color:var(--muted); font-size:13px;">Dirección: ${PHARMACY_ADDRESSES[p] || 'Dirección no disponible.'}</span>
        </div>
      `).join('');
      const introText = pharmacies.length > 1
        ? `El costo total a pagar es: <b>${total}</b> en las siguientes farmacias:`
        : `El costo total a pagar es: <b>${total}</b> en <b>${pharmacies[0] || ''}</b>.`;
      card.innerHTML = `
        <div class="loc-title" style="border-bottom:1px solid var(--border); padding-bottom:12px;">Método de pago</div>
        <div class="pay-result">
          ${introText}
          ${pharmacies.length > 1 ? pharmList : `<div style="margin-top:8px; color:var(--muted); font-size:13px;">Dirección: ${PHARMACY_ADDRESSES[pharmacies[0]] || 'Dirección no disponible.'}</div>`}
        </div>
        <button class="pay-btn" onclick="closePaymentModal(); finalizeOrder();">Aceptar</button>
      `;
    } else if(method === 'yappy'){
      card.innerHTML = `
        <div class="loc-title" style="border-bottom:1px solid var(--border); padding-bottom:12px;">Método de pago</div>
        <div class="pay-result">
          Yappy de ${pharmLabel}: <b>6123-4567</b><br>
          Total a pagar: <b>${total}</b><br><br>
          En caja debe mostrar el comprobante de pago.
          ${fulfillMode === 'delivery' ? `<div class="pay-warn">⚠️ Se recomienda pagar una vez el repartidor llegue.</div>` : ''}
        </div>
        <button class="pay-btn" onclick="closePaymentModal(); finalizeOrder();">Aceptar</button>
      `;
    } else if(method === 'tarjeta'){
      card.innerHTML = `
        <div class="loc-title" style="border-bottom:1px solid var(--border); padding-bottom:12px;">Pagar con tarjeta</div>
        <div style="padding:16px 16px 4px;">
          <input class="pay-input" placeholder="Número de tarjeta">
          <div class="pay-row">
            <input class="pay-input" placeholder="MM/AA">
            <input class="pay-input" placeholder="CVV">
          </div>
        </div>
        <button class="pay-btn" onclick="closePaymentModal(); finalizeOrder();">Pagar ${total}</button>
      `;
    }
  }

  function closePaymentModal(){
    document.getElementById('payment-modal-overlay').classList.remove('show');
  }

  function clearCart(){
    cart = {};
    renderAllMedCardActions();
    updateCartBar();
    renderCartItems();
    fulfillMode = 'pickup';
    setFulfill('pickup');
  }

  function updateCartSummary(){
    const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => sum + (MED_INFO[id]?.price || 0) * qty, 0);
    const delivery = fulfillMode === 'delivery' ? 1.50 : 0;
    const discount = fulfillMode === 'delivery' ? 0.50 : 0;
    const total = subtotal + delivery - discount;
    const s = document.getElementById('sum-subtotal');
    if(!s) return;
    s.textContent = '$' + subtotal.toFixed(2);
    document.getElementById('sum-discount').textContent = '$' + discount.toFixed(2);
    document.getElementById('sum-total').textContent = '$' + total.toFixed(2);
    const confirmBtn = document.getElementById('btn-confirm-cart');
    if(confirmBtn) confirmBtn.disabled = cartTotalCount() === 0;
  }

  // ---------- Pedido activo (seguimiento + cancelación de delivery) ----------
  let activeOrder = null;
  let orderCountdownInterval = null;

  function finalizeOrder(){
    const wasDelivery = fulfillMode === 'delivery';
    const items = Object.entries(cart).map(([id, qty]) => ({
      name: MED_INFO[id].name,
      pharm: MED_INFO[id].pharm,
      price: MED_INFO[id].price,
      qty
    }));
    const totalText = document.getElementById('sum-total').textContent;
    const pharmacies = getCartPharmacyNames();

    clearCart();

    if(items.length === 0) { switchTab('medicamentos'); return; }

    if(wasDelivery){
      const etaMinutes = 20 + Math.floor(Math.random() * 16); // 20 a 35 minutos
      activeOrder = {
        mode: 'delivery',
        items,
        total: totalText,
        pharmacies,
        etaSeconds: etaMinutes * 60,
        totalEtaSeconds: etaMinutes * 60
      };
      startOrderCountdown();
      renderOrderBanner();
      showOrderPlacedToast(etaMinutes);
    } else {
      // Recoger personalmente: también mostramos "Ver pedido" / "Cancelar pedido"
      activeOrder = {
        mode: 'pickup',
        items,
        total: totalText,
        pharmacies,
        etaSeconds: 0,
        totalEtaSeconds: 0
      };
      renderOrderBanner();
      const toast = document.getElementById('cancel-toast');
      toast.querySelector('.toast-card').textContent = '¡Pedido confirmado! Pasa a recogerlo cuando quieras.';
      switchTab('medicamentos');
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        toast.querySelector('.toast-card').textContent = 'Su cita ha sido cancelada con éxito!';
      }, 2200);
    }
  }

  function showOrderPlacedToast(etaMinutes){
    const toast = document.getElementById('cancel-toast');
    toast.querySelector('.toast-card').textContent = `¡Pedido confirmado! Llega en aproximadamente ${etaMinutes} min.`;
    switchTab('medicamentos');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.querySelector('.toast-card').textContent = 'Su cita ha sido cancelada con éxito!';
    }, 2200);
  }

  function formatEta(seconds){
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function startOrderCountdown(){
    clearInterval(orderCountdownInterval);
    orderCountdownInterval = setInterval(() => {
      if(!activeOrder) { clearInterval(orderCountdownInterval); return; }
      activeOrder.etaSeconds = Math.max(0, activeOrder.etaSeconds - 1);
      renderOrderBanner();
      if(document.getElementById('order-modal-overlay').classList.contains('show')){
        renderOrderModal();
      }
      if(activeOrder.etaSeconds === 0){
        clearInterval(orderCountdownInterval);
        deliverOrder();
      }
    }, 1000);
  }

  function renderOrderBanner(){
    const banner = document.getElementById('order-banner');
    if(!activeOrder){
      banner.classList.remove('show');
      banner.classList.remove('pickup');
      banner.innerHTML = '';
      return;
    }
    banner.classList.add('show');
    const isPickup = activeOrder.mode === 'pickup';
    banner.classList.toggle('pickup', isPickup);
    const icon = isPickup ? '🏪' : '🚚';
    const title = isPickup ? 'Pedido listo para recoger' : 'Pedido en camino';
    const sub = isPickup
      ? `Total: ${activeOrder.total}`
      : `Llega en ${formatEta(activeOrder.etaSeconds)}`;
    banner.innerHTML = `
      <div class="order-banner-ic">${icon}</div>
      <div class="order-banner-body">
        <div class="order-banner-title">${title}</div>
        <div class="order-banner-sub">${sub}</div>
      </div>
      <button class="order-banner-btn" onclick="openOrderModal()">Ver pedido</button>
    `;
  }

  function openOrderModal(){
    renderOrderModal();
    document.getElementById('order-modal-overlay').classList.add('show');
  }

  function closeOrderModal(){
    document.getElementById('order-modal-overlay').classList.remove('show');
  }

  function renderOrderModal(){
    if(!activeOrder) return;
    const card = document.getElementById('order-modal-card');
    const itemsHtml = activeOrder.items.map(it => `
      <div class="order-modal-item">
        <span>${it.name} <span class="qty">x${it.qty}</span></span>
        <span>$${(it.price * it.qty).toFixed(2)}</span>
      </div>
    `).join('');
    const pharmHtml = activeOrder.pharmacies.map(p => `
      <div><b>${p}</b> — ${PHARMACY_ADDRESSES[p] || 'Dirección no disponible.'}</div>
    `).join('');
    const isPickup = activeOrder.mode === 'pickup';
    const headTitle = isPickup ? 'Tu pedido · Recoger en farmacia' : 'Tu pedido · Delivery';
    const etaBlock = isPickup
      ? `<div class="order-modal-eta pickup">Listo para recoger</div>
         <div class="order-modal-eta-label">pasa cuando quieras a la farmacia</div>`
      : `<div class="order-modal-eta">${formatEta(activeOrder.etaSeconds)}</div>
         <div class="order-modal-eta-label">tiempo estimado de llegada</div>`;
    card.classList.toggle('pickup', isPickup);
    card.innerHTML = `
      <div class="order-modal-head ${isPickup ? 'pickup' : ''}">
        <div class="order-modal-title">${headTitle}</div>
        ${etaBlock}
      </div>
      <div class="order-modal-body">
        ${itemsHtml}
        <div class="order-modal-total"><span>Total</span><span>${activeOrder.total}</span></div>
        <div class="order-modal-pharm">
          ${pharmHtml}
        </div>
      </div>
      <div class="order-modal-actions">
        <button class="cancel-order" onclick="cancelActiveOrder()">Cancelar pedido</button>
        <button class="close-order" onclick="closeOrderModal()">Cerrar</button>
      </div>
    `;
  }

  function cancelActiveOrder(){
    const refund = activeOrder ? activeOrder.total : '';
    clearInterval(orderCountdownInterval);
    activeOrder = null;
    closeOrderModal();
    renderOrderBanner();
    const toast = document.getElementById('cancel-toast');
    toast.querySelector('.toast-card').innerHTML =
      `Su pedido ha sido cancelado con éxito!<br>La suma de: <b>${refund}</b> ha sido devuelta.`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.querySelector('.toast-card').textContent = 'Su cita ha sido cancelada con éxito!';
    }, 2200);
  }

  function deliverOrder(){
    const banner = document.getElementById('order-banner');
    if(banner && activeOrder){
      banner.innerHTML = `
        <div class="order-banner-ic">✅</div>
        <div class="order-banner-body">
          <div class="order-banner-title">Pedido entregado</div>
          <div class="order-banner-sub">¡Buen provecho!</div>
        </div>
      `;
    }
    setTimeout(() => {
      activeOrder = null;
      renderOrderBanner();
    }, 4000);
  }

  // ---------- Search filters ----------
  function filterMeds(query){
    const q = query.trim().toLowerCase();
    document.querySelectorAll('#med-list .med-card').forEach(card => {
      const match = !q || card.dataset.name.includes(q);
      card.style.display = match ? 'flex' : 'none';
    });
  }

  function filterCentros(){ applyCentrosFilter(); }



  function filterAgenda(query){ applyAgendaFilters(); }

  document.querySelectorAll('#agenda-list .reminder-card').forEach(pill => {
    pill.dataset.origSearch = pill.dataset.search;
    const t = pill.querySelector('.reminder-time');
    if(t) pill.dataset.origTime = t.textContent;
  });

  const TODAY = new Date();
  const AGENDA_DEFAULT_DATE = new Date(2026, 6, 6); // 6 de julio de 2026 — fecha fija para los recordatorios predeterminados
  let agendaDate = new Date(AGENDA_DEFAULT_DATE);

  // Fix the "default" cards to a stable date (6 de julio de 2026) and rebuild their search index
  (function seedDefaultReminders(){
    const y = AGENDA_DEFAULT_DATE.getFullYear(), m = AGENDA_DEFAULT_DATE.getMonth() + 1, d = AGENDA_DEFAULT_DATE.getDate();
    const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    document.querySelectorAll('#agenda-list .reminder-card[data-today="1"]').forEach(card => {
      card.dataset.day = d; card.dataset.month = m; card.dataset.year = y;
      const timeEl = card.querySelector('.reminder-time');
      const timeTxt = timeEl ? timeEl.textContent.toLowerCase() : '';
      card.dataset.search = `${d} ${MONTHS_ES[m-1]} ${timeTxt}`;
    });
  })();

  function renderAgendaHeader(){
    const y = agendaDate.getFullYear(), m = agendaDate.getMonth();
    const nav = document.getElementById('agenda-month-nav');
    if(nav){
      nav.innerHTML = `<button type="button" aria-label="Mes anterior" onclick="shiftAgendaMonth(-1)">‹</button>`
        + `<span id="agenda-month-text">${MONTH_NAMES[m]} ${y}</span>`
        + `<button type="button" aria-label="Mes siguiente" onclick="shiftAgendaMonth(1)">›</button>`;
    }
    renderAgendaDays();
    applyAgendaFilters();
  }

  function renderAgendaDays(){
    const scroll = document.querySelector('#screen-agenda .day-scroll');
    if(!scroll) return;
    const y = agendaDate.getFullYear(), m = agendaDate.getMonth(), d = agendaDate.getDate();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    scroll.innerHTML = '';
    let activeBtn = null;
    for(let day = 1; day <= daysInMonth; day++){
      const dt = new Date(y, m, day);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day-pill' + (day === d ? ' active' : '');
      btn.innerHTML = `${DOW_ES[dt.getDay()]}<span class="num">${day}</span>`;
      btn.addEventListener('click', () => {
        agendaDate = new Date(y, m, day);
        // Only update pill styles + filters, don't reset horizontal scroll
        scroll.querySelectorAll('.day-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        applyAgendaFilters();
      });
      if(day === d) activeBtn = btn;
      scroll.appendChild(btn);
    }
    // Center the active day in the horizontal scroll on month/initial render
    if(activeBtn){
      requestAnimationFrame(() => {
        scroll.scrollLeft = activeBtn.offsetLeft - (scroll.clientWidth / 2) + (activeBtn.clientWidth / 2);
      });
    }
  }

  function shiftAgendaMonth(delta){
    const y = agendaDate.getFullYear(), m = agendaDate.getMonth();
    agendaDate = new Date(y, m + delta, 1);
    renderAgendaHeader();
  }

  const MONTHS_ES_LOWER = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  function parseAgendaQuery(raw){
    const q = raw.trim().toLowerCase();
    if(!q) return null;
    const tokens = q.split(/\s+/);
    let month = null, day = null, year = null, unmatched = [];
    tokens.forEach(tok => {
      if(/^\d{4}$/.test(tok)){ year = parseInt(tok, 10); return; }
      if(/^\d{1,2}$/.test(tok) && +tok >= 1 && +tok <= 31){ day = parseInt(tok, 10); return; }
      const mIdx = MONTHS_ES_LOWER.findIndex(mn => mn === tok || (tok.length >= 3 && mn.startsWith(tok)));
      if(mIdx !== -1){ month = mIdx + 1; return; }
      unmatched.push(tok);
    });
    if(month === null && day === null && year === null){
      return { freeText: q };
    }
    return { month, day, year, freeText: unmatched.length ? unmatched.join(' ') : null };
  }

  function applyAgendaFilters(){
    const input = document.getElementById('agenda-search');
    const raw = (input && input.value ? input.value : '');
    const parsed = parseAgendaQuery(raw);
    let visible = 0;
    document.querySelectorAll('#agenda-list .reminder-card').forEach(card => {
      if(card.classList.contains('cancelled')){ card.style.display = 'none'; return; }
      let show;
      if(!parsed){
        const cd = +card.dataset.day, cm = +card.dataset.month, cy = +card.dataset.year;
        show = (cd === agendaDate.getDate() && cm === agendaDate.getMonth() + 1 && cy === agendaDate.getFullYear());
      } else if(parsed.freeText && parsed.day === null && parsed.month === null && parsed.year === null){
        show = (card.dataset.search || '').includes(parsed.freeText);
      } else {
        const cd = +card.dataset.day, cm = +card.dataset.month, cy = +card.dataset.year;
        show = true;
        if(parsed.day !== null) show = show && cd === parsed.day;
        if(parsed.month !== null) show = show && cm === parsed.month;
        if(parsed.year !== null) show = show && cy === parsed.year;
        if(show && parsed.freeText) show = (card.dataset.search || '').includes(parsed.freeText);
      }
      card.style.display = show ? 'flex' : 'none';
      if(show) visible++;
    });
    const empty = document.getElementById('agenda-empty');
    if(empty){
      empty.textContent = raw.trim() ? 'No hay recordatorios para esta búsqueda' : 'No hay recordatorios para esta fecha';
      empty.classList.toggle('show', visible === 0);
    }
  }

  let currentAppointmentCard = null;
  function showAppointment(time, place, addr, card){
    document.getElementById('detail-time').textContent = time;
    document.getElementById('detail-place').textContent = place;
    document.getElementById('detail-addr').textContent = addr;
    currentAppointmentCard = card || null;
    showScreen('screen-appointment');
  }

  function cancelarCita(){
    document.getElementById('cancel-toast').classList.add('show');
    if(currentAppointmentCard){
      currentAppointmentCard.classList.add('cancelled');
      currentAppointmentCard.style.display = 'none';
    }
    setTimeout(() => {
      document.getElementById('cancel-toast').classList.remove('show');
      switchTab('agenda');
    }, 1700);
  }

  function reagendarCita(){
    lastScheduleContext = { type:'reagendar' };
    document.getElementById('sched-tag').textContent = 'Reagendar cita';
    buildCalendar();
    showScreen('screen-schedule');
  }

  // ---------- Centros de Salud detail ----------
  function showHospitalDetail(card){
    const d = card.dataset;
    document.getElementById('hd-photo').textContent = d.icon;
    document.getElementById('hd-photo').style.background = d.color;
    document.getElementById('hd-name').textContent = d.name;
    document.getElementById('hd-stars').textContent = d.stars;
    document.getElementById('hd-addr').textContent = d.addr;
    document.getElementById('hd-phone').textContent = d.phone;
    document.getElementById('hd-hours').textContent = d.hours;
    const specs = d.specialties.split('|');
    document.getElementById('hd-specialties-panel').innerHTML = specs.map(s => {
      const disp = s.includes('No disponible');
      return `<div class="edu-item" style="${disp ? 'color:#b7bcc2;' : ''}">${s}</div>`;
    }).join('');
    lastScheduleContext = { type:'hospital', name:d.name };
    showScreen('screen-hospital-detail');
  }

  // ---------- Especialistas detail ----------
  function showDoctorDetail(card){
    const d = card.dataset;
    document.getElementById('dd-photo').textContent = d.initials;
    document.getElementById('dd-photo').style.background = d.color;
    document.getElementById('dd-name').textContent = d.name;
    document.getElementById('dd-spec').textContent = d.spec;
    const edu = d.edu.split('|');
    document.getElementById('dd-edu-panel').innerHTML = edu.map(e => `<div class="edu-item">${e}</div>`).join('');
    document.getElementById('dd-nota-panel').innerHTML = `<div>${d.nota}</div>`;
    lastScheduleContext = { type:'doctor', name:d.name, spec:d.spec };
    showScreen('screen-doctor-detail');
  }

  function toggleAccordion(btn, panelId){
    const panel = document.getElementById(panelId);
    const nowOpen = !panel.classList.contains('show');
    panel.classList.toggle('show', nowOpen);
    btn.classList.toggle('open', nowOpen);
  }

  // ---------- Agendar cita ----------
  let lastScheduleContext = null;
  function openSchedule(kind){
    const tag = lastScheduleContext
      ? (lastScheduleContext.type === 'doctor' ? lastScheduleContext.spec : 'Consulta general')
      : 'Consulta general';
    document.getElementById('sched-tag').textContent = tag;
    buildCalendar();
    showScreen('screen-schedule');
  }

  function closeSchedule(){
    if(lastScheduleContext && lastScheduleContext.type === 'doctor'){
      showScreen('screen-doctor-detail');
    } else if(lastScheduleContext && lastScheduleContext.type === 'reagendar'){
      showScreen('screen-appointment');
    } else {
      showScreen('screen-hospital-detail');
    }
  }

  const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const MONTH_ABBR  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const DOW_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  let schedDate = new Date(2026, 8, 1);
  let schedSelectedDay = 9;

  function buildCalendar(){
    const dow = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    const cal = document.getElementById('sched-cal');
    const y = schedDate.getFullYear(), m = schedDate.getMonth();
    const label = document.querySelector('#screen-schedule .cal-label');
    if(label) label.textContent = `${MONTH_ABBR[m]} ${y}`;
    const navBtns = document.querySelectorAll('#screen-schedule .cal-header button');
    if(navBtns[0]) navBtns[0].onclick = () => { schedDate = new Date(y, m-1, 1); schedSelectedDay = null; buildCalendar(); };
    if(navBtns[1]) navBtns[1].onclick = () => { schedDate = new Date(y, m+1, 1); schedSelectedDay = null; buildCalendar(); };

    let html = dow.map(d => `<div class="dow">${d}</div>`).join('');
    const firstDow = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    for(let i=0;i<firstDow;i++) html += `<button class="muted" disabled></button>`;
    for(let day=1; day<=daysInMonth; day++){
      const sel = day === schedSelectedDay ? ' selected' : '';
      html += `<button class="${sel.trim()}" onclick="selectDay(this, ${day})">${day}</button>`;
    }
    cal.innerHTML = html;
  }

  function selectDay(btn, day){
    schedSelectedDay = day;
    document.querySelectorAll('#sched-cal button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  function selectSlot(btn){
    document.querySelectorAll('#sched-slots button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  }

  function confirmSchedule(){
    const selSlot = document.querySelector('#sched-slots button.selected');
    const slotText = selSlot ? selSlot.textContent : '10:30 A.M';
    const dayNum = schedSelectedDay || 1;
    const monthIdx = schedDate.getMonth();
    const monthNum = monthIdx + 1;
    const year = schedDate.getFullYear();
    const monthName = MONTH_NAMES[monthIdx];
    const newDateLabel = `${dayNum} de ${monthName.toLowerCase()} ${year}, ${slotText}`;

    if(lastScheduleContext && lastScheduleContext.type === 'reagendar' && currentAppointmentCard){
      const timeDiv = currentAppointmentCard.querySelector('.reminder-time');
      const parts = timeDiv.textContent.split('—');
      const placeText = parts.length > 1 ? parts[1].trim() : timeDiv.textContent.trim();
      timeDiv.textContent = `${slotText} — ${placeText}`;
      currentAppointmentCard.dataset.day = dayNum;
      currentAppointmentCard.dataset.month = monthNum;
      currentAppointmentCard.dataset.year = year;
      currentAppointmentCard.dataset.search = `${dayNum} ${monthName.toLowerCase()} ${slotText.toLowerCase()} ${placeText.toLowerCase()}`;
      currentAppointmentCard.classList.remove('cancelled');
      currentAppointmentCard.style.display = '';
      showScheduleToast(`Su cita ha sido reagendada a la fecha ${newDateLabel}`, 2200, {day:dayNum, month:monthNum, year});
    } else {
      const ctx = lastScheduleContext || {};
      const placeText = ctx.type === 'doctor'
        ? `Cita · ${ctx.name || 'Especialista'}`
        : `Cita · ${ctx.name || 'Centro de salud'}`;
      const card = document.createElement('button');
      card.className = 'reminder-card';
      card.dataset.day = dayNum;
      card.dataset.month = monthNum;
      card.dataset.year = year;
      const searchStr = `${dayNum} ${monthName.toLowerCase()} ${slotText.toLowerCase()} ${placeText.toLowerCase()}`;
      card.dataset.search = searchStr;
      card.dataset.origSearch = searchStr;
      card.innerHTML = `
        <div class="reminder-dot"></div>
        <div class="reminder-ic" style="background:#2f6b8f">🏥</div>
        <div class="reminder-body">
          <div class="reminder-time">${slotText} — ${placeText}</div>
        </div>`;
      card.dataset.origTime = card.querySelector('.reminder-time').textContent;
      card.addEventListener('click', () => showAppointment(slotText, placeText, '', card));
      const list = document.getElementById('agenda-list');
      const empty = document.getElementById('agenda-empty');
      if(empty) list.insertBefore(card, empty); else list.appendChild(card);
      showScheduleToast('Su cita ha sido agendada exitosamente', 1700, {day:dayNum, month:monthNum, year});
    }
  }

  function showScheduleToast(message, duration, jumpDate){
    document.getElementById('schedule-toast-text').textContent = message;
    document.getElementById('schedule-toast').classList.add('show');
    setTimeout(() => {
      document.getElementById('schedule-toast').classList.remove('show');
      if(jumpDate){
        agendaDate = new Date(jumpDate.year, jumpDate.month - 1, jumpDate.day);
      }
      switchTab('agenda');
      renderAgendaHeader();
    }, duration);
  }

  // ---------- keypad ----------
  const keys = [['1',''],['2','ABC'],['3','DEF'],['4','GHI'],['5','JKL'],['6','MNO'],['7','PQRS'],['8','TUV'],['9','WXYZ'],['*',''],['0','+'],['#','']];
  const grid = document.getElementById('keypad-grid');
  keys.forEach(([n,sub]) => {
    const b = document.createElement('button');
    b.className = 'key';
    b.innerHTML = `${n}${sub ? `<span class="sub">${sub}</span>` : ''}`;
    b.addEventListener('click', () => {
      const d = document.getElementById('dial-display');
      d.textContent = (d.textContent === '911' ? '' : d.textContent) + n;
    });
    grid.appendChild(b);
  });

  function dialBackspace(){
    const d = document.getElementById('dial-display');
    d.textContent = d.textContent.slice(0, -1);
  }

  let etaInterval = null;
  function callAmbulance(){
    showScreen('screen-ambulance');
    startEtaCountdown();
  }

  function startEtaCountdown(){
    let seconds = 5*60;
    const el = document.getElementById('eta-timer');
    clearInterval(etaInterval);
    etaInterval = setInterval(() => {
      seconds = Math.max(0, seconds - 1);
      const m = String(Math.floor(seconds/60)).padStart(2,'0');
      const s = String(seconds%60).padStart(2,'0');
      el.textContent = `${m}:${s}`;
      if(seconds === 0) clearInterval(etaInterval);
    }, 1000);
  }

  function cancelAmbulance(){
    clearInterval(etaInterval);
    document.getElementById('dial-display').textContent = '911';
    showScreen('screen-landing');
  }

  // ---------- init agenda ----------
  renderAgendaHeader();

  // ---------- reset ----------
  function resetAll(){
    document.getElementById('f-nombre').value = '';
    document.getElementById('f-id').value = '';
    document.querySelectorAll('input[name="sexo"]').forEach(r => r.checked = false);
    document.getElementById('f-correo').value = '';
    document.getElementById('f-tel').value = '';
    document.getElementById('f-pan').value = '';
    document.getElementById('f-cvv').value = '';
    diaSel.value = ''; mesSel.value = ''; anioSel.value = '';
    document.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));
    document.getElementById('err-tel-banner').classList.remove('show');
    permIndex = 0;

    // reset app/tab state
    closeAllMenus();
    document.querySelectorAll('.filter-panel').forEach(p => p.classList.remove('show'));
    document.querySelectorAll('.accordion-panel').forEach(p => p.classList.remove('show'));
    document.querySelectorAll('.accordion-toggle').forEach(b => b.classList.remove('open'));
    setEspTab('doctores');

    // reset carrito y pedido activo
    clearInterval(orderCountdownInterval);
    activeOrder = null;
    renderOrderBanner();
    closeOrderModal();
    clearCart();
    document.getElementById('cancel-toast').classList.remove('show');
    if(document.getElementById('med-search')) document.getElementById('med-search').value = '';
    if(document.getElementById('agenda-search')) document.getElementById('agenda-search').value = '';
    filterMeds(''); filterAgenda('');
    document.querySelectorAll('#agenda-list .reminder-card').forEach(c => {
      c.classList.remove('cancelled');
      c.style.display = '';
      if(c.dataset.origSearch) c.dataset.search = c.dataset.origSearch;
      const t = c.querySelector('.reminder-time');
      if(t && c.dataset.origTime) t.textContent = c.dataset.origTime;
    });
    currentAppointmentCard = null;
    lastScheduleContext = null;
    agendaDate = new Date(AGENDA_DEFAULT_DATE);
    schedDate = new Date(2026, 8, 1);
    schedSelectedDay = 9;
    document.querySelectorAll('#agenda-list .reminder-card').forEach(c => {
      if(!c.dataset.origSearch){ c.remove(); }
    });
    renderAgendaHeader();

    // reset filters/search on centros and especialistas
    document.querySelectorAll('#screen-centros .hosp-card').forEach(c => c.style.display = '');
    document.querySelectorAll('#screen-especialistas .doc-card').forEach(c => c.style.display = '');
    const cp = document.getElementById('filter-centros');
    if(cp){ cp.querySelectorAll('input[type=checkbox]').forEach(b => b.checked = b.dataset.type === 'todos'); }
    const ep = document.getElementById('filter-especialidades');
    if(ep){ ep.querySelectorAll('input[type=checkbox]').forEach(b => b.checked = b.dataset.spec === 'todos'); }
    if(document.getElementById('doc-search')) document.getElementById('doc-search').value = '';

    // reset accessibility / feedback state
    const shell = document.getElementById('app-shell');
    shell.style.zoom = '';
    shell.style.filter = '';
    shell.classList.remove('dark-mode');
    document.querySelectorAll('#screen-accesibilidad .toggle').forEach(t => t.classList.remove('on'));
    const notifToggles = document.querySelectorAll('#screen-notificaciones .toggle');
    const notifDefaults = [true, true, true, false, false];
    notifToggles.forEach((t, i) => t.classList.toggle('on', !!notifDefaults[i]));
    document.getElementById('feedback-text').value = '';
    rateFeedback(0);
    document.getElementById('feedback-toast').classList.remove('show');
    document.querySelectorAll('.text-size-row button').forEach(b => b.classList.remove('active'));
    document.querySelector('.text-size-row button:nth-child(2)').classList.add('active');

    showScreen('screen-landing');
  }
