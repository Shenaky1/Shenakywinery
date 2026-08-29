# Shenaky Winery — VinoShipper-ready website

This package removes the temporary simulated card form and prepares the wine pages for VinoShipper's official website integration. It is intentionally **disabled**, so no order or payment can be submitted yet.

## Activate after the labels and VinoShipper products are approved

1. Open `vinoshipper-config.js`.
2. Enter the winery's numeric VinoShipper Account ID in `accountId`. Find it in VinoShipper under **Account → Profile**.
3. Enter the numeric VinoShipper Product ID for each wine. Do not enter a COLA/TTB ID here.
4. Confirm every displayed website price matches the corresponding price in VinoShipper.
5. In VinoShipper, limit availability to California and confirm all fulfillment, tax, age-verification, and shipping settings.
6. Only when ready to accept real orders, change `enabled: false` to `enabled: true`.

The website uses VinoShipper's official Injector. VinoShipper, rather than this website, collects the customer's payment and checkout information.

## Important operating requirements

- Sell initially only within California.
- Use only the approved winery UPS or FedEx shipping account configured for compliant wine shipments.
- Require Adult Signature Required for every shipment.
- Never authorize a carrier to leave wine unattended.
- Check government-issued photo ID for winery pickup.
- Confirm each label/product is approved before activating it.

Website code cannot by itself guarantee carrier or VinoShipper account settings. Verify those settings inside VinoShipper before launch.
