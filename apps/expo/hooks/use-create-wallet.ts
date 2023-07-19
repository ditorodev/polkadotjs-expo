import { Keyring } from '@polkadot/keyring';


export function useCreateWallet() {
  const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });
  const pair = keyring.addFromUri('//Alice');

  return pair;
}
