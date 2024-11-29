class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = navigator.onLine;
  private pendingRequests: Map<string, any[]> = new Map();
  private listeners: Set<(online: boolean) => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notifyListeners();
    this.processPendingRequests();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notifyListeners();
  };

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  public addListener(listener: (online: boolean) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public async queueRequest(key: string, request: any) {
    const pending = this.pendingRequests.get(key) || [];
    pending.push(request);
    this.pendingRequests.set(key, pending);

    if (this.isOnline) {
      await this.processPendingRequests();
    }
  }

  private async processPendingRequests() {
    if (!this.isOnline) return;

    for (const [key, requests] of this.pendingRequests.entries()) {
      while (requests.length > 0) {
        const request = requests.shift();
        try {
          await request();
        } catch (error) {
          console.error('Error processing pending request:', error);
          // Re-queue failed requests
          requests.push(request);
        }
      }
      this.pendingRequests.delete(key);
    }
  }

  public cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.listeners.clear();
    this.pendingRequests.clear();
  }
}

export const offline_manager = OfflineManager.getInstance();
