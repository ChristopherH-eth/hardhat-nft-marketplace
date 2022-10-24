/**
 * @file 99-update-front-end.js
 * @author Original author Free Code Camp (Patrick Collins) used for learning purposes by 0xChristopher
 * @brief This script is used to update the NFT Marketplace front end.
 */

const { ethers, network } = require("hardhat")
const fs = require("fs")

const frontEndContractsFile = "../nextjs-nft-marketplace-moralis/constants/networkMapping.json"
const frontEndAbiLocation = "../nextjs-nft-marketplace-moralis/constants/"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end...")

        await updateContractAddresses()
        await updateAbi()
    }
}

/**
 * @notice The updateAbi() function updates the front end Abi files for the marketplace and NFTs.
 */
async function updateAbi() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    fs.writeFileSync(
        `${frontEndAbiLocation}NftMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )

    const basicNft = await ethers.getContract("BasicNft")
    fs.writeFileSync(
        `${frontEndAbiLocation}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )
}

/**
 * @notice The updateContractAddresses() function checks the frontEndContractsFile for the current
 * contract address and adds it if it doesn't match or exist.
 */
async function updateContractAddresses() {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const chainId = network.config.chainId.toString()
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))

    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["NftMarketplace"].includes(nftMarketplace.address)) {
            contractAddresses[chainId]["NftMarketplace"].push(nftMarketplace.address)
        }
    } else {
        contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
    }

    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}

module.exports.tags = ["all", "frontend"]
