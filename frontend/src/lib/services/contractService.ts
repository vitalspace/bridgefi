import {
	fetchCallReadOnlyFunction,
	uintCV,
	stringUtf8CV,
	stringAsciiCV,
	principalCV,
	cvToValue,
	makeContractCall,
	bufferCV
} from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';
import { openContractCall } from '@stacks/connect';
import { walletStore } from './walletService';
import { AnchorMode, PostConditionMode } from '@stacks/transactions';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CONTRACT_NAME = import.meta.env.VITE_SWAP_CONTRACT_NAME;
const API_BASE_URL = import.meta.env.VITE_STACKS_API_URL;

// Types for contract interactions
export interface SwapOrderData {
	orderId: number;
	user: string;
	stxAmount: number;
	destinationChain: string;
	destinationAddress: string;
	destinationToken: string;
	expectedAmount: number;
	status: string;
	createdAt: number;
	completedAt?: number;
	externalTxHash?: string;
}

export interface UserStats {
	totalSwaps: number;
	totalVolume: number;
}

// Read-only functions
export const getOrder = async (orderId: number): Promise<SwapOrderData | null> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'get-order',
			functionArgs: [uintCV(orderId)],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET,
		});

		const order = cvToValue(result);
		if (!order) return null;

		return {
			orderId: order.value['order-id'].value,
			user: order.value.user.value,
			stxAmount: order.value['stx-amount'].value,
			destinationChain: order.value['destination-chain'].value,
			destinationAddress: order.value['destination-address'].value,
			destinationToken: order.value['destination-token'].value,
			expectedAmount: order.value['expected-amount'].value,
			status: order.value.status.value,
			createdAt: order.value['created-at'].value,
			completedAt: order.value['completed-at']?.value,
			externalTxHash: order.value['external-tx-hash']?.value,
		};
	} catch (error) {
		console.error('Error getting order:', error);
		throw error;
	}
};

export const getOrderCount = async (): Promise<number> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'get-order-count',
			functionArgs: [],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET,
		});

		return cvToValue(result).value;
	} catch (error) {
		console.error('Error getting order count:', error);
		throw error;
	}
};

export const getBackendOperator = async (): Promise<string> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'get-backend-operator',
			functionArgs: [],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET,
		});

		return cvToValue(result).value;
	} catch (error) {
		console.error('Error getting backend operator:', error);
		throw error;
	}
};

export const isContractPaused = async (): Promise<boolean> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'is-contract-paused',
			functionArgs: [],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET,
		});

		return cvToValue(result).value;
	} catch (error) {
		console.error('Error checking if contract is paused:', error);
		throw error;
	}
};

export const getUserStats = async (userAddress: string): Promise<UserStats> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'get-user-stats',
			functionArgs: [principalCV(userAddress)],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET,
		});

		const stats = cvToValue(result);
		return {
			totalSwaps: stats.value['total-swaps'].value,
			totalVolume: stats.value['total-volume'].value,
		};
	} catch (error) {
		console.error('Error getting user stats:', error);
		throw error;
	}
};

export const canClaimRefund = async (orderId: number): Promise<boolean> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'can-claim-refund',
			functionArgs: [uintCV(orderId)],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET,
		});

		return cvToValue(result).value;
	} catch (error) {
		console.error('Error checking refund eligibility:', error);
		throw error;
	}
};

export const isChainSupported = async (chain: string): Promise<boolean> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'is-chain-supported',
			functionArgs: [stringAsciiCV(chain)],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET,
		});

		return cvToValue(result).value;
	} catch (error) {
		console.error('Error checking chain support:', error);
		throw error;
	}
};

export const isTokenSupported = async (token: string): Promise<boolean> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'is-token-supported',
			functionArgs: [stringAsciiCV(token)],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET,
		});

		return cvToValue(result).value;
	} catch (error) {
		console.error('Error checking token support:', error);
		throw error;
	}
};

