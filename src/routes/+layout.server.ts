// src/routes/+layout.server.ts
import { dev } from '$app/environment';

export const csr = dev;
export const prerender = true;

export function load() {
  return {
    themePreference: 'light'
  };
}