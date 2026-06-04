export interface FirestoreProfileLog {
  id: string;
  timestamp: string;
  operation: 'READ' | 'WRITE' | 'DELETE' | 'SYNC_IN' | 'SYNC_OUT' | 'BULK_RESTORE';
  docId?: string;
  profileName?: string;
  fields?: string[];
  status: 'SUCCESS' | 'ERROR';
  latencyMs: number;
  errorMessage?: string;
}

class FirestoreProfileLogger {
  private logs: FirestoreProfileLog[] = [];
  private maxLogs = 100;

  public log(
    operation: FirestoreProfileLog['operation'],
    docId?: string,
    profileName?: string,
    fields?: string[],
    status: 'SUCCESS' | 'ERROR' = 'SUCCESS',
    latencyMs: number = 0,
    errorMessage?: string
  ) {
    const entry: FirestoreProfileLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      timestamp: new Date().toISOString(),
      operation,
      docId,
      profileName,
      fields,
      status,
      latencyMs,
      errorMessage,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Elegant and highly legible console log output using ANSI color escapes
    const color = status === 'SUCCESS' ? '\x1b[32m' : '\x1b[31m'; // Green vs Red
    const reset = '\x1b[0m';
    const blue = '\x1b[34m';
    const yellow = '\x1b[33m';

    console.log(
      `[${entry.timestamp}] 🔥 ${blue}[Firestore-Profile-Monitor]${reset} ${yellow}${operation}${reset} ` +
      `- ID: ${docId || 'N/A'} - Name: ${profileName || 'N/A'} ` +
      `${fields && fields.length > 0 ? `(Keys: [${fields.join(', ')}]) ` : ''}` +
      `- Status: ${color}${status}${reset} (${latencyMs}ms)` +
      `${errorMessage ? ` - ❌ Error: ${errorMessage}` : ''}`
    );
  }

  public getLogs(): FirestoreProfileLog[] {
    return this.logs;
  }

  public clearLogs() {
    this.logs = [];
    this.log('DELETE', 'all', 'Logs Cleared', [], 'SUCCESS', 0);
  }
}

export const firestoreProfileLogger = new FirestoreProfileLogger();
