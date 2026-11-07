const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GrandmaGift", function () {

  let grandmaGift;
  let grandma;
  let child1;
  let child2;
  let stranger;

  beforeEach(async function () {

    [grandma, child1, child2, stranger] =
      await ethers.getSigners();

    const GrandmaGift =
      await ethers.getContractFactory(
        "GrandmaGift"
      );

    grandmaGift =
      await GrandmaGift.deploy();

    await grandmaGift.waitForDeployment();
  });

  it("Grandma can deploy contract", async function () {

    expect(
      await grandmaGift.grandma()
    ).to.equal(
      grandma.address
    );

  });

  it("Grandma can add grandchildren", async function () {

    await grandmaGift.addGrandchild(
      child1.address,
      1000
    );

    const child =
      await grandmaGift.grandchilds(
        child1.address
      );

    expect(
      child.birthday
    ).to.equal(1000);

  });

  it("Grandma can deposit ETH", async function () {

    await grandmaGift.deposit({
      value: ethers.parseEther("10")
    });

    const balance =
      await ethers.provider.getBalance(
        grandmaGift.target
      );

    expect(balance).to.equal(
      ethers.parseEther("10")
    );

  });

  it("Allows withdrawal on birthday", async function () {

    await grandmaGift.addGrandchild(
      child1.address,
      1
    );

    await grandmaGift.deposit({
      value: ethers.parseEther("1")
    });

    await grandmaGift
      .connect(child1)
      .claimGift();

    const child =
      await grandmaGift.grandchilds(
        child1.address
      );

    expect(
      child.claimed
    ).to.equal(true);

  });

  it("Allows withdrawal after birthday", async function () {

    await grandmaGift.addGrandchild(
      child1.address,
      1000
    );

    await grandmaGift.deposit({
      value: ethers.parseEther("1")
    });

    await grandmaGift
      .connect(child1)
      .claimGift();

    const child =
      await grandmaGift.grandchilds(
        child1.address
      );

    expect(
      child.claimed
    ).to.equal(true);

  });

  it("Rejects withdrawal before birthday", async function () {

    const futureBirthday =
      Math.floor(Date.now() / 1000)
      + 100000;

    await grandmaGift.addGrandchild(
      child1.address,
      futureBirthday
    );

    await expect(
      grandmaGift
        .connect(child1)
        .claimGift()
    ).to.be.revertedWith(
      "Birthday has not arrived yet"
    );

  });

  it("Rejects second withdrawal", async function () {

    await grandmaGift.addGrandchild(
      child1.address,
      1
    );

    await grandmaGift.deposit({
      value: ethers.parseEther("1")
    });

    await grandmaGift
      .connect(child1)
      .claimGift();

    await expect(
      grandmaGift
        .connect(child1)
        .claimGift()
    ).to.be.revertedWith(
      "Gift already claimed"
    );

  });

  it("Rejects stranger withdrawal", async function () {

    await expect(
      grandmaGift
        .connect(stranger)
        .claimGift()
    ).to.be.revertedWith(
      "Not registered"
    );

  });

  it("Emits GiftClaimed event", async function () {

    await grandmaGift.addGrandchild(
      child1.address,
      1
    );

    await grandmaGift.deposit({
      value: ethers.parseEther("1")
    });

    await expect(
      grandmaGift
        .connect(child1)
        .claimGift()
    )
    .to.emit(
      grandmaGift,
      "GiftClaimed"
    );

  });

});