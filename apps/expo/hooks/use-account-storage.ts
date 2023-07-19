import { KeyringPair$Json } from "@polkadot/keyring/types";
import { useCallback } from "react";
import * as SecureStorage from "expo-secure-store";

interface Account {
  name: string,
  json: KeyringPair$Json,
  withPassword: boolean,
}

const ACCOUNT_STORAGE_KEY = "accounts";

export function useAccountsStorage() {
  const getAccounts = useCallback(async () => {
    const accounts = await SecureStorage.getItemAsync(ACCOUNT_STORAGE_KEY);
    if (accounts) {
      return JSON.parse(accounts) as Array<Account>;
    }
    return [];
  }, []);

  const setAccounts = useCallback(async (accounts: Account[]) => {
    await SecureStorage.setItemAsync(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
  }, []);

  const saveAccount = useCallback(async (account: Account) => {
    const accounts = await getAccounts();
    accounts.push(account);
    await setAccounts(accounts);
  }, []);

  const removeAccount = useCallback(async (account: Account) => {
    const accounts = await getAccounts();
    const index = accounts.findIndex((acc) => acc.name === account.name);
    if (index !== -1) {
      accounts.splice(index, 1);
      await setAccounts(accounts);
    }
    return accounts;
  }, []);

  const getAccount = useCallback(async (name: string) => {
    const accounts = await getAccounts();
    const account = accounts.find((acc) => acc.name === name);
    return account;
  }, []);

  return {
    getAccounts,
    setAccounts,
    saveAccount,
    getAccount,
    removeAccount,
  };
}
