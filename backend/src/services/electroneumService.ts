// services/electroneumService.ts
import { ethers } from "ethers";

const ETN_RPC_URL = "https://rpc.ankr.com/electroneum_testnet";
const ETN_CHAIN_ID = 5201420;

const ERC20_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint)",
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

// Mapeo de tokens
export const ELECTRONEUM_TOKENS: Record<string, string> = {
  "ETN": "0x0000000000000000000000000000000000000000", // Native
  "sUSDC": "0x38334FE9b4e7D2A7e92372B446a9820E8eF3Df3d",
  "sUSDT": "0x09cF09d871b26984f052E7631EaCBA9df089E3dA",
  "sBNB": "0x9F1DA3Fe5C5C7bEd3793FCC71B4B9eB461251d30",
  "sETH": "0xA50B70C81F2CccDa119809274EB205c453A23fb5",
};

class ElectroneumService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  constructor(privateKey: string) {
    this.provider = new ethers.JsonRpcProvider(ETN_RPC_URL, {
      chainId: ETN_CHAIN_ID,
      name: "electroneum-testnet"
    });
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  async sendETN(to: string, amount: string): Promise<string> {
    try {
      const tx = await this.wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      console.log(`ETN transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`ETN transaction confirmed: ${tx.hash}`);

      return tx.hash;
    } catch (error) {
      console.error("Error sending ETN:", error);
      throw error;
    }
  }

  async sendToken(
    contractAddress: string,
    to: string,
    amount: string
  ): Promise<string> {
    try {
      const contract = new ethers.Contract(
        contractAddress,
        ERC20_ABI,
        this.wallet
      );

      const decimals = await contract.decimals();
      const tx = await contract.transfer(
        to,
        ethers.parseUnits(amount, decimals)
      );

      console.log(`Token transaction sent: ${tx.hash}`);
      await tx.wait();
      console.log(`Token transaction confirmed: ${tx.hash}`);

      return tx.hash;
    } catch (error) {
      console.error("Error sending token:", error);
      throw error;
    }
  }

  async executeSwap(
    destinationToken: string,
    destinationAddress: string,
    amount: string
  ): Promise<string> {
    if (!destinationToken || typeof destinationToken !== 'string') {
      throw new Error(`Invalid destinationToken: ${destinationToken}`);
    }

    if (!(destinationToken in ELECTRONEUM_TOKENS)) {
      throw new Error(`Token no soportado: ${destinationToken}`);
    }

    const contractAddress = ELECTRONEUM_TOKENS[destinationToken];

    // Si es ETN nativo
    if (destinationToken === "ETN") {
      return await this.sendETN(destinationAddress, amount);
    }

    // Si es un token ERC20
    return await this.sendToken(contractAddress, destinationAddress, amount);
  }

  getAddress(): string {
    return this.wallet.address;
  }
}

export const electroneumService = new ElectroneumService(
  process.env.ETN_PRIVATE_KEY || ""
);
