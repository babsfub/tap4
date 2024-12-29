// lib/services/crypto.ts
import { hexToBytes, utf8ToBytes, bytesToHex } from '@noble/ciphers/utils';
import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { randomBytes } from '@noble/ciphers/webcrypto';
import { isAddress, type Address, type Hash } from 'viem';
import { generatePrivateKey } from 'viem/accounts';

// Types pour améliorer la sécurité et la clarté du code
interface CardData {
  pub: Address;
  priv: string;
  id: number;
}

class CryptoService {
  // Ajouter une méthode pour générer une clé privée sécurisée
  generateSecurePrivateKey(): Hash {
    return generatePrivateKey()
  }

  // Convertit une chaîne base64 en hex avec validation
  base64ToHex(str: string): string {
    if (!str) throw new Error('Invalid input: empty string')
    
    try {
      const raw = atob(str)
      let result = ''
      for (let i = 0; i < raw.length; i++) {
        const hex = raw.charCodeAt(i).toString(16)
        result += (hex.length === 2 ? hex : '0' + hex)
      }
      return result.toLowerCase()
    } catch (error) {
      throw new Error('Invalid base64 string')
    }
  }

  // Convertit une chaîne base64 en base 10 avec validation
  base64ToBase10(str: string): number {
    if (!str) throw new Error('Invalid input: empty string')

    const order = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-"
    const base = order.length
    let num = 0

    for (const char of str) {
      const value = order.indexOf(char)
      if (value === -1) {
        throw new Error('Invalid character in string')
      }
      num = num * base + value
    }
    
    if (num < 0) {
      throw new Error('Invalid numeric result')
    }
    
    return num
  }

  // Chiffre une clé privée avec validation renforcée
  encryptPrivateKey(privateKey: string, pin: string): string {
    if (!this.validatePin(pin)) {
      throw new Error('Invalid PIN format')
    }

    if (!privateKey.match(/^0x[a-f0-9]{64}$/i)) {
      throw new Error('Invalid private key format')
    }

    try {
      const key = utf8ToBytes(pin.padEnd(32, '0'))
      const nonce = randomBytes(24)
      const chacha = xchacha20poly1305(key, nonce)
      const data = hexToBytes(privateKey)
      const encrypted = chacha.encrypt(data)
      
      const result = new Uint8Array(nonce.length + encrypted.length)
      result.set(nonce)
      result.set(encrypted, nonce.length)
      
      return bytesToHex(result)
    } catch (error) {
      throw new Error('Encryption failed')
    }
  }

  // Déchiffre une clé privée avec validation renforcée
  decryptPrivateKey(encryptedKey: string, pin: string): Hash {
    if (!this.validatePin(pin)) {
      throw new Error('Invalid PIN format')
    }

    if (!encryptedKey.match(/^0x[a-f0-9]+$/i)) {
      throw new Error('Invalid encrypted key format')
    }

    try {
      const data = hexToBytes(encryptedKey)
      const nonce = data.slice(0, 24)
      const ciphertext = data.slice(24)
      
      const key = utf8ToBytes(pin.padEnd(32, '0'))
      const chacha = xchacha20poly1305(key, nonce)
      const decrypted = chacha.decrypt(ciphertext)
      
      const result = bytesToHex(decrypted) as Hash
      
      // Vérifier que la clé déchiffrée est valide
      if (!result.match(/^0x[a-f0-9]{64}$/i)) {
        throw new Error('Decrypted key is invalid')
      }

      return result
    } catch {
      throw new Error('Decryption failed')
    }
  }

  // Parse les données d'une carte avec validation typage strict
  parseCardData(hash: string): CardData | null {
    if (!hash) return null

    try {
      const [pub, priv, id] = hash.replace('#', '').split(':')
      
      if (!pub || !priv || !id) {
        throw new Error('Missing card data')
      }

      const pubAddress = `0x${this.base64ToHex(pub)}` as Address
      if (!isAddress(pubAddress)) {
        throw new Error('Invalid public address')
      }

      const cardId = this.base64ToBase10(id)
      if (cardId < 0) {
        throw new Error('Invalid card ID')
      }

      return {
        pub: pubAddress,
        priv,
        id: cardId
      }
    } catch {
      return null
    }
  }

  normalizePrivateKey(key: string): string {
    // Nettoyer les espaces
    const cleaned = key.trim();
    // Ajouter 0x si nécessaire
    return cleaned.startsWith('0x') ? cleaned : `0x${cleaned}`;
  }

  // Formate un ID de carte
  formatCardId(id: number): string {
    if (id < 0) throw new Error('Invalid card ID')
    return id.toString().padStart(4, '0')
  }

  // Valide un PIN
  validatePin(pin: string): boolean {
    return /^\d{6}$/.test(pin)
  }

  // Utilitaire pour vérifier si une chaîne est une clé privée valide
  isValidPrivateKey(key: string): boolean {
    try {
      const normalizedKey = this.normalizePrivateKey(key);
      return /^0x[a-f0-9]{64}$/i.test(normalizedKey);
    } catch {
      return false;
    }
  }
}

// Export une instance singleton
export const cryptoService = new CryptoService()