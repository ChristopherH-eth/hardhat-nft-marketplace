const { network } = require("hardhat")
const { verify } = require("../utils/verify")
const { developmentChains } = require("../helper-hardhat-config")

/**
 * @notice This is a deploy script for the BasicNft.sol contract.
 */

module.exports = async function ({ deployments, getNamedAccounts }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("---------------------------------------------")
    log("Deploying Basic NFT contract...")

    const args = []
    const basicNft = await deploy("BasicNft", {
        from: deployer,
        args: args,
        log: true,
        awaitConfirmations: network.config.blockConfirmations || 1,
    })

    log("Deployment complete.")
    log("---------------------------------------------")

    // Call verify script if not on local blockchain and Etherscan API key is present
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(basicNft.address, args)
    }
}

module.exports.tags = ["all", "basicnft"]
