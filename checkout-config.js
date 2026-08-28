/*
 * Shenaky Winery checkout safety switch.
 * Keep mode set to "test" until every label is approved, a compliant live
 * payment processor is connected, and the winery has an approved wine-
 * shipping account with UPS or FedEx configured for Adult Signature Required.
 */
window.SHENAKY_CHECKOUT = Object.freeze({
  mode: 'test',
  allowedState: 'CA',
  testCard: '4242424242424242',
  paymentProvider: 'simulated-test',
  approvedCarrierAccountRequired: true,
  adultSignatureRequired: true,
  unattendedDeliveryAllowed: false,
  pickupIdCheckRequired: true
});
