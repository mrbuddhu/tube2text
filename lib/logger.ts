export const logger = {
  log: (message: string, data?: any) => {
    console.log(message, data);
    saveLog('info', message, data);
  },
  error: (message: string, error?: any) => {
    console.error(message, error);
    saveLog('error', message, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(message, data);
    saveLog('warn', message, data);
  }
};

function saveLog(level: string, message: string, data?: any) {
  try {
    const logs = JSON.parse(localStorage.getItem('tube2text_logs') || '[]');
    logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? JSON.stringify(data) : undefined
    });
    // Keep only last 100 logs
    if (logs.length > 100) logs.shift();
    localStorage.setItem('tube2text_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to save log', error);
  }
}
