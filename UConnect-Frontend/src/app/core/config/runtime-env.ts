type RuntimeEnv = {
  API_BASE_URL?: string;
};

const runtimeEnv = (globalThis as { __env?: RuntimeEnv }).__env;

export const runtimeEnvConfig = {
  apiBaseUrl: (runtimeEnv?.API_BASE_URL ?? '/api').trim(),
};
