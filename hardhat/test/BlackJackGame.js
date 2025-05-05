const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  
  describe("Blackjack", function () {
    async function deployBlackjackFixture() {
      const [owner, player, other] = await ethers.getSigners();
      const Blackjack = await ethers.getContractFactory("Blackjack");
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
        expect(game.state).to.equal(1); 
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
        while (game.state === 1 && game.playerCards.length < 10) {
          await blackjack.connect(player).hit();
          game = await blackjack.connect(player).getGame();
        }
  
        if (game.state === 3) {
          expect(game.result).to.include("Busts");
        }
      });
  
      it("Should finish game on stand and declare a result", async function () {
        const { blackjack, player } = await loadFixture(deployBlackjackFixture);
  
        await blackjack.connect(player).startGame();
        await blackjack.connect(player).stand();
  
        const game = await blackjack.connect(player).getGame();
        expect(game.state).to.equal(3);
        expect(game.result.length).to.be.greaterThan(0);
      });
    });
  
    describe("Validation", function () {
      it("Should not allow hitting when not PlayerTurn", async function () {
        const { blackjack, player } = await loadFixture(deployBlackjackFixture);
  
        await blackjack.connect(player).startGame();
        await blackjack.connect(player).stand();
  
        await expect(blackjack.connect(player).hit()).to.be.revertedWith("Invalid game state");
      });
  
      it("Should not allow starting a game twice in a row", async function () {
        const { blackjack, player } = await loadFixture(deployBlackjackFixture);
  
        await blackjack.connect(player).startGame();
        await expect(blackjack.connect(player).startGame()).to.be.revertedWith("Game already in progress");
      });
  
      it("Should allow starting a new game after finishing", async function () {
        const { blackjack, player } = await loadFixture(deployBlackjackFixture);
  
        await blackjack.connect(player).startGame();
        await blackjack.connect(player).stand();
  
        await expect(blackjack.connect(player).startGame()).not.to.be.reverted;
      });
    });
  });
  