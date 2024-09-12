import { initEccLib } from 'bitcoinjs-lib'
import * as tinysecp from 'tiny-secp256k1'

let isInit = false
export function initBTCEccLib() {
  if (isInit) {
    return
  }
  isInit = true
  initEccLib(tinysecp)
}
