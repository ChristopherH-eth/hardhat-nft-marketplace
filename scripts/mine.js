const { moveBlocks } = require("../utils/move-blocks")

/**
 * @notice This script is used to mine blocks for confirmations on the Moralis database.
 */

const BLOCKS = 2
const SLEEP_AMOUNT = 1000

async function mine() {
    await moveBlocks(BLOCKS, (sleepAmount = SLEEP_AMOUNT))
}

mine()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
