'use client'

import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

// Contract Addresses and ABI (Replace with your actual values)
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "card",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "total",
                "type": "uint8"
            }
        ],
        "name": "DealerHit",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "result",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "playerTotal",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "dealerTotal",
                "type": "uint8"
            }
        ],
        "name": "GameFinished",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "player",
                "type": "address"
            }
        ],
        "name": "GameStarted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "card",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "total",
                "type": "uint8"
            }
        ],
        "name": "PlayerHit",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "total",
                "type": "uint8"
            }
        ],
        "name": "PlayerStand",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "games",
        "outputs": [
            {
                "internalType": "enum BlackjackSimple.GameState",
                "name": "state",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "result",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getGame",
        "outputs": [
            {
                "internalType": "uint8[]",
                "name": "playerCards",
                "type": "uint8[]"
            },
            {
                "internalType": "uint8[]",
                "name": "dealerCards",
                "type": "uint8[]"
            },
            {
                "internalType": "string",
                "name": "result",
                "type": "string"
            },
            {
                "internalType": "enum BlackjackSimple.GameState",
                "name": "state",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "hit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "restartGame",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "stand",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "startGame",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Define a type for the game state
interface GameStateData {
    playerCards: number[];
    dealerCards: number[];
    result: string;
    state: number;
}

export default function Home() {

    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [gameState, setGameState] = useState<GameStateData>({
        playerCards: [],
        dealerCards: [],
        result: "",
        state: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [gameStarted, setGameStarted] = useState(false); // Add state to track game start

    // Connect to the Ethereum provider and contract
    useEffect(() => {
        const connectToWallet = async () => {
            if (typeof window !== 'undefined' && (window as any).ethereum) {
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const signer = await provider.getSigner();
                setContract(new ethers.Contract(contractAddress, abi, signer));
            } else {
                setError("Web3 provider is not available.");
            }
        };
        connectToWallet();
    }, []);

    // Function to start the game
    const startGame = async () => {
        if (!contract) return;
        setLoading(true);
        try{
            const tx = await contract.startGame();
            await tx.wait();
            console.log("Game started");
            await fetchGameData();
            setGameStarted(true);
        } catch(e:any){
            setError(e.message);
        }

        setLoading(false);

    };

    // Function to restart the game
    const restartGame = async () => {
        if (!contract) return;
        setLoading(true);
        try{
            const tx = await contract.restartGame();
            await tx.wait();
            console.log("Game restarted");
            await fetchGameData();
            setGameStarted(true);
        } catch(e:any){
             setError(e.message);
        }

        setLoading(false);
    };

    // Function to handle a "hit" action
    const handleHit = async () => {
        if (!contract) return;
        setLoading(true);
        try{
            const tx = await contract.hit();
            await tx.wait();
            console.log("Player hit");
            await fetchGameData();
        } catch(e:any){
             setError(e.message);
        }

        setLoading(false);
    };

    // Function to handle a "stand" action
    const handleStand = async () => {
        if (!contract) return;
        setLoading(true);
        try{
            const tx = await contract.stand();
            await tx.wait();
            console.log("Player stood");
            await fetchGameData();
        } catch(e:any){
             setError(e.message);
        }

        setLoading(false);
    };

    // Function to get the current game state
    const fetchGameData = async () => {
        if (!contract) return;
        setLoading(true);
        try{
            const data = await contract.getGame();
            const gameStateData: GameStateData = {
                playerCards: data.playerCards.map((x: any) => Number(x)),
                dealerCards: data.dealerCards.map((x: any) => Number(x)),
                result: data.result,
                state: Number(data.state),
            };
            setGameState(gameStateData);
        } catch(e:any){
             setError(e.message);
        }

        setLoading(false);
    };

    // Fetch initial game state when the contract is available
    useEffect(() => {
        if (contract) {
            fetchGameData();
        }
    }, [contract]);

    return (
        <div className={styles.page}>
            {!gameStarted && (  //show start game button only when game has not started
                <div className={styles.startGameButton}>
                    <button
                        className={styles.startGameButton}
                        onClick={startGame}
                        disabled={loading}
                    >
                        {loading ? "Starting..." : "Start Game"}
                    </button>
                </div>
            )}

            {gameStarted && ( //show this after game started.
                <div className={styles.container}>
                    {error && <div className={styles.error}>{error}</div>}
                    {loading && <div className={styles.loading}>Loading...</div>}
                    <div className={styles.startGameButton}>
                        <button
                            className={styles.startGameButton}
                            onClick={restartGame}
                            disabled={loading}
                        >
                            {loading ? "Restarting..." : "Restart Game"}
                        </button>
                    </div>

                    {/* Display Game State */}
                    <div>
                        <h2>Your Cards:</h2>
                        <p>{gameState.playerCards.join(", ")}</p>
                        <h2>Dealer&apos;s Cards:</h2>
                        <p>{gameState.dealerCards.join(", ")}</p>
                        <h2>Result:</h2>
                        <p>{gameState.result}</p>
                        <h2>Game State:</h2>
                        <p>{gameState.state}</p>
                    </div>

                    {/* Action Buttons (Hit, Stand) */}
                    {gameState.state === 1 && (
                        <div>
                            <button
                                className={styles.actionButton}
                                onClick={handleHit}
                                disabled={loading}
                            >
                                {loading ? "Hitting..." : "Hit"}
                            </button>
                            <button
                                className={styles.actionButton}
                                onClick={handleStand}
                                disabled={loading}
                            >
                                {loading ? "Standing..." : "Stand"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

