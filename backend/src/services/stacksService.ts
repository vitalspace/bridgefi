import { STACKS_TESTNET } from "@stacks/network";
import {
  broadcastTransaction,
  cvToJSON,
  cvToValue,
  fetchCallReadOnlyFunction,
  hexToCV,
  uintCV,
} from "@stacks/transactions";

const CONTRACT_ADDRESS = "ST23JSMGR5933QJ329PKPNNQJV6QG8Z9D33QBYDNX";
const CONTRACT_NAME = "escrow-swap-v2";
const API_EXPLORER = "https://api.testnet.hiro.so/extended/v1/tx";

export class StacksService {
  private network = STACKS_TESTNET;

  async getTransactionInfo(txId: string): Promise<any> {
    try {
      const response = await fetch(`${API_EXPLORER}/${txId}`);

      if (!response.ok) return { status: false };

      const txData = await response.json();

      const dataSwap = {
        txId: txId,
        status: txData.tx_status === "success",
        block: txData.block_height,
        sender: txData.sender_address,
        stxTransferido: null as any,
        orderId: null,
        destinationChain: null,
        destinationAddress: null,
        destinationToken: null,
        expectedAmount: null,
        stxAmountFromLog: null as any,
      };

      if (txData.events && Array.isArray(txData.events)) {
        txData.events.forEach((event: any) => {
          // Capturar el monto STX transferido
          if (
            event.event_type === "stx_asset" &&
            event.asset.asset_event_type === "transfer"
          ) {
            dataSwap.stxTransferido = {
              microSTX: event.asset.amount,
              stx: parseFloat(event.asset.amount) / 1000000,
              sender: event.asset.sender,
              recipient: event.asset.recipient,
            };
          }

          // Capturar datos del Print event
          if (event.event_type === "smart_contract_log") {
            try {
              const clarityValue = hexToCV(event.contract_log.value.hex);
              const valorJSON = cvToJSON(clarityValue);

              if (valorJSON.value) {
                const swapData = valorJSON.value;

                dataSwap.orderId = swapData["order-id"]?.value || null;
                dataSwap.destinationChain =
                  swapData["destination-chain"]?.value || null;
                dataSwap.destinationAddress =
                  swapData["destination-address"]?.value || null;
                dataSwap.destinationToken =
                  swapData["destination-token"]?.value || null;
                dataSwap.expectedAmount =
                  swapData["expected-amount"]?.value || null;

                if (swapData["stx-amount"]?.value) {
                  dataSwap.stxAmountFromLog = {
                    microSTX: swapData["stx-amount"].value,
                    stx: parseFloat(swapData["stx-amount"].value) / 1000000,
                  };
                }
              }
            } catch (e: any) {
              console.warn("⚠️  No se pudo parsear contract log:", e.message);
            }
          }
        });
      }

      return dataSwap;
    } catch (error) {
      return { susess: false, error };
    }
  }

  async listenForSwapOrderEvents() {
    // In a real implementation, you would set up WebSocket connection to Stacks API
    // For now, this is a placeholder
    console.log("Listening for swap order events...");

    // Mock event listener - in production, use WebSocket or polling
    setInterval(async () => {
      try {
        // Check for new orders or status changes
        const orderCount = await this.getOrderCount();
        console.log(`Current order count: ${orderCount}`);
      } catch (error) {
        console.error("Error checking orders:", error);
      }
    }, 30000); // Check every 30 seconds
  }

  async getOrderCount(): Promise<number> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-order-count",
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
        network: this.network,
      });

      return cvToValue(result).value;
    } catch (error) {
      console.error("Error getting order count:", error);
      throw error;
    }
  }

  async getOrder(orderId: number) {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-order",
        functionArgs: [uintCV(orderId)],
        senderAddress: CONTRACT_ADDRESS, // Required sender address
        network: this.network,
      });

      const orderData = cvToValue(result);
      console.log(`Raw order data for ID ${orderId}:`, orderData);
      return orderData;
    } catch (error) {
      console.error(`Error getting order ${orderId}:`, error);
      throw error;
    }
  }

  async getTransactionStatus(txId: string): Promise<any> {
    try {
      const response = await fetch(`${API_EXPLORER}/${txId}`);

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const txData = await response.json();

      const dataSwap = {
        txId: txId,
        status: txData.tx_status === "success",
        block: txData.block_height,
        sender: txData.sender_address,
        stxTransferido: null as any,
        orderId: null,
        destinationChain: null,
        destinationAddress: null,
        destinationToken: null,
        expectedAmount: null,
        stxAmountFromLog: null as any,
      };

      if (txData.events && Array.isArray(txData.events)) {
        txData.events.forEach((event: any) => {
          // Capturar el monto STX transferido
          if (
            event.event_type === "stx_asset" &&
            event.asset.asset_event_type === "transfer"
          ) {
            dataSwap.stxTransferido = {
              microSTX: event.asset.amount,
              stx: parseFloat(event.asset.amount) / 1000000,
              sender: event.asset.sender,
              recipient: event.asset.recipient,
            };
          }

          // Capturar datos del Print event
          if (event.event_type === "smart_contract_log") {
            try {
              const clarityValue = hexToCV(event.contract_log.value.hex);
              const valorJSON = cvToJSON(clarityValue);

              if (valorJSON.value) {
                const swapData = valorJSON.value;

                dataSwap.orderId = swapData["order-id"]?.value || null;
                dataSwap.destinationChain =
                  swapData["destination-chain"]?.value || null;
                dataSwap.destinationAddress =
                  swapData["destination-address"]?.value || null;
                dataSwap.destinationToken =
                  swapData["destination-token"]?.value || null;
                dataSwap.expectedAmount =
                  swapData["expected-amount"]?.value || null;

                if (swapData["stx-amount"]?.value) {
                  dataSwap.stxAmountFromLog = {
                    microSTX: swapData["stx-amount"].value,
                    stx: parseFloat(swapData["stx-amount"].value) / 1000000,
                  };
                }
              }
            } catch (e: any) {
              console.warn("⚠️  No se pudo parsear contract log:", e.message);
            }
          }
        });
      }

      return dataSwap;
    } catch (error) {
      console.error(`Error checking transaction ${txId}:`, error);
      return { success: false, error };
    }
  }

  async broadcastAndWaitForConfirmation(
    transaction: any
  ): Promise<{ txId: string; orderData?: any }> {
    try {
      console.log("Broadcasting transaction...");
      const broadcastResponse = await broadcastTransaction(transaction);
      const txId = broadcastResponse.txid;

      console.log(`Transaction broadcasted with txId: ${txId}`);

      // Wait for confirmation with retries
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts = ~2.5 minutes

      while (attempts < maxAttempts) {
        try {
          const status = await this.getTransactionStatus(txId);

          if (status.success && status.orderData) {
            console.log(
              "Transaction confirmed with order data:",
              status.orderData
            );
            return { txId, orderData: status.orderData };
          } else if (status.txData?.tx_status === "success") {
            console.log("Transaction confirmed but no order data found");
            return { txId };
          }

          console.log(
            `Waiting for confirmation... attempt ${attempts + 1}/${maxAttempts}`
          );
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
          attempts++;
        } catch (error) {
          console.error(
            `Error checking status (attempt ${attempts + 1}):`,
            error
          );
          attempts++;
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }

      throw new Error("Transaction confirmation timeout");
    } catch (error) {
      console.error("Error broadcasting transaction:", error);
      throw error;
    }
  }
}

export const stacksService = new StacksService();
