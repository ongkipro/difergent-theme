import {validateConfig, validateEnv, type ValidatedConfig} from './validate';

/**
 * The single typed configuration value. Validation runs once at module load,
 * so a misconfigured store fails the build or the boot instead of rendering a
 * broken page.
 */
export const config: ValidatedConfig = validateConfig();

export type {ValidatedConfig};
export {validateEnv};
export {ConfigError} from './schema';
