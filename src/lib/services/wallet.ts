/// file: src/lib/services/wallet.ts
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  type PublicClient,
  type WalletClient,
  type Hash,
  type Address
} from 'viem'
import { polygon } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { generatePrivateKey } from 'viem/accounts'
import { cryptoService } from './crypto.js'

export class WalletService {
  private publicClient: PublicClient
  private walletClient: WalletClient | null = null

  constructor() {
    this.publicClient = createPublicClient({
      chain: polygon,
      transport: http()
    })

    this.walletClient = createWalletClient({
      chain: polygon,
      transport: http()
    })
  }

  async importPrivateKey(privateKey: string, pin: string) {
    try {
      // S'assurer que la clé privée est au bon format
      if (!privateKey.startsWith('0x')) {
        privateKey = `0x${privateKey}`;
      }

      const formattedKey = privateKey as `0x${string}`;
      
      // Vérifier que la clé est valide en créant un compte
      const account = privateKeyToAccount(formattedKey);
      
      // Chiffrer la clé privée
      const encryptedKey = cryptoService.encryptPrivateKey(formattedKey, pin);

      // Vérifier le solde (optionnel, pour valider que le compte existe)
      const balance = await this.getBalance(account.address);

      return {
        address: account.address,
        encryptedKey,
        balance
      };
      
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to import private key: ${error.message}`);
      }
      throw new Error('Failed to import private key');
    }
  }

  async createAccount(pin: string) {
    // Générer une clé privée en utilisant viem directement
    const privateKey = generatePrivateKey()
    const account = privateKeyToAccount(privateKey)
    
    const encryptedKey = cryptoService.encryptPrivateKey(privateKey, pin)

    return {
      address: account.address,
      encryptedKey
    }
  }

  async getBalance(address: Address): Promise<string> {
    const balance = await this.publicClient.getBalance({ 
      address
    })
    return formatEther(balance)
  }

  async sendTransaction(
    encryptedKey: string,
    pin: string, 
    to: Address,
    amount: string
  ): Promise<Hash> {
    if (!this.walletClient) throw new Error('Wallet client not initialized')

    const privateKey = cryptoService.decryptPrivateKey(encryptedKey, pin) as `0x${string}`
    const account = privateKeyToAccount(privateKey)
    
    const value = parseEther(amount)
    
    const hash = await this.walletClient.sendTransaction({
      account,
      to,
      value,
      chain: polygon
    })
    
    return hash
  }

  async getTransactionReceipt(hash: Hash) {
    return this.publicClient.getTransactionReceipt({
      hash
    })
  }
}

export const walletService = new WalletService()