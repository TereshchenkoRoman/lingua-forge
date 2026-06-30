const sleep = (delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 300,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < retries - 1) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}