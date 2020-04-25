import Web3 from "web3";
import TruffleContract from "@truffle/contract";

const pastedApp = require("./blockchain.json");

class Blockchain {
    constructor(contract, instance) {
        this.contract = contract;
        this.instance = instance;
    }

    async postPublic(text, language) {
        return await this.instance.postPublicPaste(text, "", language);
    }
}

export async function getBlockchain() {
    if (getBlockchain.instance === undefined) {
        try {
            const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
            const contract = TruffleContract(pastedApp);
            contract.setProvider(provider);

            const instance = await contract.deployed();
            getBlockchain.instance = new Blockchain(contract, instance);
        } catch (e) {
            console.error(e);
            getBlockchain.instance = null;
        }
    }
    return getBlockchain.instance;
}
