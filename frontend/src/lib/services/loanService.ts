import { openContractCall } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';
import {
	AnchorMode,
	cvToValue,
	fetchCallReadOnlyFunction,
	PostConditionMode,
	principalCV,
	stringAsciiCV,
	uintCV
} from '@stacks/transactions';

// Contract deployed at: ST23JSMGR5933QJ329PKPNNQJV6QG8Z9D33QBYDNX
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CONTRACT_NAME = import.meta.env.VITE_LENDING_CONTRACT_NAME;
const API_BASE_URL = import.meta.env.VITE_STACKS_API_URL;

// Types for loan interactions
export interface LoanInfo {
	amount: number;
	collateral: number;
	fee: number;
	totalDebt: number;
	monthlyPayment: number;
	paymentsMade: number;
	totalPayments: number;
	lastPaymentBlock: number;
	startBlock: number;
	scoreLevel: string;
	isActive: boolean;
	isDefaulted: boolean;
	loanWithdrawn: boolean;
}

export interface UserScore {
	score: number;
	scoreLevel: string;
	lastUpdated: number;
}

export interface PaymentDue {
	amount: number;
	dueBlock: number;
	graceUntil: number;
	isOverdue: boolean;
}

export interface LoanRequestResult {
	loanAmount: number;
	collateral: number;
	monthlyPayment: number;
	totalPayments: number;
}

export interface PaymentResult {
	completed: boolean;
	remaining: number;
}

// Read-only functions
export const getLoanInfo = async (userAddress: string): Promise<LoanInfo | null> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'get-loan-info',
			functionArgs: [principalCV(userAddress)],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET
		});

		const loanData = cvToValue(result);
		if (!loanData || !loanData.value) return null;

		const loan = loanData.value;
		return {
			amount: loan.amount?.value || 0,
			collateral: loan.collateral?.value || 0,
			fee: loan.fee?.value || 0,
			totalDebt: loan['total-debt']?.value || 0,
			monthlyPayment: loan['monthly-payment']?.value || 0,
			paymentsMade: loan['payments-made']?.value || 0,
			totalPayments: loan['total-payments']?.value || 0,
			lastPaymentBlock: loan['last-payment-block']?.value || 0,
			startBlock: loan['start-block']?.value || 0,
			scoreLevel: loan['score-level']?.value || '',
			isActive: loan['is-active']?.value || false,
			isDefaulted: loan['is-defaulted']?.value || false,
			loanWithdrawn: loan['loan-withdrawn']?.value || false
		};
	} catch (error) {
		console.error('Error getting loan info:', error);
		return null;
	}
};

export const getUserScore = async (userAddress: string): Promise<UserScore | null> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'get-user-score',
			functionArgs: [principalCV(userAddress)],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET
		});

		const scoreData = cvToValue(result);
		if (!scoreData || !scoreData.value) return null;

		const score = scoreData.value;
		return {
			score: score.score?.value || 0,
			scoreLevel: score['score-level']?.value || '',
			lastUpdated: score['last-updated']?.value || 0
		};
	} catch (error) {
		console.error('Error getting user score:', error);
		return null;
	}
};

export const getNextPaymentDue = async (userAddress: string): Promise<PaymentDue | null> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'get-next-payment-due',
			functionArgs: [principalCV(userAddress)],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET
		});

		const paymentData = cvToValue(result);
		if (!paymentData || !paymentData.value) return null;

		const payment = paymentData.value;
		return {
			amount: payment.amount?.value || 0,
			dueBlock: payment['due-block']?.value || 0,
			graceUntil: payment['grace-until']?.value || 0,
			isOverdue: payment['is-overdue']?.value || false
		};
	} catch (error) {
		console.error('Error getting next payment due:', error);
		return null;
	}
};

export const getLoanAmountForScore = async (scoreLevel: string): Promise<number> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'get-loan-amount-for-score',
			functionArgs: [stringAsciiCV(scoreLevel)],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET
		});

		return cvToValue(result).value;
	} catch (error) {
		console.error('Error getting loan amount for score:', error);
		throw error;
	}
};

export const getContractStats = async (): Promise<{ totalLoans: number; totalFees: number }> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'get-contract-stats',
			functionArgs: [],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET
		});

		const stats = cvToValue(result);
		console.log('Contract stats result:', stats);
		return {
			totalLoans: stats.value?.['total-loans']?.value || 0,
			totalFees: stats.value?.['total-fees']?.value || 0
		};
	} catch (error) {
		console.error('Error getting contract stats:', error);
		return { totalLoans: 0, totalFees: 0 };
	}
};