// Public functions (require transactions)
export const createSwapOrder = async (
	stxAmount: number,
	destinationChain: string,
	destinationAddress: string,
	destinationToken: string,
	expectedAmount: number
): Promise<string> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'create-swap-order',
			functionArgs: [
				uintCV(stxAmount),
				stringAsciiCV(destinationChain),
				stringAsciiCV(destinationAddress),
				stringAsciiCV(destinationToken),
				uintCV(expectedAmount),
			],
			postConditionMode: PostConditionMode.Allow,
			onFinish: (data) => {
				console.log('Transaction finished:', data);
				resolve(data.txId);
			},
			onCancel: () => {
				reject(new Error('Transaction cancelled'));
			},
		});
	});
};

export const confirmSwapSent = async (
	orderId: number,
	externalTxHash: string
): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'confirm-swap-sent',
			functionArgs: [
				uintCV(orderId),
				stringAsciiCV(externalTxHash),
			],
			postConditionMode: PostConditionMode.Deny,
			onFinish: (data) => {
				console.log('Transaction finished:', data);
				resolve(true);
			},
			onCancel: () => {
				reject(new Error('Transaction cancelled'));
			},
		});
	});
};

export const claimRefund = async (orderId: number): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'claim-refund',
			functionArgs: [uintCV(orderId)],
			postConditionMode: PostConditionMode.Deny,
			onFinish: (data) => {
				console.log('Transaction finished:', data);
				resolve(true);
			},
			onCancel: () => {
				reject(new Error('Transaction cancelled'));
			},
		});
	});
};

// Admin functions
export const cancelOrderAdmin = async (orderId: number): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'cancel-order-admin',
			functionArgs: [uintCV(orderId)],
			postConditionMode: PostConditionMode.Deny,
			onFinish: (data) => {
				console.log('Transaction finished:', data);
				resolve(true);
			},
			onCancel: () => {
				reject(new Error('Transaction cancelled'));
			},
		});
	});
};

export const setBackendOperator = async (newOperator: string): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'set-backend-operator',
			functionArgs: [principalCV(newOperator)],
			postConditionMode: PostConditionMode.Deny,
			onFinish: (data) => {
				console.log('Transaction finished:', data);
				resolve(true);
			},
			onCancel: () => {
				reject(new Error('Transaction cancelled'));
			},
		});
	});
};

export const pauseContract = async (paused: boolean): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'pause-contract',
			functionArgs: [], // Boolean parameter needs to be handled differently in Clarity
			postConditionMode: PostConditionMode.Deny,
			onFinish: (data) => {
				console.log('Transaction finished:', data);
				resolve(true);
			},
			onCancel: () => {
				reject(new Error('Transaction cancelled'));
			},
		});
	});
};

export const emergencyWithdraw = async (amount: number): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'emergency-withdraw',
			functionArgs: [uintCV(amount)],
			postConditionMode: PostConditionMode.Deny,
			onFinish: (data) => {
				console.log('Transaction finished:', data);
				resolve(true);
			},
			onCancel: () => {
				reject(new Error('Transaction cancelled'));
			},
		});
	});
};

// Chain management functions
export const enableBSC = async (): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'enable-bsc',
			functionArgs: [],
			postConditionMode: PostConditionMode.Deny,
			onFinish: (data) => {
				console.log('Transaction finished:', data);
				resolve(true);
			},
			onCancel: () => {
				reject(new Error('Transaction cancelled'));
			},
		});
	});
};

export const disableBSC = async (): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'disable-bsc',
			functionArgs: [],
			postConditionMode: PostConditionMode.Deny,
			onFinish: (data) => {
				console.log('Transaction finished:', data);
				resolve(true);
			},
			onCancel: () => {
				reject(new Error('Transaction cancelled'));
			},
		});
	});
};

// Similar functions for other chains (ETH, MATIC, AVAX, ARB) and tokens (USDC, USDT) can be added following the same pattern
