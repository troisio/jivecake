export function isValidEmail(email) {
  return new RegExp(`[a-z0-9!#$%&'*+/=?^_\`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_\`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?`).test(email);
}

export function safe(run, defaultValue) {
  try {
    const result = run();
    return typeof result === 'undefined' ? defaultValue : result;
  } catch {
    return defaultValue;
  }
}
