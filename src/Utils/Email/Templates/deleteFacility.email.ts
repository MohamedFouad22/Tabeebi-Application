export const deleteAccountConfirmationTemplate = (
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
  background: linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #b91c1c 100%);
  padding: 40px 30px;
  text-align: center;
  color: #ffffff;
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
  color: #fecdd3;
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

.success-card {
  background: #f0fdf4;
  border: 2px dashed #22c55e;
  border-radius: 16px;
  padding: 28px 20px;
  margin: 25px 0;
}

.success-icon {
  font-size: 42px;
  margin-bottom: 12px;
}

.success-title {
  font-size: 18px;
  font-weight: 800;
  color: #166534;
  margin-bottom: 8px;
}

.success-text {
  font-size: 13px;
  line-height: 1.6;
  color: #15803d;
}

.info-card {
  margin-top: 30px;
  padding: 16px 20px;
  border-radius: 12px;
  background: #fffbf0;
  border-left: 4px solid #f59e0b;
  text-align: left;
}

.info-card p {
  font-size: 13px;
  color: #78350f;
  line-height: 1.6;
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
  color: #991b1b;
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
      <div class="brand-badge">✓ Account Deleted</div>
      <h1>${subject}</h1>
      <p>Account & Data Removal Completed</p>
    </div>

    <div class="body">

      <h2 class="greeting">Hello ${firstName},</h2>

      <p class="description">
        Your request to <strong>permanently delete</strong> your <strong>Tabeebi</strong> account has been successfully confirmed and processed.
      </p>

      <div class="success-card">
        <div class="success-icon">✓</div>
        <div class="success-title">Account Successfully Deleted</div>
        <div class="success-text">
          Your account deletion request has been completed successfully.
          Your account is no longer active on the Tabeebi platform.
        </div>
      </div>

      <div class="info-card">
        <p>
          <strong>Important:</strong> This action is permanent and cannot be undone.
          You will need to create a new account if you decide to use Tabeebi again in the future.
        </p>
      </div>

      <div class="divider"></div>

      <p style="font-size: 13px; color: #64748b;">
        If you did not request this deletion, please contact Tabeebi security support immediately.
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
