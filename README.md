Complete deployable Shenaky Winery website package. Includes the approved Home and Awards refinements plus a bilingual cart preview. The cart is intentionally inactive and displays that online ordering is not currently available; it is ready for a future Vinoshipper connection.
# Checkout status (August 2026)

The cart is intentionally locked in **test mode** in `checkout-config.js`.
It collects full name, date of birth, email, phone, and a California shipping
address; validates age 21+; and records the required adult-signature notice.

The displayed test card is simulated in the browser. Card fields have no
`name` attributes, are not stored, and are never sent to FormSubmit. Do not set
the mode to live. A compliant live payment processor and server-side checkout
must be connected first.

Before live launch:

1. Obtain approval for every label being sold.
2. Connect a compliant payment processor using its hosted checkout/API.
3. Configure an approved winery UPS or FedEx alcohol-shipping account.
4. Require Adult Signature Required on every wine shipment.
5. Restrict shipping to California and never authorize unattended delivery.
6. Train staff to check government-issued photo ID for pickup orders.
