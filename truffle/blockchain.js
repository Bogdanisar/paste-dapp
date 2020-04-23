/*
  Cryptographic functions
*/
function GenerateRandomKey() {
  str = ""
  for (var i = 0; i < 16; ++i) {
    str += Math.floor(Math.random() * 16).toString(16);
  }
  return str;
}

function Encrypt(message, key) {
  plaintext = message;
  ciphertext = CryptoJS.AES.encrypt(plaintext, key).toString();
  return ciphertext;
}

function Decrypt(message, key) {
  ciphertext = message;
  plainbytes = CryptoJS.AES.decrypt(ciphertext, key);
  plaintext = plainbytes.toString(CryptoJS.enc.Utf8);
  return plaintext;
}

function Hash(message) {
  hash = CryptoJS.SHA3(message);
  hash_string = hash.toString(CryptoJS.enc.Hex);
  return hash_string;
}


/*
  This object holds information about connection to blockchain (account, smart contract)
*/
Blockchain = {
  contracts: {},

  load: async () => {
    await Blockchain.loadWeb3()
    await Blockchain.loadAccount()
    await Blockchain.loadContract()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      Blockchain.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */ })
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      Blockchain.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */ })
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    Blockchain.account = web3.eth.accounts[0]
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    //var words=JSON.parse(data);
    const pastedapp = await $.getJSON('PasteDapp.json')
    Blockchain.contracts.PasteDapp = TruffleContract(pastedapp)
    Blockchain.contracts.PasteDapp.setProvider(Blockchain.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    Blockchain.pastedapp = await Blockchain.contracts.PasteDapp.deployed()
  }
}

$(() => {
  $(window).load(() => {
    Blockchain.load()
  })
})



/*
  Functions that make the connection between blockchain and frontend
*/

// Returns the id for the new Paste and the encryption/decryption key
async function addUnlistedPaste(text, lang, title) {
  var key = GenerateRandomKey()
  var encryptedText = Encrypt(text, key)
  var keyHash = Hash(key)
  await Blockchain.pastedapp.postUnlistedPaste(encryptedText, keyHash, title)
  var number = await Blockchain.pastedapp.getNumberOfUserUnlistedPastes()
  number = number.toNumber()
  var vect = await Blockchain.pastedapp.getUnlistedPastesOfUser(number - 1, 1)
  var id = parseInt(vect[0])
  return {
    "id": id,
    "key": key
  }
}

// Returns the Paste with specified id, if the key is correct
// Returns null otherwise
async function getUnlistedPaste(id, key) {
  var keyHash = Hash(key)
  try {
    var unlistedPaste = await Blockchain.pastedapp.getUnlistedPaste(id, keyHash)
    var encryptedText = unlistedPaste[0]
    var decryptedText = Decrypt(encryptedText, key)
    var title = unlistedPaste[1]
    return {
      "title": title,
      "text": decryptedText
    }
  } catch(error) {
    // We received an unregistered id
    console.log("Paste doesn't exist or you don't have access to it")
    return null
    // if(unlistedPaste[5] != keyHash){
    //   // We received a wrong key for this id
    //   return null
    // }
  }
  
}

// Returns a bool representing if the edit was succesfull
async function editUnlistedPaste(id, key, newText, newLanguage, newTitle) {  
  // La functia de edit din smart contract ar trebui verificat si hash-urile functiilor
  var newEncryptedText = Encrypt(newText, key)
  var hashKey = Hash(key)
  var owner = (await Blockchain.pastedapp.getUnlistedPaste(id, hashKey))[2]
  if (owner == Blockchain.contracts.PasteDapp.currentProvider.selectedAddress) {
    await Blockchain.pastedapp.editUnlistedPaste(id, newEncryptedText, newTitle)
    return true
  } else {
    if(parseInt(owner, 16) == 0){
      // The paste with this id doesn't exist
      console.log("Paste doesn't exist")
      return false
    } else {
      // The user is not allowed to change this paste
      // because it doesn't belong to him
      console.log("You are not allowed to edit")
      return false
    }
  }
}

// Returns the id of the Paste
async function addPublicPaste(txt, lang, title = 'Untitled') {
  await Blockchain.pastedapp.postPublicPaste(txt, title)
  var number = await Blockchain.pastedapp.getNumberOfUserPublicPastes()
  number = number.toNumber()
  var vect = await Blockchain.pastedapp.getPublicPastesOfUser(number - 1, 1)
  var id = parseInt(vect[0])
  return id
}

// Returns the Paste info with the specified id
// Returns null if Paste doesn't exist
async function getPublicPaste(id) {
  try {
    var paste = await Blockchain.pastedapp.getPublicPaste(id)
    return {
      "title": paste[1],
      "text": paste[0]
    }
  } catch(error) {
    // The paste with this id doesn't exist
    console.log("Paste doesn't exist")
    return null
  }
}

// Returns a list of `howmany` Pastes starting with id `index`
async function getLatestPublicPastes(index, howmany) {
  var ids = []
  var texts = []
  var latestPastes = await Blockchain.pastedapp.getLatestPastes(index, howmany)
  for (var i = 0; i < latestPastes.length; i++) {
    ids.push(latestPastes[i].toNumber())
  }
  for (var i = 0; i < ids.length; i++) {
    let publicPaste = await getPublicPaste(ids[i])
    if(publicPaste != null) texts.push(publicPaste)
  }
  return texts
}

// Returns a bool representing if edit was succesfull
async function editPublicPaste(id, newText, newTitle = 'Untitled') {
  var owner = (await Blockchain.pastedapp.getPublicPaste(id))[2]
  if(owner == Blockchain.contracts.PasteDapp.currentProvider.selectedAddress){
    await Blockchain.pastedapp.editPublicPaste(id, newText, newTitle)
    return true
  } else {
    if(parseInt(owner, 16) == 0){
      // The paste doesn't exist
      console.log("Paste doesn't exist")
      return false
    } else {
      // This paste doesn't belong to this user
      // He can't edit it
      console.log("You can't edit this")
      return false
    }
  }
}

