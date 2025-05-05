'use client'
import { WalletConnection, WalletConnectionStatus } from "@/app/Services";
import { useState } from "react";

let wallet = new WalletConnection()
export function WalletConnectButton() {
    const [status, setStatus] = useState(WalletConnectionStatus.waiting);

    if (status == WalletConnectionStatus.waiting) {
        return (
            <button onClick={async() => {
                let result = await wallet.connectToWallet()
                setStatus(result)
            }}>Connect Your Wallet</button>
                
        )
    }

    if (status == WalletConnectionStatus.success) {
        return(
            <div>
                <p>You are missing a wallet</p>
            </div>
        )
    }

    if (status == WalletConnectionStatus.declined) {
        return(
            <div>
                <p>Thw user canceled the connection</p>
            </div>
        )
    }
}