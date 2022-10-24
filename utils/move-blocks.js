/**
 * @file move-blocks.js
 * @author Original author Free Code Camp (Patrick Collins) used for learning purposes by 0xChristopher
 * @brief This script is used to manually mine blocks on the local blockchain.
 */

const { network } = require("hardhat")

/**
 * @notice The sleep() function has the program sleep
 */
function sleep(timeInMs) {
    return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

/**
 * @notice The moveBlocks() function moves x number of blocks and sleeps in between each block
 */
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
