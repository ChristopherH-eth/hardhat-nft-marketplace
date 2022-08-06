const { network } = require("hardhat")

/**
 * @notice This script is used to manually mine blocks on the local blockchain.
 */

function sleep(timeInMs) {
    return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

async function moveBlocks(amount, sleepAmount = 0) {
    console.log("Moving blocks...")

    for (let index = 0; index < amount; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })

        if (sleepAmount > 0) {
            console.log(`Sleeping for ${sleepAmount}`)

            await sleep(sleepAmount)
        }
    }
}

module.exports = { moveBlocks, sleep }
