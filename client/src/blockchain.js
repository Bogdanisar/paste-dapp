import Web3 from "web3";
import TruffleContract from "@truffle/contract";

const pastedApp = require("./blockchain.json");

class Blockchain {
    constructor(web3, contract, instance) {
        this.web3 = web3;
        this.contract = contract;
        this.instance = instance;
    }

    getAccount() {
        return {from: this.web3.eth.currentProvider.selectedAddress};
    }

    async postPublic(text, language) {
        return await this.instance.postPublicPaste(text, "", language, this.getAccount());
    }
}

export async function getBlockchain() {
    if (getBlockchain.instance === undefined) {
        try {
            await window.ethereum.enable();
            const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
            const web3 = new Web3(window.ethereum);
            const contract = TruffleContract(pastedApp);
            contract.setProvider(provider);

            const instance = await contract.deployed();
            getBlockchain.instance = new Blockchain(web3, contract, instance);
        } catch (e) {
            console.error(e);
            getBlockchain.instance = null;
        }
    }
    return getBlockchain.instance;
}
