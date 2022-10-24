/**
 * @file 01-deploy-nft-marketplace.js
 * @author Original author Free Code Camp (Patrick Collins) used for learning purposes by 0xChristopher
 * @brief This is a deploy script for the NftMarketplace.sol contract.
 */

const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("---------------------------------------------")
    log("Deploying NFT Marketplace contract...")

    const args = []
    const nftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log("Deployment complete.")
    log("---------------------------------------------")

    // Call verify script if not on local blockchain and Etherscan API key is present
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(nftMarketplace.address, args)
    }
}

module.exports.tags = ["all", "nftmarketplace"]
