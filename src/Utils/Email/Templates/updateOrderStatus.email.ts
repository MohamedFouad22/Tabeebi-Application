export const orderStatusUpdateTemplate = (
  userName: string,
  status: string,
  total: number,
  address: string,
  phone: string,
  subject: string,
) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #334155;
  -webkit-font-smoothing: antialiased;
}

.wrapper {
  width: 100%;
  padding: 45px 15px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.header {
  background: linear-gradient(135deg, #0f766e 0%, #0e7490 50%, #0369a1 100%);
  padding: 42px 30px;
  text-align: center;
  color: #ffffff;
}

.brand-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 17px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header h1 {
  font-size: 25px;
  line-height: 1.35;
  font-weight: 700;
  margin-bottom: 9px;
  letter-spacing: -0.4px;
}

.header p {
  font-size: 14px;
  line-height: 1.6;
  color: #e0f2fe;
  opacity: 0.95;
}

.body {
  padding: 42px 34px;
}

.greeting {
  font-size: 22px;
  line-height: 1.45;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 14px;
  text-align: center;
}

.description {
  font-size: 15px;
  line-height: 1.8;
  color: #475569;
  margin: 0 auto 30px;
  text-align: center;
  max-width: 500px;
}

.status-card {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 16px;
  padding: 24px 22px;
  margin: 28px 0 32px;
}

.status-title {
  font-size: 13px;
  line-height: 1.4;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #0d9488;
  margin-bottom: 17px;
}

.status-table {
  width: 100%;
  border-collapse: collapse;
}

.status-table td {
  padding: 12px 0;
  vertical-align: middle;
}

.status-table tr:not(:last-child) td {
  border-bottom: 1px solid #ccfbf1;
}

.status-label {
  font-size: 13px;
  line-height: 1.5;
  color: #64748b;
  text-align: left;
}

.status-value {
  font-size: 14px;
  line-height: 1.5;
  font-weight: 700;
  color: #0f172a;
  text-align: right;
}

.status-row td {
  padding-top: 17px;
  border-top: 2px solid #99f6e4 !important;
  border-bottom: none !important;
}

.status-row .status-label {
  font-size: 15px;
  font-weight: 700;
  color: #0f766e;
}

.status-row .status-value {
  font-size: 15px;
  color: #0f766e;
}

.total-row .status-value {
  font-size: 20px;
  color: #0f766e;
}

.info-card {
  margin-top: 32px;
  padding: 20px 21px;
  border-radius: 13px;
  background: #f0f9ff;
  border-left: 4px solid #0284c7;
}

.info-card p {
  font-size: 13px;
  line-height: 2;
  color: #075985;
}

.info-card strong {
  display: inline-block;
  margin-bottom: 4px;
  color: #0369a1;
}

.divider {
  width: 100%;
  height: 1px;
  background: #e2e8f0;
  margin: 32px 0;
}

.thanks {
  font-size: 13px;
  line-height: 1.8;
  color: #64748b;
  text-align: center;
}

.footer {
  background: #f8fafc;
  padding: 30px 25px;
  text-align: center;
  border-top: 1px solid #f1f5f9;
}

.footer-brand {
  font-size: 16px;
  line-height: 1.5;
  font-weight: 700;
  color: #0f766e;
  margin-bottom: 7px;
}

.footer-tagline {
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
  margin-bottom: 14px;
}

.copyright {
  font-size: 12px;
  line-height: 1.5;
  color: #94a3b8;
}

@media (max-width: 600px) {
  .wrapper {
    padding: 20px 10px;
  }

  .container {
    border-radius: 18px;
  }

  .header {
    padding: 34px 20px;
  }

  .header h1 {
    font-size: 22px;
  }

  .body {
    padding: 32px 20px;
  }

  .greeting {
    font-size: 20px;
  }

  .description {
    font-size: 14px;
    line-height: 1.8;
  }

  .status-card {
    padding: 20px 17px;
  }

  .status-table td {
    padding: 11px 0;
  }

  .status-label {
    font-size: 12px;
  }

  .status-value {
    font-size: 13px;
  }

  .status-row .status-value {
    font-size: 14px;
  }

  .total-row .status-value {
    font-size: 18px;
  }

  .info-card {
    padding: 18px;
  }

  .footer {
    padding: 26px 20px;
  }
}
</style>
</head>

<body>

<div class="wrapper">
  <div class="container">

    <div class="header">
      <div class="brand-badge">🩺 Tabeebi Healthcare</div>
      <h1>${subject}</h1>
      <p>Order Status Update</p>
    </div>

    <div class="body">

      <h2 class="greeting">Hello ${userName},</h2>

      <p class="description">
        Your order status has been updated. Please find the latest details of your order below.
      </p>

      <div class="status-card">
        <div class="status-title">Order Information</div>

        <table class="status-table">
          <tr class="status-row">
            <td class="status-label">Order Status</td>
            <td class="status-value">${status}</td>
          </tr>
          <tr class="total-row">
            <td class="status-label">Total Amount</td>
            <td class="status-value">${total}</td>
          </tr>
        </table>
      </div>

      <div class="info-card">
        <p>
          <strong>Delivery Information</strong><br>
          Address: ${address}<br>
          Phone: ${phone}
        </p>
      </div>

      <div class="divider"></div>

      <p class="thanks">
        Thank you for choosing Tabeebi. We appreciate your trust and will keep you updated regarding your order.
      </p>

    </div>

    <div class="footer">
      <p class="footer-brand">Tabeebi • طبيبي</p>
      <p class="footer-tagline">Integrated Digital Healthcare & Telemedicine Platform</p>
      <p class="copyright">© 2026 Tabeebi. All rights reserved.</p>
    </div>

  </div>
</div>

</body>
</html>`;
