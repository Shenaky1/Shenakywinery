/*
 * SHENAKY WINERY — VINOSHIPPER CONFIGURATION
 *
 * 1. Find the Account ID in VinoShipper: Account > Profile.
 * 2. Find each approved wine's Product ID in VinoShipper.
 * 3. Replace the empty values below with the numeric IDs.
 * 4. Change enabled to true only when the account and products are ready.
 *
 * Do not put passwords, banking information, or API secrets in this file.
 */
window.SHENAKY_VINOSHIPPER = Object.freeze({
  enabled: false,
  accountId: '',
  products: Object.freeze({
    '2024-red-blend': '',
    '2025-merlot': '',
    '2024-merlot': '',
    '2024-sauvignon-blanc': '',
    '2025-symphony': '',
    '2023-riesling-ice-wine': ''
  })
});

