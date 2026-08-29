export const welcomeTemplate = (
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

.features-wrapper {
  background: #f0fdfa;
  border: 1px dashed #14b8a6;
  border-radius: 16px;
  padding: 24px 20px;
  margin: 25px 0;
  text-align: left;
}

.features-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #0f766e;
  margin-bottom: 14px;
  text-align: center;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #334155;
  margin-bottom: 10px;
}

.feature-item:last-child {
  margin-bottom: 0;
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
      <div class="brand-badge">🩺 Welcome To Tabeebi</div>
      <h1>${subject}</h1>
      <p>Your Health Journey Starts Here</p>
    </div>

    <div class="body">

      <h2 class="greeting">Welcome, ${firstName}! 👋</h2>

      <p class="description">
        We are thrilled to have you join <strong>Tabeebi</strong>. Your account has been successfully verified, giving you full access to a complete digital healthcare ecosystem tailored for your well-being.
      </p>

      <div class="features-wrapper">
        <div class="features-title">What you can do now</div>
        <div class="feature-item">📅 <strong>Book Appointments:</strong> Schedule visits with top-rated medical specialists.</div>
        <div class="feature-item" style="margin-top:8px;">💊 <strong>Pharmacy & Supplies:</strong> Order medications and medical equipment seamlessly.</div>
        <div class="feature-item" style="margin-top:8px;">🩺 <strong>Manage Records:</strong> Track your consultation history and prescriptions securely.</div>
      </div>

      <div class="info-card">
        <p>
          <strong>Patient Privacy First:</strong> Your medical records and personal data are protected using state-of-the-art security standards.
        </p>
      </div>

      <div class="divider"></div>

      <p style="font-size: 13px; color: #64748b;">
        Have questions? Our medical support team is available 24/7 through the Tabeebi application.
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
