// lib/utils/qr.ts
import type { Address } from 'viem'

// Fonction utilitaire pour générer un QR code SVG simple et statique
export function generateAddressQR(address: Address): string {
  // Utilise une librairie simple de QR code qui génère du SVG statique
  // Exemple simplifié - à remplacer par une vraie implémentation QR
  return `
    <svg 
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      class="w-full max-w-[200px] mx-auto"
    >
      <rect width="100" height="100" fill="currentColor" class="text-white dark:text-gray-800"/>
      <text
        x="50"
        y="50"
        text-anchor="middle"
        class="text-xs text-gray-800 dark:text-gray-200"
      >
        ${address}
      </text>
    </svg>
  `
}