(function () {
  'use strict';

  var config = window.SHENAKY_VINOSHIPPER || {};
  if (config.demoMode !== true) return;

  var isFrench = (document.documentElement.lang || '').toLowerCase().indexOf('fr') === 0;
  var storageKey = 'shenaky_demo_cart_v1';
  var catalog = {
    '2024-red-blend': { name: 'Red Blend', vintage: '2024', price: 25, image: 'assets/wines/2024-red-blend.webp?v=20260902-1' },
    '2025-merlot': { name: 'Merlot', vintage: '2025', price: 25, image: 'assets/wines/2025-merlot-approved.webp' },
    '2024-merlot': { name: 'Merlot', vintage: '2024', price: 25, image: 'assets/wines/2024-merlot.webp?v=20260902-1' },
    '2024-sauvignon-blanc': { name: 'Sauvignon Blanc', vintage: '2024', price: 25, image: 'assets/wines/2024-sauvignon-blanc-corrected.webp?v=20260907-2' },
    '2025-symphony': { name: 'Symphony', vintage: '2025', price: 25, image: 'assets/wines/2025-symphony-corrected.webp?v=20260907-2' }
  };

  function readCart() {
    try {
      var parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch (error) {
      return;
    }
    updateCartLinks(cart);
  }

  function totalQuantity(cart) {
    return Object.keys(cart).reduce(function (total, key) {
      return total + (catalog[key] ? Number(cart[key]) || 0 : 0);
    }, 0);
  }

  function updateCartLinks(cart) {
    var count = totalQuantity(cart);
    document.querySelectorAll('a.cart').forEach(function (link) {
      link.textContent = (isFrench ? 'Panier' : 'Cart') + (count ? ' (' + count + ')' : '');
    });
  }

  function money(value) {
    return isFrench ? value.toFixed(2).replace('.', ',') + ' $' : '$' + value.toFixed(2);
  }

  function prepareProductButtons() {
    document.querySelectorAll('[data-vs-product-key]').forEach(function (slot) {
      var key = slot.getAttribute('data-vs-product-key');
      var approved = (config.approvals || {})[key] === true;
      if (!approved || !catalog[key]) {
        slot.className = 'wine-status is-pending-approval';
        slot.textContent = isFrench ? 'Bientôt disponible' : 'Available soon';
        return;
      }

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'add-cart';
      button.textContent = isFrench ? 'Ajouter au panier' : 'Add to cart';
      button.addEventListener('click', function () {
        var cart = readCart();
        cart[key] = (Number(cart[key]) || 0) + 1;
        saveCart(cart);
        button.textContent = isFrench ? 'Ajouté au panier' : 'Added to cart';
        window.setTimeout(function () {
          button.textContent = isFrench ? 'Ajouter au panier' : 'Add to cart';
        }, 1200);
      });
      slot.className = 'demo-add-to-cart';
      slot.replaceChildren(button);
    });
  }

  function renderCart() {
    var root = document.querySelector('[data-demo-cart]');
    if (!root) return;

    var items = root.querySelector('[data-cart-items]');
    var subtotal = root.querySelector('[data-cart-subtotal]');
    var total = root.querySelector('[data-cart-total]');
    var cart = readCart();
    var keys = Object.keys(cart).filter(function (key) {
      return catalog[key] && Number(cart[key]) > 0;
    });

    items.replaceChildren();

    if (!keys.length) {
      var empty = document.createElement('div');
      empty.className = 'cart-empty-state';
      empty.innerHTML = '<p>' + (isFrench ? 'Votre panier est vide.' : 'Your cart is empty.') + '</p><a class="btn btn-gold" href="' + (isFrench ? 'fr-wines.html' : 'wines.html') + '">' + (isFrench ? 'Voir nos vins' : 'Browse our wines') + '</a>';
      items.appendChild(empty);
    } else {
      keys.forEach(function (key) {
        var product = catalog[key];
        var quantity = Number(cart[key]);
        var row = document.createElement('article');
        row.className = 'cart-item';
        row.innerHTML =
          '<img src="' + product.image + '" alt="">' +
          '<div class="cart-item-name"><strong>' + product.vintage + ' ' + product.name + '</strong><span>' + (isFrench ? 'Bouteille de 750 ml' : '750 ml bottle') + '</span></div>' +
          '<div class="cart-quantity"><button type="button" data-minus aria-label="' + (isFrench ? 'Réduire la quantité' : 'Decrease quantity') + '">−</button><output>' + quantity + '</output><button type="button" data-plus aria-label="' + (isFrench ? 'Augmenter la quantité' : 'Increase quantity') + '">+</button></div>' +
          '<div class="cart-item-price"><strong>' + money(product.price * quantity) + '</strong><button type="button" class="cart-remove" data-remove>' + (isFrench ? 'Supprimer' : 'Remove') + '</button></div>';

        row.querySelector('[data-minus]').addEventListener('click', function () {
          cart[key] = quantity - 1;
          if (cart[key] < 1) delete cart[key];
          saveCart(cart);
          renderCart();
        });
        row.querySelector('[data-plus]').addEventListener('click', function () {
          cart[key] = quantity + 1;
          saveCart(cart);
          renderCart();
        });
        row.querySelector('[data-remove]').addEventListener('click', function () {
          delete cart[key];
          saveCart(cart);
          renderCart();
        });
        items.appendChild(row);
      });
    }

    var amount = keys.reduce(function (sum, key) {
      return sum + catalog[key].price * Number(cart[key]);
    }, 0);
    subtotal.textContent = money(amount);
    total.textContent = money(amount);
    updateCartLinks(cart);
  }

  updateCartLinks(readCart());
  prepareProductButtons();
  renderCart();
}());