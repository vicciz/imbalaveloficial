let lastCjRequestAt = 0;
let cjRequestQueue: Promise<void> = Promise.resolve();

export async function waitForCjSlot(): Promise<void> {
  let release!: () => void;
  const previous = cjRequestQueue;

  cjRequestQueue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  const elapsed = Date.now() - lastCjRequestAt;
  const wait = Math.max(0, 1000 - elapsed);

  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }

  lastCjRequestAt = Date.now();
  release();
}
