'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { WalletConnectButton } from "./Components";


export default function Home() {
  return (
    <div className={styles.page}>

      <WalletConnectButton/>

    </div>
  )
}
