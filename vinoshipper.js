(function(){
  'use strict';

  var config = window.SHENAKY_VINOSHIPPER || {};
  var isFrench = document.documentElement.lang === 'fr';
  var accountId = String(config.accountId || '').trim();
  var configured = config.enabled === true && /^\d+$/.test(accountId);
  var slots = document.querySelectorAll('[data-vs-product-key]');
  var status = document.querySelector('[data-vs-checkout-status]');
  var checkoutDetails = status && status.nextElementSibling;

  function unavailableText(){
    return isFrench ? 'Vente bientôt disponible' : 'Sales opening soon';
  }

  function pendingApprovalText(){
    return isFrench ? 'En attente d’approbation de l’étiquette' : 'Awaiting label approval';
  }

  function checkoutPendingText(){
    return isFrench ? 'Étiquette approuvée · Paiement en préparation' : 'Label approved · Checkout setup in progress';
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
    var productKey = slot.dataset.vsProductKey;
    var approved = (config.approvals || {})[productKey] === true;
    var productId = String((config.products || {})[productKey] || '').trim();
    if (!approved) {
      slot.className = 'wine-status is-pending-approval';
      slot.textContent = pendingApprovalText();
      return;
    }
    if (!/^\d+$/.test(productId)) {
      slot.className = 'wine-status is-checkout-pending';
      slot.textContent = checkoutPendingText();
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
  if (checkoutDetails) {
    checkoutDetails.textContent = isFrench
      ? 'Les frais d’expédition sont calculés lors du paiement. Les commandes sont acceptées vers les destinations où VinoShipper autorise une livraison conforme dans plus de 40 États. Une signature d’adulte et une pièce d’identité officielle sont obligatoires; le vin n’est jamais laissé sans surveillance.'
      : 'Shipping is calculated at checkout. Orders are accepted for destinations where VinoShipper authorizes compliant delivery in more than 40 states. Adult signature and government-issued photo ID are required; wine is never left unattended.';
  }

  window.document.addEventListener('vinoshipper:loaded', function(){
    window.Vinoshipper.init(Number(accountId), {});
  }, false);

  var injector = document.createElement('script');
  injector.src = 'https://vinoshipper.com/injector/index.js';
  injector.async = true;
  document.body.appendChild(injector);
})();
