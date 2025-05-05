'use client'

import styles from "./page.module.css";
import { useState} from "react";
import { ethers } from "ethers";


const contractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const abi = [""]




export default function Home() {
  const [contract, setContract] = useState<ethers.Contract>();
  async function connectToWallet() {
    if (contract !== undefined) {
      return;
    }
    if ((window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
  
      const signer = await provider.getSigner();
  
      
      setContract(new ethers.Contract(contractAddress, abi, signer));
      console.log("Contact created");
      
  
   } else {
      alert("You need a wallet!");
    }
   }
  return (
    <div className={styles.page}>
       <button onClick={connectToWallet}>Start Game</button>
       






      

    </div>
  )
}
