'use client'

import styles from "./page.module.css";
import { useState} from "react";
import { ethers } from "ethers";
import Image from "next/image";
import table from "../../public/blackjack-Table.png"


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
   } else {
      alert("You need a wallet!");
    }
   }

  return (
    <div className={styles.page}>
      <div className={styles.startGameButton}>
        <button className={styles.startGameButton} onClick={connectToWallet}>Start Game</button>
      </div>
      
      <div className={styles.container}>
        <Image src={table} className={styles.table} alt="table"/>
      </div>
    </div>
  )
}
