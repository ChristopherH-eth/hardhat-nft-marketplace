/**
 * @file verify.js
 * @author Original author Free Code Camp (Patrick Collins) used for learning purposes by 0xChristopher
 * @brief This script is to verify a contract when deployed to a test or mainnet.
 */

const { run } = require("hardhat")

/**
 * @notice The verify() function verifies the contract on the blockchain programmatically
 */
const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
        console.log("Contract verified.")
        console.log("---------------------------------------------")
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified.")
            console.log("---------------------------------------------")
        } else {
            console.log(e)
        }
    }
}

module.exports = {
    verify,
}
