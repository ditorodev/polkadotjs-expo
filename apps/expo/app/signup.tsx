import { YStack, Text, Button, Spacer, XStack, H1, SizableText, Input, ScrollView } from "tamagui";
import Keyring from "@polkadot/keyring";
import { mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto';
import { useCallback, useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { KeyringPair } from "@polkadot/keyring/types";

interface Account {
  mnemonic: string;
  pair: KeyringPair;
  name?: string;
}

export default function SignupScreen() {
  const [currentAccount, setCurrentAccount] = useState<Account>(null);
  const createAccount = useCallback(() => {
    const keyring = new Keyring({ type: "sr25519" });

    // This should be saved on device secure storage once the user has created an account
    // The mnemonic is a space " " separated list of 24 words, save it as such in the secure storage
    const mnemonic = mnemonicGenerate(24); // The bigger the number the more secure the mnemonic is

    // This is how you load the account from the mnemonic
    const pair = keyring.addFromMnemonic(mnemonic);

    // This just represents the account in the UI
    setCurrentAccount({
      mnemonic,
      pair,
    });

  }, []);
  const saveAccount = useCallback(async () => {
    try {
      const safeStorageAccounts = await SecureStore.getItemAsync('accounts');
      const currentAccounts: Array<Record<string, string>> = safeStorageAccounts ? JSON.parse(safeStorageAccounts) : [];
      console.log("Current accounts", { currentAccounts })
      currentAccounts.push({
        name: currentAccount.name as string,
        mnemonic: currentAccount.mnemonic,
      });
      await SecureStore.setItemAsync(`accounts`, JSON.stringify(currentAccounts));
    } catch (e) {
      console.log("Error saving account", e)
    }
  }, [currentAccount]);

  useEffect(() => {
    async function run() {
      const accounts = await SecureStore.getItemAsync('accounts');
      console.log("Current save accounts ", { accounts: accounts && JSON.parse(accounts) })
    }
    run()
  }, [])

  return (<ScrollView>
    <YStack>
      <Spacer />
      <Button onPress={createAccount}>Create Account</Button>
      <Spacer />
      {currentAccount ? (<>
        <YStack space>
          <H1>Your mnemonic</H1>
          <XStack flexWrap="wrap" spaceDirection="both">
            {currentAccount?.mnemonic.split(' ').map((word, index) => (
              <Button disabled m="$2">
                <Text>
                  {word}
                </Text>
              </Button>
            ))}
          </XStack>
          <H1> Address </H1>
          <SizableText> {currentAccount?.pair.address} </SizableText>
        </YStack>
        <H1> Your account name </H1>
        <Input placeholder="Account name" value={currentAccount.name} onChangeText={e => setCurrentAccount(s => ({ ...s, name: e }))} />
        <Button onPress={saveAccount}>
          <Text> Save account </Text>
        </Button>
      </>) : null}
    </YStack>
  </ScrollView>
  );
}
