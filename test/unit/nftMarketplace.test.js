/**
 * @file nftMarketplace.test.js
 * @author 0xChristopher
 * @brief These are the unit tests for the Random IPFS NFT smart contract.
 */

const { ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NftMarketplace", function () {
          let nftMarketplace,
              nftMarketplaceContract,
              basicNft,
              basicNftContract,
              deployer,
              user,
              accounts
          const LISTING_PRICE = ethers.utils.parseEther("0.01")
          const NEW_PRICE = ethers.utils.parseEther("0.02")
          const TOKEN_ID = "0"

          beforeEach(async function () {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              user = accounts[1]
              await deployments.fixture(["all"])
              nftMarketplaceContract = await ethers.getContract("NftMarketplace")
              nftMarketplace = nftMarketplaceContract.connect(deployer)
              basicNftContract = await ethers.getContract("BasicNft")
              basicNft = basicNftContract.connect(deployer)
              await basicNft.mintNFT()
          })

          /**
           * @notice Unit tests for the listItem() function.
           */
          describe("listItem", function () {
              it("Lists an NFT", async function () {
                  await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
                  expect(
                      await nftMarketplace.listItem(basicNft.address, TOKEN_ID, LISTING_PRICE)
                  ).to.emit("ItemListed")
              })

              it("Should have a price above zero or revert", async function () {
                  await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, "0")
                  ).to.be.revertedWith("NftMarketplace__PriceMustBeAboveZero")
              })

              it("Should revert without contract approval", async function () {
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, LISTING_PRICE)
                  ).to.be.revertedWith("NftMarketplace__NotApprovedForMarketplace")
              })

              it("Should revert if the NFT is already listed", async function () {
                  await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, LISTING_PRICE)
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, LISTING_PRICE)
                  ).to.be.revertedWith("NftMarketplace__AlreadyListed")
              })

              it("Should revert if the user doesn't own the NFT", async function () {
                  await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
                  nftMarketplace = nftMarketplaceContract.connect(user)
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, LISTING_PRICE)
                  ).to.be.revertedWith("NftMarketplace__NotOwner")
              })
          })

          /**
           * @notice Unit tests for the buyItem() function.
           */
          describe("buyItem", function () {
              beforeEach(async function () {
                  await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, LISTING_PRICE)
              })

              it("Allows the user to buy an NFT", async function () {
                  nftMarketplace = nftMarketplaceContract.connect(user)
                  expect(
                      await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                          value: LISTING_PRICE,
                      })
                  ).to.emit("ItemBought")
              })

              it("Transfers ownership of the NFT upon purchase", async function () {
                  nftMarketplace = nftMarketplaceContract.connect(user)
                  expect(
                      await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                          value: LISTING_PRICE,
                      })
                  ).to.emit("ItemBought")
                  const newOwner = await basicNft.ownerOf(TOKEN_ID)

                  assert.equal(newOwner, user.address)
              })

              it("Should revert if buyer has insufficient funds", async function () {
                  await expect(
                      nftMarketplace.buyItem(basicNft.address, TOKEN_ID, { value: "0" })
                  ).to.be.revertedWith("NftMarketplace__PriceNotMet")
              })

              it("Should revert if the NFT is not listed", async function () {
                  await expect(
                      nftMarketplace.buyItem(basicNft.address, TOKEN_ID + 1, {
                          value: LISTING_PRICE,
                      })
                  ).to.be.revertedWith("NftMarketplace__NotListed")
              })
          })

          /**
           * @notice Unit tests for the cancelListing() function.
           */
          describe("cancelListing", function () {
              beforeEach(async function () {
                  await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, LISTING_PRICE)
              })

              it("Allows the NFT owner to cancel the listing", async function () {
                  expect(await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)).to.emit(
                      "ItemCancelled"
                  )
              })

              it("Should revert if the user doesn't own the NFT", async function () {
                  nftMarketplace = await nftMarketplaceContract.connect(user)
                  await expect(
                      nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith("NftMarketplace__NotOwner")
              })

              it("Should revert if the NFT is not listed", async function () {
                  nftMarketplace = await nftMarketplaceContract.connect(user)
                  expect(
                      await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                          value: LISTING_PRICE,
                      })
                  ).to.emit("ItemBought")
                  await expect(
                      nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith("NftMarketplace__NotListed")
              })
          })

          /**
           * @notice Unit tests for the updateListing() function.
           */
          describe("updateListing", function () {
              beforeEach(async function () {
                  await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, LISTING_PRICE)
              })

              it("Allows the NFT owner to update the listing", async function () {
                  expect(
                      await nftMarketplace.updateListing(basicNft.address, TOKEN_ID, NEW_PRICE)
                  ).to.emit("ItemListed")
              })

              it("Should revert if the user doesn't own the NFT", async function () {
                  nftMarketplace = await nftMarketplaceContract.connect(user)
                  await expect(
                      nftMarketplace.updateListing(basicNft.address, TOKEN_ID, NEW_PRICE)
                  ).to.be.revertedWith("NftMarketplace__NotOwner")
              })

              it("Should revert if the NFT is not listed", async function () {
                  await expect(
                      nftMarketplace.updateListing(basicNft.address, TOKEN_ID + 1, NEW_PRICE)
                  ).to.be.revertedWith("NftMarketplace__NotListed")
              })
          })

          /**
           * @notice Unit tests for the withdrawProceeds() function.
           */
          describe("withdrawProceeds", function () {
              beforeEach(async function () {
                  await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, LISTING_PRICE)
              })

              it("Allows the user to withdraw their proceeds from NFTs they sold", async function () {
                  nftMarketplace = nftMarketplaceContract.connect(user)
                  await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                      value: LISTING_PRICE,
                  })
                  nftMarketplace = nftMarketplaceContract.connect(deployer)
                  await nftMarketplace.withdrawProceeds()
              })

              it("Should revert if the user has no proceeds to withdraw", async function () {
                  await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith(
                      "NftMarketplace__NoProceeds"
                  )
              })
          })

          /**
           * @notice Unit tests for the getListing() function.
           */
          describe("getListing", function () {
              beforeEach(async function () {
                  await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, LISTING_PRICE)
              })

              it("Returns an existing listing", async function () {
                  const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID)
                  console.log(`NFT Price: ${ethers.utils.parseEther(listing[0].toString())}`)
                  console.log(`Seller Address: ${listing[1].toString()}`)

                  assert.equal(listing[0].toString(), LISTING_PRICE)
                  assert.equal(listing[1], deployer.address)
              })
          })

          /**
           * @notice Unit tests for the getProceeds() function.
           */
          describe("getProceeds", function () {
              beforeEach(async function () {
                  await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
              })

              it("Returns a user's available proceeds", async function () {
                  await nftMarketplace.listItem(basicNft.address, TOKEN_ID, LISTING_PRICE)
                  nftMarketplace = await nftMarketplaceContract.connect(user)
                  expect(
                      await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                          value: LISTING_PRICE,
                      })
                  ).to.emit("ItemBought")
                  const proceeds = await nftMarketplace.getProceeds(deployer.address)

                  assert.equal(proceeds.toString(), LISTING_PRICE)
              })
          })
      })
