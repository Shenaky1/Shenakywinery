
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
    event.preventDefault();
    var cart = readCart();
    if (!cart.length) return;
    var data = new FormData(orderForm);
    var total = cart.reduce(function(sum,item){ return sum + item.price * item.quantity; }, 0);
    var lines = cart.map(function(item){ return item.quantity + ' x ' + item.year + ' ' + item.name + ' — ' + money(item.price * item.quantity); });
    var subject = isFrench ? 'Demande de commande de vin' : 'Wine order request';
    var body = (isFrench ? 'Nom : ' : 'Name: ') + data.get('customerName') + '\n' +
      (isFrench ? 'Courriel : ' : 'Email: ') + data.get('customerEmail') + '\n' +
      (isFrench ? 'Téléphone : ' : 'Phone: ') + (data.get('customerPhone') || '—') + '\n\n' +
      lines.join('\n') + '\n\n' + (isFrench ? 'Sous-total estimé : ' : 'Estimated subtotal: ') + money(total) + '\n\n' +
      (isFrench ? 'Je confirme avoir au moins 21 ans. Merci de confirmer la disponibilité et les modalités.' : 'I confirm that I am at least 21 years old. Please confirm availability and fulfillment details.');
    window.location.href = 'mailto:info@shenakywinery.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    document.querySelector('[data-cart-message]').textContent = isFrench ? 'Votre application de courriel va s’ouvrir.' : 'Your email application will open with the order request.';
  });

  updateCartCount(readCart());
  renderCart();
})();
