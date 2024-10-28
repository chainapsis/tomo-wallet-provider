import { TomoCosmos, WalletProvider } from '../../WalletProvider'
import {
  AminoSignResponse,
  BroadcastMode,
  KeplrSignOptions,
  StdSignature,
  StdSignDoc
} from '@keplr-wallet/types'
import {
  OfflineAminoSigner,
  OfflineDirectSigner
} from '@keplr-wallet/types/src/cosmjs'
import { SigningStargateClient } from '@cosmjs/stargate'

const DEFAULT_RPC = 'https://cosmoshub.validator.network:443'

export class CosmosProvider extends WalletProvider {
  provider: TomoCosmos
  offlineSigner?: OfflineAminoSigner & OfflineDirectSigner
  clientPromise?: Promise<SigningStargateClient>
  constructor(chains: any[], provider: TomoCosmos) {
    super(chains)
    this.provider = provider
  }

  async connectWallet(): Promise<this> {
    const curChainId = await this.getNetwork()
    await this.provider.enable(curChainId)
    this.offlineSigner = this.provider.getOfflineSigner(curChainId)
    await this.getAddress()
    return this
  }

  /**
   * get @cosmjs/stargate SigningStargateClient
   */
  async getSigningStargateClient() {
    if (!this.clientPromise) {
      const rpcUrl =
        this.chains?.[0]?.rpcUrls?.default?.http?.[0] || DEFAULT_RPC
      this.clientPromise = SigningStargateClient.connectWithSigner(
        rpcUrl,
        this.offlineSigner
      )
    }
    return await this.clientPromise
  }

  async getBalance(searchDenom: string) {
    const signingStargateClient = await this.getSigningStargateClient()
    return BigInt(
      (
        await signingStargateClient.getBalance(
          await this.getAddress(),
          searchDenom
        )
      ).amount
    )
  }

  /**
   * Gets the bech32Address of the connected wallet.
   * @returns A promise that resolves to the address of the connected wallet.
   */
  async getAddress(): Promise<string> {
    const curChainId = await this.getNetwork()
    const key = await this.provider.getKey(curChainId)
    return key.bech32Address
  }

  /**
   * get the chainId of the connected wallet
   */
  async getNetwork(): Promise<string> {
    return this.chains?.[0]?.network
  }

  async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc,
    signOptions?: KeplrSignOptions
  ): Promise<AminoSignResponse> {
    const chainId = await this.getNetwork()
    if (chainId !== signDoc.chain_id) {
      throw new Error('Unmatched chain id with the offline signer')
    }

    const key = await this.provider.getKey(chainId)

    if (key.bech32Address !== signerAddress) {
      throw new Error('Unknown signer address')
    }

    return await this.provider.signAmino(
      chainId,
      signerAddress,
      signDoc,
      signOptions
    )
  }

  async signArbitrary(
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    const chainId = await this.getNetwork()
    return await this.provider.signArbitrary(chainId, signer, data)
  }

  async sendTx(tx: Uint8Array, mode: BroadcastMode): Promise<Uint8Array> {
    const chainId = await this.getNetwork()
    return this.provider.sendTx(chainId, tx, mode)
  }
}
