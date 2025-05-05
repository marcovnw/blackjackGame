// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0

pragma solidity ^0.8.20;

contract Blackjack {
    enum GameState { NotStarted, PlayerTurn, DealerTurn, Finished }

    struct Game {
        uint8[] playerCards;
        uint8[] dealerCards;
        GameState state;
        address player;
        string result;
    }

    mapping(address => Game) public games;

    modifier inState(GameState expected) {
        require(games[msg.sender].state == expected, "Invalid game state");
        _;
    }

    function startGame() external {
        Game storage game = games[msg.sender];
        require(game.state == GameState.NotStarted || game.state == GameState.Finished, "Game already in progress");

        delete games[msg.sender];

        game.player = msg.sender;
        game.playerCards.push(drawCard("PLAYER1"));
        game.playerCards.push(drawCard("PLAYER2"));
        game.dealerCards.push(drawCard("DEALER1"));
        game.dealerCards.push(drawCard("DEALER2"));
        game.state = GameState.PlayerTurn;
    }

    function hit() external inState(GameState.PlayerTurn) {
        Game storage game = games[msg.sender];
        game.playerCards.push(drawCard("HIT"));

        uint8 total = calculateTotal(game.playerCards);
        if (total > 21) {
            game.state = GameState.Finished;
            game.result = "Player Busts. Dealer Wins!";
        }
    }

    function stand() external inState(GameState.PlayerTurn) {
        Game storage game = games[msg.sender];
        game.state = GameState.DealerTurn;

        uint8 dealerTotal = calculateTotal(game.dealerCards);
        while (dealerTotal < 17) {
            game.dealerCards.push(drawCard("DEALER_HIT"));
            dealerTotal = calculateTotal(game.dealerCards);
        }

        uint8 playerTotal = calculateTotal(game.playerCards);
        game.state = GameState.Finished;

        if (dealerTotal > 21) {
            game.result = "Dealer Busts. Player Wins!";
        } else if (dealerTotal > playerTotal) {
            game.result = "Dealer Wins!";
        } else if (dealerTotal < playerTotal) {
            game.result = "Player Wins!";
        } else {
            game.result = "Push (Draw)";
        }
    }

    function drawCard(string memory salt) private view returns (uint8) {
        return uint8((uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, salt))) % 11) + 1);
    }

    function calculateTotal(uint8[] memory cards) private pure returns (uint8 total) {
        uint8 aces = 0;
        total = 0;

        for (uint i = 0; i < cards.length; i++) {
            uint8 card = cards[i];
            if (card == 1) {
                aces += 1;
                total += 11;
            } else {
                total += card;
            }
        }

        while (total > 21 && aces > 0) {
            total -= 10;
            aces -= 1;
        }
    }

    function getGame() external view returns (
        uint8[] memory playerCards,
        uint8[] memory dealerCards,
        string memory result,
        GameState state
    ) {
        Game storage game = games[msg.sender];
        return (game.playerCards, game.dealerCards, game.result, game.state);
    }
}
