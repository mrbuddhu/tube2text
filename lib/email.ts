import nodemailer from 'nodemailer';
import { supabaseAdmin } from './supabase';

// Initialize nodemailer with your email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

interface AlertSettings {
  errorAlerts: boolean;
  paymentAlerts: boolean;
  dailyReports: boolean;
  alertEmail: string;
  errorThreshold: number;
  revenueGoal: number;
}

export async function getAlertSettings(): Promise<AlertSettings | null> {
  const { data, error } = await supabaseAdmin
    .from('admin_settings')
    .select('settings')
    .single();

  if (error || !data) {
    console.error('Error fetching alert settings:', error);
    return null;
  }

  return data.settings as AlertSettings;
}

export async function sendErrorAlert(error: any) {
  const settings = await getAlertSettings();
  if (!settings?.errorAlerts) return;

  const { data: recentErrors } = await supabaseAdmin
    .from('error_logs')
    .select('*')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if ((recentErrors?.length || 0) < settings.errorThreshold) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: settings.alertEmail,
    subject: '🚨 Tube2Text Error Alert',
    html: `
      <h2>Error Alert</h2>
      <p>Error threshold (${settings.errorThreshold}) exceeded in the last 24 hours.</p>
      <h3>Latest Error:</h3>
      <pre>${JSON.stringify(error, null, 2)}</pre>
      <p>Please check the admin dashboard for more details.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

export async function sendPaymentAlert(payment: any) {
  const settings = await getAlertSettings();
  if (!settings?.paymentAlerts) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: settings.alertEmail,
    subject: '💰 New Payment Received - Tube2Text',
    html: `
      <h2>New Payment Received</h2>
      <p>Amount: $${payment.amount}</p>
      <p>Plan: ${payment.tier}</p>
      <p>User ID: ${payment.userId}</p>
      <p>Time: ${new Date().toLocaleString()}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

export async function sendDailyReport() {
  const settings = await getAlertSettings();
  if (!settings?.dailyReports) return;

  // Get today's stats
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();

  // Get new users
  const { data: newUsers } = await supabaseAdmin
    .from('analytics_events')
    .select('*')
    .eq('event_name', 'user_signed_up')
    .gte('created_at', startOfDay);

  // Get new payments
  const { data: payments } = await supabaseAdmin
    .from('analytics_events')
    .select('*')
    .eq('event_name', 'payment_initiated')
    .gte('created_at', startOfDay);

  // Get processed videos
  const { data: videos } = await supabaseAdmin
    .from('transcriptions')
    .select('*')
    .gte('created_at', startOfDay);

  // Calculate revenue
  const dailyRevenue = payments?.reduce((sum, p) => sum + (p.properties.amount || 0), 0) || 0;
  const progressToGoal = (dailyRevenue / settings.revenueGoal) * 100;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: settings.alertEmail,
    subject: '📊 Tube2Text Daily Report',
    html: `
      <h2>Daily Report - ${new Date().toLocaleDateString()}</h2>
      
      <h3>Today's Metrics:</h3>
      <ul>
        <li>New Users: ${newUsers?.length || 0}</li>
        <li>Videos Processed: ${videos?.length || 0}</li>
        <li>Revenue: $${dailyRevenue}</li>
        <li>Progress to Goal: ${progressToGoal.toFixed(1)}%</li>
      </ul>

      <h3>Recent Payments:</h3>
      <ul>
        ${payments?.map(p => `
          <li>$${p.properties.amount} - ${p.properties.tier}</li>
        `).join('') || 'No payments today'}
      </ul>

      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">View Dashboard</a></p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}
