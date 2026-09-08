export const contactUsConfirmationTemplate = (
  userName: string,
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
  background: linear-gradient(135deg, #0f766e 0%, #0e7490 50%, #0369a1 100%);
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
  color: #e0f2fe;
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
  background: #f0fdfa;
  border: 2px dashed #14b8a6;
  border-radius: 16px;
  padding: 24px 20px;
  margin: 25px 0;
  position: relative;
}

.status-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.status-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f766e;
  margin-bottom: 4px;
}

.status-subtitle {
  font-size: 13px;
  color: #0d9488;
}

.info-card {
  margin-top: 30px;
  padding: 16px 20px;
  border-radius: 12px;
  background: #f8fafc;
  border-left: 4px solid #0ea5e9;
  text-align: left;
}

.info-card p {
  font-size: 13px;
  color: #64748b;
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
  color: #0f766e;
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
      <div class="brand-badge">🩺 Tabeebi Support</div>
      <h1>${subject}</h1>
      <p>Customer Support & Inquiries Confirmation</p>
    </div>

    <div class="body">

      <h2 class="greeting">Hello ${userName},</h2>

      <p class="description">
        Thank you for reaching out to <strong>Tabeebi</strong>. We have successfully received your inquiry and our dedicated support team is currently reviewing it.
      </p>

      <div class="status-card">
        <div class="status-icon">📩</div>
        <div class="status-title">Inquiry Submitted Successfully</div>
        <div class="status-subtitle">Expected response within 24 business hours</div>
      </div>

      <div class="info-card">
        <p>
          <strong>What's Next?</strong> One of our healthcare support representatives will review your message and reply back to you directly at this email address.
        </p>
      </div>

      <div class="divider"></div>

      <p style="font-size: 13px; color: #64748b;">
        If you have urgent medical needs, please access your emergency support options directly within the Tabeebi portal.
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
