/**
 * @file mint.js
 * @author Original author Free Code Camp (Patrick Collins) used for learning purposes by 0xChristopher
 * @brief This script is used to mint NFTs.
 */

const { ethers, network } = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")

/**
 * @notice The mint() function mints a new BasicNft
 */
async function mint() {
    const basicNft = await ethers.getContract("BasicNft")

    console.log("Minting NFT...")
    const mintTx = await basicNft.mintNFT()
    const mintTxReceipt = await mintTx.wait(1)
    const tokenId = mintTxReceipt.events[0].args.tokenId

    console.log(`Got Token ID: ${tokenId}`)
    console.log(`NFT Address: ${basicNft.address}`)

    if (network.config.chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

mint()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
