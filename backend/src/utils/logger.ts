type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const formatTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[${formatTimestamp()}] [INFO] [CareNest] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[${formatTimestamp()}] [WARN] [CareNest] ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[${formatTimestamp()}] [ERROR] [CareNest] ${message}`, error ? error : '');
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[${formatTimestamp()}] [DEBUG] [CareNest] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  }
};

