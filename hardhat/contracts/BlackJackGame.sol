// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BlackjackSimple {
    enum GameState { NotStarted, PlayerTurn, DealerTurn, Finished }

    struct Game {
        uint8[] playerCards;
        uint8[] dealerCards;
        GameState state;
        address player;
        string result;
    }

    mapping(address => Game) public games;

    event GameStarted(address player);
    event PlayerHit(address player, uint8 card, uint8 total);
    event PlayerStand(address player, uint8 total);
    event DealerHit(uint8 card, uint8 total);
    event GameFinished(address player, string result, uint8 playerTotal, uint8 dealerTotal);

    modifier inState(GameState expected) {
        require(games[msg.sender].state == expected, "Invalid game state");
        _;
    }

    function startGame() external {
        _startGame(msg.sender);
    }

    function restartGame() external {
        _startGame(msg.sender);
    }

    function _startGame(address player) private {
        Game storage game = games[player];
        delete games[player];

        game.player = player;
        game.playerCards.push(_drawCard("PLAYER1"));
        game.playerCards.push(_drawCard("PLAYER2"));
        game.dealerCards.push(_drawCard("DEALER1"));
        game.dealerCards.push(_drawCard("DEALER2"));
        game.state = GameState.PlayerTurn;

        emit GameStarted(player);
        emit PlayerHit(player, game.playerCards[0], _calculateTotal(game.playerCards));
        emit PlayerHit(player, game.playerCards[1], _calculateTotal(game.playerCards));
        emit DealerHit(game.dealerCards[0], _calculateTotal(game.dealerCards));
    }

    function hit() external inState(GameState.PlayerTurn) {
        Game storage game = games[msg.sender];
        uint8 newCard = _drawCard("HIT");
        game.playerCards.push(newCard);
        uint8 total = _calculateTotal(game.playerCards);
        emit PlayerHit(msg.sender, newCard, total);

        if (total > 21) {
            game.state = GameState.Finished;
            game.result = "Player Busts. Dealer Wins!";
            emit GameFinished(msg.sender, game.result, total, _calculateTotal(game.dealerCards));
        }
    }

    function stand() external inState(GameState.PlayerTurn) {
        Game storage game = games[msg.sender];
        game.state = GameState.DealerTurn;
        emit PlayerStand(msg.sender, _calculateTotal(game.playerCards));

        uint8 dealerTotal = _calculateTotal(game.dealerCards);
        while (dealerTotal < 17) {
            uint8 newCard = _drawCard("DEALER_HIT");
            game.dealerCards.push(newCard);
            dealerTotal = _calculateTotal(game.dealerCards);
            emit DealerHit(newCard, dealerTotal);
        }

        uint8 playerTotal = _calculateTotal(game.playerCards);
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
        emit GameFinished(msg.sender, game.result, playerTotal, dealerTotal);
    }

    function _drawCard(string memory salt) private view returns (uint8) {
        return uint8((uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, salt))) % 11) + 1);
    }

    function _calculateTotal(uint8[] memory cards) private pure returns (uint8 total) {
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
        return total;
    }

    function getGame() external view  returns (uint8[] memory playerCards, uint8[] memory dealerCards, string memory result, GameState state) {
        Game storage game = games[msg.sender];
        return (game.playerCards, game.dealerCards, game.result, game.state);
    }
}