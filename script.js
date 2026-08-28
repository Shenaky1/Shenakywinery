
document.querySelectorAll('.menu-button').forEach(function(button){
  button.addEventListener('click', function(){
    const nav = button.parentElement.querySelector('.nav-links');
    nav.classList.toggle('open');
    button.setAttribute('aria-expanded', nav.classList.contains('open') ? 'true' : 'false');
  });
});

(function(){
  var storageKey = 'shenakyCart';
  var isFrench = document.documentElement.lang === 'fr';
  var checkoutConfig = window.SHENAKY_CHECKOUT || { mode:'test', allowedState:'CA', testCard:'4242424242424242' };

  function readCart(){
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
    catch (error) { return []; }
  }

  function saveCart(cart){
    localStorage.setItem(storageKey, JSON.stringify(cart));
    updateCartCount(cart);
  }

  function money(value){
    return new Intl.NumberFormat(isFrench ? 'fr-CA' : 'en-US', {
      style:'currency', currency:'USD'
    }).format(value);
  }

  function updateCartCount(cart){
    var count = cart.reduce(function(total,item){ return total + item.quantity; }, 0);
    document.querySelectorAll('a.cart').forEach(function(link){
      var badge = link.querySelector('.cart-count');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-count';
        link.appendChild(badge);
      }
      badge.textContent = count;
      badge.hidden = count === 0;
      link.setAttribute('aria-label', (isFrench ? 'Panier, ' : 'Cart, ') + count);
    });
  }

  document.querySelectorAll('[data-cart-add]').forEach(function(button){
    button.addEventListener('click', function(){
      var cart = readCart();
      var item = cart.find(function(entry){ return entry.id === button.dataset.id; });
      if (item) item.quantity += 1;
      else cart.push({
        id:button.dataset.id,
        name:button.dataset.name,
        year:button.dataset.year,
        price:Number(button.dataset.price),
        image:button.dataset.image,
        quantity:1
      });
      saveCart(cart);
      var original = button.textContent;
      button.textContent = isFrench ? 'Ajouté ✓' : 'Added ✓';
      button.classList.add('is-added');
      window.setTimeout(function(){ button.textContent = original; button.classList.remove('is-added'); }, 1200);
    });
  });

  function renderCart(){
    var page = document.querySelector('[data-cart-page]');
    if (!page) return;
    var cart = readCart();
    var holder = page.querySelector('[data-cart-items]');
    var quantity = cart.reduce(function(total,item){ return total + item.quantity; }, 0);
    var total = cart.reduce(function(sum,item){ return sum + item.price * item.quantity; }, 0);
    page.querySelector('[data-cart-quantity]').textContent = quantity;
    page.querySelector('[data-cart-total]').textContent = money(total);
    var submit = page.querySelector('.cart-request');
    submit.disabled = cart.length === 0;

    if (!cart.length) {
      holder.innerHTML = '<div class="cart-empty-state"><p>' + (isFrench ? 'Votre panier est vide.' : 'Your cart is empty.') + '</p><a class="btn btn-dark" href="' + (isFrench ? 'fr-wines.html' : 'wines.html') + '">' + (isFrench ? 'Voir nos vins' : 'Browse our wines') + '</a></div>';
      return;
    }

    holder.innerHTML = cart.map(function(item){
      return '<article class="cart-item" data-cart-id="' + item.id + '">' +
        '<img src="' + item.image + '" alt="">' +
        '<div class="cart-item-name"><strong>' + item.year + ' ' + item.name + '</strong><span>' + money(item.price) + ' / ' + (isFrench ? 'bouteille' : 'bottle') + '</span></div>' +
        '<div class="cart-quantity"><button type="button" data-change="-1" aria-label="' + (isFrench ? 'Réduire' : 'Decrease') + '">−</button><output>' + item.quantity + '</output><button type="button" data-change="1" aria-label="' + (isFrench ? 'Augmenter' : 'Increase') + '">+</button></div>' +
        '<div class="cart-item-price"><strong>' + money(item.price * item.quantity) + '</strong><button class="cart-remove" type="button" data-remove>' + (isFrench ? 'Retirer' : 'Remove') + '</button></div>' +
      '</article>';
    }).join('');

    holder.querySelectorAll('[data-cart-id]').forEach(function(row){
      row.querySelectorAll('[data-change]').forEach(function(button){
        button.addEventListener('click', function(){
          var item = cart.find(function(entry){ return entry.id === row.dataset.cartId; });
          item.quantity += Number(button.dataset.change);
          if (item.quantity < 1) cart = cart.filter(function(entry){ return entry.id !== row.dataset.cartId; });
          saveCart(cart); renderCart();
        });
      });
      row.querySelector('[data-remove]').addEventListener('click', function(){
        cart = cart.filter(function(entry){ return entry.id !== row.dataset.cartId; });
        saveCart(cart); renderCart();
      });
    });
  }

  var orderForm = document.querySelector('[data-order-form]');
  if (orderForm) orderForm.addEventListener('submit', function(event){
    var cart = readCart();
    if (!cart.length) {
      event.preventDefault();
      return;
    }
    if (checkoutConfig.mode !== 'test') {
      event.preventDefault();
      showOrderMessage(isFrench ? 'Le paiement en direct n’est pas encore configuré.' : 'Live payment is not configured yet.', true);
      return;
    }
    if (!validateAge()) {
      event.preventDefault();
      showOrderMessage(isFrench ? 'La date de naissance doit confirmer un âge de 21 ans ou plus.' : 'The date of birth must confirm an age of 21 or older.', true);
      return;
    }
    if (!validateCaliforniaAddress()) {
      event.preventDefault();
      showOrderMessage(isFrench ? 'Veuillez saisir un code postal valide de Californie.' : 'Enter a valid California ZIP code.', true);
      return;
    }
    if (!validateTestPayment()) {
      event.preventDefault();
      showOrderMessage(isFrench ? 'Utilisez uniquement les données de carte test indiquées.' : 'Use only the displayed test-card details.', true);
      return;
    }
    var total = cart.reduce(function(sum,item){ return sum + item.price * item.quantity; }, 0);
    var lines = cart.map(function(item){ return item.quantity + ' x ' + item.year + ' ' + item.name + ' — ' + money(item.price * item.quantity); });
    setOrderField('Order', lines.join('\n'));
    setOrderField(isFrench ? 'Sous-total estimé' : 'Estimated subtotal', money(total));
    var reference = 'TEST-' + new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    setOrderField(isFrench ? 'Référence du test' : 'Test reference', reference);
    setOrderField(isFrench ? 'Envoyé à' : 'Submitted at', new Date().toLocaleString(isFrench ? 'fr-CA' : 'en-US', { timeZoneName:'short' }));
    setOrderField(isFrench ? 'Résultat du paiement' : 'Payment result', isFrench ? 'PAIEMENT TEST SIMULÉ AUTORISÉ — AUCUN DÉBIT' : 'SIMULATED TEST PAYMENT AUTHORIZED — NO CHARGE');
    setOrderField(isFrench ? 'Contrôle d’âge' : 'Age validation', isFrench ? 'Date de naissance validée : 21 ans ou plus' : 'Date of birth validated: age 21 or older');
    var submit = orderForm.querySelector('.cart-request');
    submit.disabled = true;
    submit.textContent = isFrench ? 'Envoi…' : 'Sending…';
  });

  function validateAge(){
    var dobField = orderForm.querySelector('[data-dob]');
    if (!dobField || !dobField.value) return false;
    var parts = dobField.value.split('-').map(Number);
    if (parts.length !== 3) return false;
    var birth = new Date(parts[0], parts[1] - 1, parts[2]);
    if (birth.getFullYear() !== parts[0] || birth.getMonth() !== parts[1] - 1 || birth.getDate() !== parts[2]) return false;
    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
    if (beforeBirthday) age -= 1;
    return age >= 21;
  }

  function validateTestPayment(){
    var card = (orderForm.querySelector('[data-test-card]').value || '').replace(/\D/g, '');
    var expiry = (orderForm.querySelector('[data-test-expiry]').value || '').trim();
    var cvc = (orderForm.querySelector('[data-test-cvc]').value || '').replace(/\D/g, '');
    var match = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!match || card !== checkoutConfig.testCard || !/^\d{3}$/.test(cvc)) return false;
    var now = new Date();
    var month = Number(match[1]);
    var year = 2000 + Number(match[2]);
    return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
  }

  function validateCaliforniaAddress(){
    var state = orderForm.querySelector('select[name="State"], select[name="État"]');
    var zip = orderForm.querySelector('input[name="ZIP code"], input[name="Code postal"]');
    if (!state || state.value !== checkoutConfig.allowedState || !zip) return false;
    var value = zip.value.trim();
    if (!/^\d{5}$/.test(value)) return false;
    var number = Number(value);
    return number >= 90001 && number <= 96162;
  }

  function showOrderMessage(message, isError){
    var output = document.querySelector('[data-cart-message]');
    if (!output) return;
    output.textContent = message;
    output.classList.toggle('is-error', Boolean(isError));
  }

  if (orderForm) {
    var dob = orderForm.querySelector('[data-dob]');
    if (dob) {
      var cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 21);
      dob.max = cutoff.toISOString().slice(0, 10);
    }
    var cardField = orderForm.querySelector('[data-test-card]');
    if (cardField) cardField.addEventListener('input', function(){
      var digits = cardField.value.replace(/\D/g, '').slice(0, 16);
      cardField.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  function setOrderField(name, value){
    var field = orderForm.querySelector('[data-generated-field="' + name + '"]');
    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      field.dataset.generatedField = name;
      orderForm.appendChild(field);
    }
    field.value = value;
  }

  if (document.querySelector('[data-order-success]')) {
    localStorage.removeItem(storageKey);
  }

  updateCartCount(readCart());
  renderCart();
})();
