export const deleteAccountRequestTemplate = (
  code: number,
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

.otp-wrapper {
  background: #fff1f2;
  border: 2px dashed #f43f5e;
  border-radius: 16px;
  padding: 28px 20px;
  margin: 25px 0;
  position: relative;
}

.otp-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #e11d48;
  margin-bottom: 10px;
}

.otp {
  font-size: 25px;
  font-weight: 800;
  letter-spacing: 12px;
  color: #9f1239;
  font-family: 'Courier New', Courier, monospace;
}

.otp-expiry {
  margin-top: 10px;
  font-size: 12px;
  color: #64748b;
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
      <div class="brand-badge">⚠️ Account Deletion Request</div>
      <h1>${subject}</h1>
      <p>Permanent Account & Data Removal</p>
    </div>

    <div class="body">

      <h2 class="greeting">Hello ${firstName},</h2>

      <p class="description">
        We received a request to <strong>permanently delete</strong> your <strong>Tabeebi</strong> account. To confirm this action and complete the account removal process, please use the verification code below.
      </p>

      <div class="otp-wrapper">
        <div class="otp-label">Deletion Confirmation Code</div>
        <div class="otp">${code}</div>
        <div class="otp-expiry">⏱️ Valid for 5 minutes</div>
      </div>

      <div class="info-card">
        <p>
          <strong>Warning:</strong> This action cannot be undone. Once confirmed, your medical history, scheduled appointments, and personal data will be permanently purged from Tabeebi servers.
        </p>
      </div>

      <div class="divider"></div>

      <p style="font-size: 13px; color: #64748b;">
        If you did not request to delete your account, please change your password immediately or contact Tabeebi security support.
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
