import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { EmailClient } from '@azure/communication-email';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// JSON body parser
app.use(express.json());

/* ── Azure Email Client ────────────────────────────────────────── */
const CONN_STR = process.env.AZURE_COMM_CONNECTION_STRING || '';
const SENDER   = process.env.AZURE_EMAIL_SENDER || '';
const ADMIN    = process.env.ADMIN_EMAIL || '22240802@life.hkbu.edu.hk';

let emailClient = null;
if (CONN_STR && !CONN_STR.includes('YOUR_RESOURCE')) {
  try {
    emailClient = new EmailClient(CONN_STR);
    console.log('✓ Azure Email client initialised');
  } catch (err) {
    console.warn('⚠ Azure Email client failed to initialise:', err.message);
  }
} else {
  console.log('ℹ Azure Email not configured — emails will be logged to console');
}

/* ── POST /api/send-email ──────────────────────────────────────── */
app.post('/api/send-email', async (req, res) => {
  const { to, subject, htmlBody, plainBody } = req.body;

  if (!subject || (!htmlBody && !plainBody)) {
    return res.status(400).json({ ok: false, error: 'subject and body required' });
  }

  const recipient = to || ADMIN;

  // If Azure not configured → log to console and return success (demo mode)
  if (!emailClient) {
    console.log('──── EMAIL (demo - not actually sent) ────');
    console.log('To:     ', recipient);
    console.log('Subject:', subject);
    console.log('Body:   ', (plainBody || htmlBody || '').slice(0, 300));
    console.log('──────────────────────────────────────────');
    return res.json({ ok: true, demo: true, message: 'Email logged (Azure not configured)' });
  }

  // Send via Azure Communication Services
  try {
    const message = {
      senderAddress: SENDER,
      content: {
        subject,
        ...(htmlBody  ? { html:      htmlBody  } : {}),
        ...(plainBody ? { plainText: plainBody } : {}),
      },
      recipients: {
        to: [{ address: recipient }],
      },
    };

    const poller = await emailClient.beginSend(message);
    const result = await poller.pollUntilDone();

    console.log(`✓ Email sent to ${recipient} — id: ${result.id}`);
    return res.json({ ok: true, id: result.id });
  } catch (err) {
    console.error('✗ Email send failed:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/* ── Static files (production build) ───────────────────────────── */
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback - all routes go to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});
