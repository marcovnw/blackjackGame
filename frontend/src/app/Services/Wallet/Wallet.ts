import { ethers } from "ethers";
// Modify to match your contract

import  lock from "../../../artifacts/contracts/Lock.sol/Lock.json";


export enum WalletConnectionStatus {
    waiting, success, missingWallet, declined
   }
export class WalletConnection {
    static waiting<T>(waiting: any): [any, any] {
        throw new Error("Method not implemented.");
    }
    static connectToWallet(): void {
        throw new Error("Method not implemented.");
    }
    contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    contract?:ethers.Contract;
    provider?: ethers.BrowserProvider;
    signer?: ethers.Signer;
    abi = lock.abi;
    async connectToWallet():Promise<WalletConnectionStatus> {
        if ((window as any).ethereum) {
            this.provider = new ethers.BrowserProvider((window as any).ethereum);
            try {
                this.signer = await this.provider!.getSigner();
                this.contract = new ethers.Contract(this.contractAddress, this.abi, this.signer);
                return WalletConnectionStatus.success
            } catch  {
                return WalletConnectionStatus.declined
            }
        } else {
            return WalletConnectionStatus.missingWallet 
        }
    }
}

    
    