// Public functions (require transactions)
export const updateUserScore = async (userAddress: string, score: number): Promise<string> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'update-user-score',
			functionArgs: [principalCV(userAddress), uintCV(score)],
			postConditionMode: PostConditionMode.Allow,
			onFinish: (data) => {
				console.log('Score update transaction finished:', data);
				resolve(data.txId);
			},
			onCancel: () => {
				reject(new Error('Score update transaction cancelled'));
			}
		});
	});
};

// FIXED: requestLoan NOW accepts requestedAmount parameter
export const requestLoan = async (
	userScore: number,
	requestedAmount: number,
	termMonths: number
): Promise<string> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'request-loan',
			functionArgs: [
				uintCV(userScore),
				uintCV(requestedAmount), // ← NUEVO PARÁMETRO
				uintCV(termMonths)
			],
			postConditionMode: PostConditionMode.Allow,
			onFinish: (data) => {
				console.log('Loan request transaction finished:', data);
				resolve(data.txId);
			},
			onCancel: () => {
				reject(new Error('Loan request transaction cancelled'));
			}
		});
	});
};

// Withdraw loan (user calls after request-loan)
export const withdrawLoan = async (): Promise<string> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'withdraw-loan',
			functionArgs: [],
			postConditionMode: PostConditionMode.Allow,
			onFinish: (data) => {
				console.log('Loan withdrawal transaction finished:', data);
				resolve(data.txId);
			},
			onCancel: () => {
				reject(new Error('Loan withdrawal transaction cancelled'));
			}
		});
	});
};

export const makePayment = async (): Promise<string> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'make-payment',
			functionArgs: [],
			postConditionMode: PostConditionMode.Allow,
			onFinish: (data) => {
				console.log('Payment transaction finished:', data);
				resolve(data.txId);
			},
			onCancel: () => {
				reject(new Error('Payment transaction cancelled'));
			}
		});
	});
};

export const markAsDefaulted = async (userAddress: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'mark-as-defaulted',
			functionArgs: [principalCV(userAddress)],
			postConditionMode: PostConditionMode.Allow,
			onFinish: (data) => {
				console.log('Mark as defaulted transaction finished:', data);
				resolve(data.txId);
			},
			onCancel: () => {
				reject(new Error('Mark as defaulted transaction cancelled'));
			}
		});
	});
};

export const withdrawFees = async (amount: number): Promise<string> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'withdraw-fees',
			functionArgs: [uintCV(amount)],
			postConditionMode: PostConditionMode.Allow,
			onFinish: (data) => {
				console.log('Fee withdrawal transaction finished:', data);
				resolve(data.txId);
			},
			onCancel: () => {
				reject(new Error('Fee withdrawal transaction cancelled'));
			}
		});
	});
};

export const withdrawLiquidity = async (amount: number): Promise<string> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'withdraw-liquidity',
			functionArgs: [uintCV(amount)],
			postConditionMode: PostConditionMode.Allow,
			onFinish: (data) => {
				console.log('Liquidity withdrawal transaction finished:', data);
				resolve(data.txId);
			},
			onCancel: () => {
				reject(new Error('Liquidity withdrawal transaction cancelled'));
			}
		});
	});
};

export const addLiquidity = async (amount: number): Promise<string> => {
	return new Promise((resolve, reject) => {
		openContractCall({
			network: STACKS_TESTNET,
			anchorMode: AnchorMode.Any,
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'add-liquidity',
			functionArgs: [uintCV(amount)],
			postConditionMode: PostConditionMode.Allow,
			onFinish: (data) => {
				console.log('Add liquidity transaction finished:', data);
				resolve(data.txId);
			},
			onCancel: () => {
				reject(new Error('Add liquidity transaction cancelled'));
			}
		});
	});
};

export const getAvailableLiquidity = async (): Promise<number> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'get-available-liquidity',
			functionArgs: [],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET
		});

		const value = cvToValue(result);
		console.log('Available liquidity result:', value);

		// Handle different response formats
		if (typeof value === 'bigint') {
			return Number(value);
		} else if (typeof value === 'number') {
			return value;
		} else if (value && typeof value === 'object' && 'value' in value) {
			return Number(value.value) || 0;
		}

		return 0;
	} catch (error) {
		console.error('Error getting available liquidity:', error);
		return 0;
	}
};

export const getContractBalance = async (): Promise<number> => {
	try {
		const result = await fetchCallReadOnlyFunction({
			contractAddress: CONTRACT_ADDRESS,
			contractName: CONTRACT_NAME,
			functionName: 'get-contract-balance',
			functionArgs: [],
			senderAddress: CONTRACT_ADDRESS,
			network: STACKS_TESTNET
		});

		const value = cvToValue(result);
		console.log('Contract balance result (raw):', result);
		console.log('Contract balance result (converted):', value);

		// Clarity devuelve uint directamente
		return typeof value === 'bigint' ? Number(value) : typeof value === 'number' ? value : 0;
	} catch (error) {
		console.error('Error getting contract balance:', error);
		return 0;
	}
};
