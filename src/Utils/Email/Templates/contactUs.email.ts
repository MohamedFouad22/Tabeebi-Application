export const contactUsTemplate = (
  userName: string,
  email: string,
  phone: string,
  comment: string,
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
  text-align: left;
}

.data-card {
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  border-radius: 16px;
  padding: 24px;
  margin: 20px 0;
}

.data-row {
  margin-bottom: 16px;
}

.data-row:last-child {
  margin-bottom: 0;
}

.data-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #0d9488;
  margin-bottom: 4px;
}

.data-value {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  word-break: break-word;
}

.data-value a {
  color: #0284c7;
  text-decoration: none;
}

.comment-card {
  margin-top: 24px;
  padding: 20px;
  border-radius: 12px;
  background: #f8fafc;
  border-left: 4px solid #0ea5e9;
}

.comment-card p {
  font-size: 14px;
  color: #334155;
  line-height: 1.7;
  white-space: pre-wrap;
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
      <div class="brand-badge">🩺 Tabeebi Healthcare</div>
      <h1>${subject}</h1>
      <p>Customer Support & Inquiries Gateway</p>
    </div>

    <div class="body">

      <p style="font-size: 15px; color: #475569; line-height: 1.6;">
        A new contact message has been submitted through the <strong>Tabeebi</strong> platform. Details are provided below:
      </p>

      <div class="data-card">
        <div class="data-row">
          <div class="data-label">User Name</div>
          <div class="data-value">${userName}</div>
        </div>

        <div class="data-row">
          <div class="data-label">Email Address</div>
          <div class="data-value"><a href="mailto:${email}">${email}</a></div>
        </div>

        <div class="data-row">
          <div class="data-label">Phone Number</div>
          <div class="data-value" dir="ltr" style="text-align: left;">${phone}</div>
        </div>
      </div>

      <div class="comment-card">
        <div class="data-label" style="margin-bottom: 8px;">User Message / Inquiry</div>
        <p>${comment}</p>
      </div>

      <div class="divider"></div>

      <p style="font-size: 13px; color: #64748b; text-align: center;">
        You can reply directly to the sender by emailing <a href="mailto:${email}" style="color: #0e7490; font-weight: 600;">${email}</a>.
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
