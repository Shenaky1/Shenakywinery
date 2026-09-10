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
  demoMode: true,
  accountId: '6135',
  approvals: Object.freeze({
    '2024-red-blend': true,
    '2025-merlot': true,
    '2024-merlot': true,
    '2024-sauvignon-blanc': true,
    '2025-symphony': true,
    '2023-riesling-ice-wine': true
  }),
  products: Object.freeze({
    '2024-red-blend': '200772',
    '2025-merlot': '200015',
    '2024-merlot': '200774',
    '2024-sauvignon-blanc': '200775',
    '2025-symphony': '200776',
    '2023-riesling-ice-wine': '201103'
  })
});
