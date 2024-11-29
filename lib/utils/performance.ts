export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]>;

  private constructor() {
    this.metrics = new Map();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(key: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      const existing = this.metrics.get(key) || [];
      this.metrics.set(key, [...existing, duration]);
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance [${key}]:`, Math.round(duration), 'ms');
      }
    };
  }

  getAverageMetric(key: string): number {
    const metrics = this.metrics.get(key);
    if (!metrics || metrics.length === 0) return 0;
    return metrics.reduce((a, b) => a + b, 0) / metrics.length;
  }

  getAllMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    this.metrics.forEach((values, key) => {
      result[key] = {
        average: this.getAverageMetric(key),
        count: values.length
      };
    });
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

export const performance_monitor = PerformanceMonitor.getInstance();
