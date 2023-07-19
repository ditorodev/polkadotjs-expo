import { YStack, Text, Button, Spacer, XStack, H1, Input, ScrollView, Label } from "tamagui";
import Keyring from "@polkadot/keyring";
import { mnemonicValidate } from '@polkadot/util-crypto';
import { useCallback, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { useAccountsStorage } from "../hooks/use-account-storage";

export default function LoginScreen() {
  const [numberOfWords, setNumberOfWords] = useState<number>(12);
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [currentPhrase, setCurrentPhrase] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [step, setStep] = useState<number>(0);

  const mnemonicCompleted = mnemonic.length === numberOfWords;

  const { saveAccount } = useAccountsStorage();

  const storeAccount = useCallback(async () => {
    const _mnemonic = mnemonic.join(' ');
    const keyring = new Keyring({ type: 'sr25519' });
    const pair = keyring.addFromMnemonic(_mnemonic);
    const json = pair.toJson(password);

    saveAccount({
      name: name ? name : 'Account',
      json,
      withPassword: !!password,
    });
  }, []);

  const addPhrase = useCallback((phrase: string) => {
    console.log({ phrase })
    if (mnemonic.length < numberOfWords) {
      setMnemonic(state => [...state, phrase]);
      setCurrentPhrase('');
    }
  }, [mnemonic, numberOfWords]);

  const nextStep = useCallback(() => {
    if (step === 0 && mnemonicCompleted && mnemonicValidate(mnemonic.join(' '))) {
      setStep(1);
    }
  }, [mnemonicCompleted]);

  const verifyMnemonic = useCallback(() => {
    if (mnemonicValidate(mnemonic.join(' '))) {
      nextStep();
    } else {
      setMnemonic([]);
      console.log('Invalid Mnemonic, try again');
    }
  }, [mnemonic]);

  return (<ScrollView>
    <YStack>
      <H1>Log In</H1>
      <Spacer />
      <Text> Insert your mnemonic phrases </Text>
      <YStack>
        {(() => {
          switch (step) {
            case 0:
              return (<>
                <XStack flex={1}>
                  <Label> How many phrases do you have: </Label>
                  {/* TODO: this would be better as a select input*/}
                  <Input keyboardType="numeric" onChangeText={(v) => setNumberOfWords(Number(v))} value={String(numberOfWords)} />
                </XStack>
                {mnemonicCompleted ? <Button onPress={verifyMnemonic}> Verify Mnemonic </Button> : (<>
                  <XStack flex={1}>
                    <Label> Word {(mnemonic.length ?? 0) + 1} </Label>
                    <Input onChangeText={(v) => setCurrentPhrase(v)} value={currentPhrase} key={"Phrase_" + mnemonic.length} />
                  </XStack>
                  <Button onPress={() => addPhrase(currentPhrase)}> Next </Button>
                </>)}
              </>
              );
            case 1: (<>
              <XStack>
                <Label> Add an Alias </Label>
                <Input onChangeText={(v) => setName(v)} value={name} />
              </XStack>
              <XStack>
                <Label> Add a Password </Label>
                <Input onChangeText={(v) => setPassword(v)} value={password} keyboardType="visible-password" />
              </XStack>
            </>)
          }
        })()}
      </YStack>
      <Button onPress={storeAccount}> Load Account </Button>
    </YStack>
  </ScrollView >
  );
}
