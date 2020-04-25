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
        return this.web3.eth.currentProvider.selectedAddress;
    }

    async callApi(method, ...args) {
        const result = await this.instance[method].call(...args, {from: this.getAccount()});
        console.info(`${method}: ${result}`);
        return result;
    }

    async postPublic(text, language) {
        await this.callApi("postPublicPaste", text, "", language);
        const numUserPastes = (await this.callApi("getNumberOfUserPublicPastes")).toNumber();
        if (numUserPastes === 0) {
            throw "Error posting paste";
        }
        const userPastes = await this.callApi("getPublicPastesOfUser", numUserPastes - 1, 1);
        return userPastes[0].toNumber();
    }

    async getPublic(id) {
        try {
            const paste = await this.callApi("getPublicPaste", id);
            return {
                text: paste[0],
                language: paste[2],
            };
        } catch (e) {
            throw "Could not load paste";
        }
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
