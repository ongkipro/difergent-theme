/**
 * A deliberately small validator. The project needs shape checking with clear
 * messages, not a schema library, so this is a handful of functions rather than
 * a dependency.
 */
export class ConfigError extends Error {
  constructor(key: string, expected: string, received: unknown) {
    super(
      `Invalid configuration at "${key}": expected ${expected}, received ${describe(
        received,
      )}. Fix it in the config/ directory, or in the environment for env keys.`,
    );
    this.name = 'ConfigError';
  }
}

function describe(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (Array.isArray(value)) return `array(length ${value.length})`;
  if (typeof value === 'string') return value === '' ? 'empty string' : 'string';
  return typeof value;
}

export function str(key: string, value: unknown): string {
  if (typeof value !== 'string') throw new ConfigError(key, 'a string', value);
  return value;
}

/** A string that must carry a value. Use for anything the storefront cannot render without. */
export function required(key: string, value: unknown): string {
  const s = str(key, value);
  if (s.trim() === '') throw new ConfigError(key, 'a non-empty string', value);
  return s;
}

export function optional(key: string, value: unknown): string {
  return value === undefined ? '' : str(key, value);
}

export function bool(key: string, value: unknown): boolean {
  if (typeof value !== 'boolean') throw new ConfigError(key, 'a boolean', value);
  return value;
}

export function int(key: string, value: unknown, min = 1, max = 1000): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new ConfigError(key, 'an integer', value);
  }
  if (value < min || value > max) {
    throw new ConfigError(key, `an integer between ${min} and ${max}`, value);
  }
  return value;
}

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Colors may be empty when a fallback is defined, so emptiness is checked by the caller. */
export function color(key: string, value: unknown): string {
  const s = str(key, value);
  if (s !== '' && !HEX.test(s)) {
    throw new ConfigError(key, 'a hex color such as #1A1917, or an empty string', value);
  }
  return s;
}

export function url(key: string, value: unknown): string {
  const s = required(key, value);
  try {
    new URL(s);
  } catch {
    throw new ConfigError(key, 'an absolute URL including the scheme', value);
  }
  return s.replace(/\/+$/, '');
}

export function oneOf<T extends string>(
  key: string,
  value: unknown,
  allowed: readonly T[],
): T {
  const s = str(key, value);
  if (!allowed.includes(s as T)) {
    throw new ConfigError(key, `one of ${allowed.join(', ')}`, value);
  }
  return s as T;
}
