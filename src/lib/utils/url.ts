// lib/utils/url.ts
import { browser } from '$app/environment'

export function getHashFromUrl(): string {
  if (!browser) return ''
  return window.location.hash.slice(1)
}