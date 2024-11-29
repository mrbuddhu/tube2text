class PrefetchManager {
  private static instance: PrefetchManager;
  private prefetchedUrls: Set<string> = new Set();
  private prefetchQueue: string[] = [];
  private isProcessing: boolean = false;
  private maxConcurrent: number = 2;

  private constructor() {}

  public static getInstance(): PrefetchManager {
    if (!PrefetchManager.instance) {
      PrefetchManager.instance = new PrefetchManager();
    }
    return PrefetchManager.instance;
  }

  public async prefetch(url: string, priority: boolean = false) {
    if (this.prefetchedUrls.has(url)) return;

    if (priority) {
      this.prefetchQueue.unshift(url);
    } else {
      this.prefetchQueue.push(url);
    }

    if (!this.isProcessing) {
      this.processPrefetchQueue();
    }
  }

  private async processPrefetchQueue() {
    if (this.prefetchQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const batch = this.prefetchQueue.splice(0, this.maxConcurrent);

    try {
      await Promise.all(
        batch.map(async (url) => {
          try {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
            this.prefetchedUrls.add(url);
          } catch (error) {
            console.warn(`Failed to prefetch: ${url}`, error);
          }
        })
      );
    } finally {
      if (this.prefetchQueue.length > 0) {
        setTimeout(() => this.processPrefetchQueue(), 1000);
      } else {
        this.isProcessing = false;
      }
    }
  }

  public setPrefetchPriority(urls: string[]) {
    this.prefetchQueue = [
      ...urls.filter(url => !this.prefetchedUrls.has(url)),
      ...this.prefetchQueue
    ];
  }

  public clearPrefetchCache() {
    this.prefetchedUrls.clear();
    this.prefetchQueue = [];
    this.isProcessing = false;
  }
}

export const prefetch_manager = PrefetchManager.getInstance();
