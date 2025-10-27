import { walletService, walletStore } from '$lib/services/walletService';
import { derived, type Readable } from 'svelte/store';

export const useWallet = () => {
	const connectWallet = async () => await walletService.connectWallet();
	const disconnectWallet = async () => await walletService.disconnectWallet();
	const checkConnection = async () => await walletService.checkConnection();

	const isConnected: Readable<boolean> = derived(
		walletStore,
		($walletStore) => $walletStore.isConnected
	);
	const address: Readable<string> = derived(walletStore, (walletStore) => walletStore.address);

	return {
		walletStore,
		address,
		checkConnection,
		connectWallet,
		disconnectWallet,
		isConnected
	};
};
