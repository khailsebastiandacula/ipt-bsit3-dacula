import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const envPath = resolve(projectRoot, '.env');
const outputPath = resolve(projectRoot, 'public', 'env.js');

function parseEnvFile(content) {
  const data = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');
    if (separator <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['\"]|['\"]$/g, '');

    data[key] = value;
  }

  return data;
}

let env = {};
try {
  env = parseEnvFile(readFileSync(envPath, 'utf8'));
} catch {
  env = {};
}

const apiBaseUrl = process.env.API_BASE_URL || env.API_BASE_URL || '/api';
const escapedApiBaseUrl = JSON.stringify(apiBaseUrl);

const output = `window.__env = Object.assign({}, window.__env, { API_BASE_URL: ${escapedApiBaseUrl} });\n`;
writeFileSync(outputPath, output, 'utf8');
