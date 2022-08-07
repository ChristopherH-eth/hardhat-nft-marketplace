const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

/**
 * @notice This script is used to cancel NFT listings on the NFT Marketplace.
 */

const TOKEN_ID = 12

async function cancel() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    const tx = await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
    await tx.wait(1)
    console.log("NFT listing cancelled.")

    if (network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

cancel()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
