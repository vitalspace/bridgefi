import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { apiServices } from '$lib/services/apiServices';

// const { createUser } = useApi();
const { createUser } = apiServices;

export const walletStore = writable({
	isConnected: false,
	address: ''
});

class WalletService {
	constructor() {
		this.checkConnection();
	}

	private updateWalletStore(updated: Partial<any>) {
		walletStore.update((state) => ({ ...state, ...updated }));
	}

	public async connectWallet() {
		try {
			const response = await connect();
			if (!response) return;

			const address = response.addresses.find((item) => item.symbol === 'STX')?.address;
			if (!address) return;

			this.updateWalletStore({ address, isConnected: true });
			await createUser({ address: address });
		} catch (err: any) {
			console.log(err);
		}
	}

	public async disconnectWallet() {
		try {
			disconnect();
			this.updateWalletStore({ address: '', isConnected: false });
		} catch (error: any) {
			console.log(error);
		}
	}

	public async checkConnection() {
		if (!browser) return;

		const data = getLocalStorage();

		if (!data) return;

		this.updateWalletStore({ address: data?.addresses.stx[0].address, isConnected: true });
		return isConnected();
	}
}

export const walletService = new WalletService();
