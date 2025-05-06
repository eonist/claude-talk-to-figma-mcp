/**
 * Generic batch processor utility.
 * Processes items in configurable chunks with optional concurrency and progress reporting.
 */

interface BatchOptions {
  /** Number of items per chunk (default: 20) */
  chunkSize?: number;
  /** Number of parallel operations per chunk (default: 5) */
  concurrency?: number;
  /** Progress callback: (processedCount, totalCount) */
  onProgress?: (processed: number, total: number) => void;
}

export async function processBatch<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  options: BatchOptions = {}
): Promise<Array<{ item: T; result?: R; error?: string }>> {
  const { chunkSize = 20, concurrency = 5, onProgress } = options;
  const results: Array<{ item: T; result?: R; error?: string }> = [];
  const total = items.length;
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    // run chunk in parallel up to concurrency
    const promises = chunk.map(item =>
      operation(item)
        .then(res => ({ item, result: res }))
        .catch(err => ({ item, error: err instanceof Error ? err.message : String(err) }))
    );
    const settled = await Promise.all(promises);
    results.push(...settled);
    if (onProgress) {
      onProgress(Math.min(i + chunk.length, total), total);
    }
  }
  return results;
}
