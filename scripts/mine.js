/**
 * @file mine.js
 * @author Original author Free Code Camp (Patrick Collins) used for learning purposes by 0xChristopher
 * @brief This script is used to mine blocks for confirmations on the Moralis database.
 */

const { moveBlocks } = require("../utils/move-blocks")

const BLOCKS = 2
const SLEEP_AMOUNT = 1000

/**
 * @notice The mine() function mines the next block
 */
async function mine() {
    await moveBlocks(BLOCKS, (sleepAmount = SLEEP_AMOUNT))
}

mine()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
