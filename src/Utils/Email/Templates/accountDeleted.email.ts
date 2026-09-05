export const accountDeletedSuccessTemplate = (
  firstName: string,
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
  padding: 40px 15px;
}

.container {
  max-width: 580px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.header {
  background: linear-gradient(135deg, #334155 0%, #475569 50%, #1e293b 100%);
  padding: 40px 30px;
  text-align: center;
  color: #ffffff;
  position: relative;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 6px 16px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.header p {
  font-size: 14px;
  color: #cbd5e1;
  opacity: 0.9;
}

.body {
  padding: 40px 32px;
  text-align: center;
}

.greeting {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;
}

.description {
  font-size: 15px;
  line-height: 1.7;
  color: #475569;
  margin-bottom: 28px;
}

.status-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px 20px;
  margin: 25px 0;
  text-align: left;
}

.status-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #334155;
}

.status-item:last-child {
  margin-bottom: 0;
}

.icon {
  font-size: 16px;
  line-height: 1;
}

.divider {
  width: 100%;
  height: 1px;
  background: #f1f5f9;
  margin: 30px 0;
}

.footer {
  background: #f8fafc;
  padding: 28px;
  text-align: center;
  border-top: 1px solid #f1f5f9;
}

.footer-brand {
  font-size: 16px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 4px;
}

.footer-tagline {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 12px;
}

.copyright {
  font-size: 12px;
  color: #94a3b8;
}
</style>
</head>

<body>

<div class="wrapper">
  <div class="container">

    <div class="header">
      <div class="brand-badge">🗑️ Account Closed</div>
      <h1>${subject}</h1>
      <p>Confirmation of Account Deletion</p>
    </div>

    <div class="body">

      <h2 class="greeting">Goodbye ${firstName},</h2>

      <p class="description">
        This email confirms that your <strong>Tabeebi</strong> account and all associated data have been <strong>permanently deleted</strong> per your request.
      </p>

      <div class="status-card">
        <div class="status-item">
          <span class="icon">✅</span>
          <span>Personal profile & credentials removed</span>
        </div>
        <div class="status-item">
          <span class="icon">✅</span>
          <span>Medical records & appointments purged</span>
        </div>
        <div class="status-item">
          <span class="icon">✅</span>
          <span>Active sessions terminated</span>
        </div>
      </div>

      <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
        We’re sorry to see you go. If you ever decide to return, you are always welcome to create a new account on Tabeebi at any time.
      </p>

      <div class="divider"></div>

      <p style="font-size: 13px; color: #94a3b8;">
        Thank you for being part of the Tabeebi healthcare community.
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
