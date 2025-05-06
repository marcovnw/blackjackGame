import { ethers } from "ethers";
// Modify to match your contract

import  lock from "../../../artifacts/contracts/BlackJackGame.sol/Blackjack.json";


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
    contractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
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

    
    