import Web3 from "web3";
import TruffleContract from "@truffle/contract";

const pastedApp = require("./PasteDapp.json");
const CryptoJS = require("../node_modules/crypto-js");


class Blockchain {
    constructor(web3, contract, instance) {
        this.web3 = web3;
        this.contract = contract;
        this.instance = instance;
    }

    getAccount() {
        return this.web3.eth.currentProvider.selectedAddress;
    }

    GenerateRandomKey(){
        var str = ""
        for(let i=0; i<16; ++i){
            str += Math.floor(Math.random() * 16).toString(16);
        }
        return str;
    }

    Encrypt(plaintext, key){
        return CryptoJS.AES.encrypt(plaintext, key).toString();
    }

    Decrypt(ciphertext, key){
        const plainbytes = CryptoJS.AES.decrypt(ciphertext, key);
        return plainbytes.toString(CryptoJS.enc.Utf8);
    }

    Hash(message){
        const hash = CryptoJS.SHA3(message);
        return hash.toString(CryptoJS.enc.Hex);
    }

    async callApi(method, ...args) {
        const result = await this.instance[method](...args, {from: this.getAccount()});
        console.info(`${method}: ${result}`);
        return result;
    }

    async postPublic(code, title, language) {
        const result = await this.callApi("postPublicPaste", code, title, language);
        try {
            return result.logs[0].args['0'].toNumber()
        } catch(error) {
            throw "Couldn't extract the id."
        }
    }

    async getPublic(id) {
        try {
            const paste = await this.callApi("getPublicPaste", id);

            return {
                "code": paste[0],
                "title": paste[1],
                "language": paste[2],
                "owner": paste[3],
                "creationDate": paste[4],
                "edited": paste[5]
            };
        } catch (e) {
            throw "Could not load paste.";
        }
    }

    async getWindowPublic(offset, quantity) {
        if (offset < 0) { // Offset must be positive
            quantity = quantity + offset;
            offset = 0
        }
        if (quantity < 0) {// Quantity must be positive
            return []
        }

        const no_public_pastes = await this.callApi("getNumberOfPublicPastes");
        if(offset >= no_public_pastes) {
            return []
        }
        if(offset + quantity >= no_public_pastes){
            quantity = no_public_pastes - offset;
        }

        const ids_public_pastes = await this.callApi("getLatestPastes", offset, quantity);

        let public_pastes = [];
        for(let i=0; i<ids_public_pastes.length; ++i) {
            const id = ids_public_pastes[i].toNumber();
            const public_paste = await this.getPublic(id);
            public_pastes.push({
                ...public_paste,
                "id": id
            });
        }

        return public_pastes;
    }

    async editPublic(id, newCode, newTitle, newLanguage){
        try {
            await this.callApi("editPublicPaste", id, newCode, newTitle, newLanguage);
        } catch(e) {
            throw "Couldn't edit the paste. You may not have the rights to do this";
        }
    }

    async postUnlisted(code, title, language) {
        const key = this.GenerateRandomKey()
        const encryptedCode = this.Encrypt(code, key)
        const encryptedLanguage = this.Encrypt(language, key)
        const encryptedTitle = this.Encrypt(title, key)
        const hashKey = this.Hash(key)
        const result = await this.callApi("postUnlistedPaste", hashKey, encryptedCode, encryptedTitle, encryptedLanguage);
        try {
            return {
                "id": result.logs[0].args['0'].toNumber(),
                "key": key
            }
        } catch(error) {
            throw "Couldn't extract the id."
        }
    }

    async getUnlisted(id, key){
        try {
            const hashKey = this.Hash(key)
            var info = await this.callApi("getUnlistedPaste", id, hashKey);
            return {
                "code": this.Decrypt(info[0], key),
                "title": this.Decrypt(info[1], key),
                "language": this.Decrypt(info[2], key),
                "owner": info[3],
                "creationDate": info[4],
                "edited": info[5]
            }
        }
        catch(error) {
            throw "Could not load paste. Maybe the link is wrong?";
        }
    }

    async editUnlisted(id, key, newCode, newTitle, newLanguage){
        try {
            const encryptedCode = this.Encrypt(newCode, key);
            const encryptedTitle = this.Encrypt(newTitle, key);
            const encryptedLanguage = this.Encrypt(newLanguage, key);
            const keyHash = this.Hash(key);
            await this.callApi("editUnlistedPaste", id, keyHash, encryptedCode, encryptedTitle, encryptedLanguage);
        } catch(error) {
            throw "Couldn't edit the paste. You may not have the rights to do this";
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
