const { ethers, network } = require("hardhat")
const fs = require("fs")

/**
 * @notice This script is used to update the NFT Marketplace front end.
 */

const frontEndContractsFile = "../nextjs-nft-marketplace-moralis/constants/networkMapping.json"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end...")

        await updateContractAddresses()
    }
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
