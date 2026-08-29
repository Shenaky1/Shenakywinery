(function(){
  'use strict';

  var config = window.SHENAKY_VINOSHIPPER || {};
  var isFrench = document.documentElement.lang === 'fr';
  var accountId = String(config.accountId || '').trim();
  var configured = config.enabled === true && /^\d+$/.test(accountId);
  var slots = document.querySelectorAll('[data-vs-product-key]');
  var status = document.querySelector('[data-vs-checkout-status]');

  function unavailableText(){
    return isFrench ? 'Vente bientôt disponible' : 'Sales opening soon';
  }

  if (!configured) {
    slots.forEach(function(slot){
      slot.className = 'wine-status';
      slot.textContent = unavailableText();
    });
    if (status) {
      status.textContent = isFrench
        ? 'La boutique sécurisée VinoShipper sera ouverte lorsque tous les produits approuvés seront configurés.'
        : 'The secure VinoShipper store will open after all approved products are configured.';
    }
    return;
  }

  var renderedProductCount = 0;
  slots.forEach(function(slot){
    var productId = String((config.products || {})[slot.dataset.vsProductKey] || '').trim();
    if (!/^\d+$/.test(productId)) {
      slot.className = 'wine-status';
      slot.textContent = unavailableText();
      return;
    }
    slot.className = 'vs-add-to-cart';
    slot.setAttribute('data-vs-product-id', productId);
    renderedProductCount += 1;
  });

  if (status) {
    status.textContent = renderedProductCount
      ? (isFrench ? 'Utilisez le panier VinoShipper pour terminer votre achat sécurisé.' : 'Use the VinoShipper cart to complete secure checkout.')
      : unavailableText();
  }

  window.document.addEventListener('vinoshipper:loaded', function(){
    window.Vinoshipper.init(Number(accountId), {});
  }, false);

  var injector = document.createElement('script');
  injector.src = 'https://vinoshipper.com/injector/index.js';
  injector.async = true;
  document.body.appendChild(injector);
})();

