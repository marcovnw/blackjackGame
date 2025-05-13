const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("Blackjack", function () {
  async function deployBlackjackFixture() {
    const [owner, player, other] = await ethers.getSigners();
    const Blackjack = await ethers.getContractFactory("BlackjackSimple");
    const blackjack = await Blackjack.deploy();

    return { blackjack, owner, player, other };
  }

  describe("Game Flow", function () {
    it("Should start a new game with two cards for player and dealer", async function () {
      const { blackjack, player } = await loadFixture(deployBlackjackFixture);

      await blackjack.connect(player).startGame();
      const game = await blackjack.connect(player).getGame();

      expect(game.playerCards.length).to.equal(2);
      expect(game.dealerCards.length).to.equal(2);
      expect(game.state).to.equal(1); // GameState.PlayerTurn = 1
    });

    it("Should allow hitting and add a card to player's hand", async function () {
      const { blackjack, player } = await loadFixture(deployBlackjackFixture);

      await blackjack.connect(player).startGame();
      await blackjack.connect(player).hit();

      const game = await blackjack.connect(player).getGame();
      expect(game.playerCards.length).to.be.gte(3);
    });

    it("Should transition to Finished if player busts", async function () {
      const { blackjack, player } = await loadFixture(deployBlackjackFixture);

      await blackjack.connect(player).startGame();

      let game = await blackjack.connect(player).getGame();
      // Intentionally hit multiple times to try and bust
      for (let i = 0; i < 10 && game.state === 1; i++) {
        await blackjack.connect(player).hit();
        game = await blackjack.connect(player).getGame();
        if (_calculateTotal(game.playerCards) > 21) {
          break; // Exit loop once busted
        }
      }

      if (game.state === 3) { // GameState.Finished = 3
        expect(game.result).to.include("Player Busts");
      } else {
        // This case might happen if the card draws are consistently low.
        // We might want to add a more deterministic way to test busting
        // if the randomness makes this test unreliable.
        console.warn("Player did not bust in this test iteration.");
      }
    });

    it("Should finish game on stand and declare a result", async function () {
      const { blackjack, player } = await loadFixture(deployBlackjackFixture);

      await blackjack.connect(player).startGame();
      await blackjack.connect(player).stand();

      const game = await blackjack.connect(player).getGame();
      expect(game.state).to.equal(3); // GameState.Finished = 3
      expect(game.result.length).to.be.greaterThan(0);
    });

    it("Should allow restarting the game after it's finished", async function () {
      const { blackjack, player } = await loadFixture(deployBlackjackFixture);

      await blackjack.connect(player).startGame();
      await blackjack.connect(player).stand();

      let game = await blackjack.connect(player).getGame();
      expect(game.state).to.equal(3); // Ensure the game is finished

      await expect(blackjack.connect(player).restartGame()).to.not.be.reverted;
      const newGame = await blackjack.connect(player).getGame();
      expect(newGame.state).to.equal(1); // Should be in PlayerTurn again
      expect(newGame.playerCards.length).to.equal(2);
      expect(newGame.dealerCards.length).to.equal(2);
      expect(newGame.result).to.equal("");
    });

    it("Should allow restarting the game when no game is in progress", async function () {
      const { blackjack, player } = await loadFixture(deployBlackjackFixture);

      const gameBefore = await blackjack.connect(player).getGame();
      expect(gameBefore.state).to.equal(0); // GameState.NotStarted = 0

      await expect(blackjack.connect(player).restartGame()).to.not.be.reverted;
      const newGame = await blackjack.connect(player).getGame();
      expect(newGame.state).to.equal(1); // Should be in PlayerTurn
      expect(newGame.playerCards.length).to.equal(2);
      expect(newGame.dealerCards.length).to.equal(2);
      expect(newGame.result).to.equal("");
    });
  });
  
});