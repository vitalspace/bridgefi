import { STACKS_TESTNET } from "@stacks/network";
import {
  fetchCallReadOnlyFunction,
  contractPrincipalCV,
  cvToValue,
  makeContractCall,
  uintCV,
  PostConditionMode,
  FungibleConditionCode,
  StxPostCondition,
  standardPrincipalCV,
} from "@stacks/transactions";
import { stacksService } from "./stacksService.js";

const CONTRACT_ADDRESS = "ST23JSMGR5933QJ329PKPNNQJV6QG8Z9D33QBYDNX"; // Update with actual deployed address
const CONTRACT_NAME = "lending-system";

export class LendingService {
  private network = STACKS_TESTNET;

  // Update user score in the lending contract
  async updateUserScore(userAddress: string, score: number): Promise<any> {
    try {
      const functionArgs = [
        contractPrincipalCV(userAddress.split('.')[0], userAddress.split('.')[1] || userAddress),
        uintCV(score)
      ];

      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'update-user-score',
        functionArgs,
        senderKey: process.env.STACKS_PRIVATE_KEY!, // Contract owner private key
        network: this.network,
        postConditionMode: PostConditionMode.Allow,
      };

      const transaction = await makeContractCall(txOptions);
      const result = await stacksService.broadcastAndWaitForConfirmation(transaction);

      return {
        success: true,
        txId: result.txId,
        score: score
      };
    } catch (error) {
      console.error('Error updating user score:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Request a loan
  async requestLoan(userAddress: string, termMonths: number, collateralAmount: number): Promise<any> {
    try {
      const functionArgs = [
        uintCV(termMonths)
      ];

      // For now, remove post conditions to avoid Stacks API issues
      // Post conditions will be handled by the contract validation
      const postConditions = [];

      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'request-loan',
        functionArgs,
        senderKey: process.env.STACKS_PRIVATE_KEY!, // User's private key (from wallet)
        network: this.network,
        postConditionMode: PostConditionMode.Deny,
        postConditions,
      };

      const transaction = await makeContractCall(txOptions);
      const result = await stacksService.broadcastAndWaitForConfirmation(transaction);

      return {
        success: true,
        txId: result.txId,
        loanDetails: result.orderData
      };
    } catch (error) {
      console.error('Error requesting loan:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Make a loan payment
  async makePayment(userAddress: string, paymentAmount: number): Promise<any> {
    try {
      const functionArgs = [];

      // For now, remove post conditions to avoid Stacks API issues
      // Post conditions will be handled by the contract validation
      const postConditions = [];

      const txOptions = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'make-payment',
        functionArgs,
        senderKey: process.env.STACKS_PRIVATE_KEY!, // User's private key
        network: this.network,
        postConditionMode: PostConditionMode.Deny,
        postConditions,
      };

      const transaction = await makeContractCall(txOptions);
      const result = await stacksService.broadcastAndWaitForConfirmation(transaction);

      return {
        success: true,
        txId: result.txId,
        paymentResult: result.orderData
      };
    } catch (error) {
      console.error('Error making payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get loan information
  async getLoanInfo(userAddress: string): Promise<any> {
    try {
      const functionArgs = [
        contractPrincipalCV(userAddress.split('.')[0], userAddress.split('.')[1] || userAddress)
      ];

      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-loan-info',
        functionArgs,
        senderAddress: CONTRACT_ADDRESS,
        network: this.network,
      });

      const loanData = cvToValue(result);
      return {
        success: true,
        loanInfo: loanData.value ? loanData.value : null
      };
    } catch (error) {
      console.error('Error getting loan info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get user score from contract
  async getUserScore(userAddress: string): Promise<any> {
    try {
      const functionArgs = [
        contractPrincipalCV(userAddress.split('.')[0], userAddress.split('.')[1] || userAddress)
      ];

      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-user-score',
        functionArgs,
        senderAddress: CONTRACT_ADDRESS,
        network: this.network,
      });

      const scoreData = cvToValue(result);
      return {
        success: true,
        scoreInfo: scoreData.value ? scoreData.value : null
      };
    } catch (error) {
      console.error('Error getting user score:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get next payment due
  async getNextPaymentDue(userAddress: string): Promise<any> {
    try {
      const functionArgs = [
        contractPrincipalCV(userAddress.split('.')[0], userAddress.split('.')[1] || userAddress)
      ];

      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-next-payment-due',
        functionArgs,
        senderAddress: CONTRACT_ADDRESS,
        network: this.network,
      });

      const paymentData = cvToValue(result);
      return {
        success: true,
        paymentInfo: paymentData.value ? paymentData.value : null
      };
    } catch (error) {
      console.error('Error getting next payment due:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get loan amount for a score level
  async getLoanAmountForScore(scoreLevel: string): Promise<any> {
    try {
      const functionArgs = [];

      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-loan-amount-for-score',
        functionArgs: [uintCV(scoreLevel === 'high' ? 700 : scoreLevel === 'medium' ? 500 : 300)],
        senderAddress: CONTRACT_ADDRESS,
        network: this.network,
      });

      const amountData = cvToValue(result);
      return {
        success: true,
        amount: amountData.value
      };
    } catch (error) {
      console.error('Error getting loan amount:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const lendingService = new LendingService();