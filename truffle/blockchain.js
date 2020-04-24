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
async function addUnlistedPaste(text, language, title) {
  var key = GenerateRandomKey()
  var encryptedText = Encrypt(text, key)
  var encryptedTitle = Encrypt(title, key)
  var encryptedLanguage = Encrypt(language, key)
  var keyHash = Hash(key)
  await Blockchain.pastedapp.postUnlistedPaste(keyHash, encryptedText, encryptedTitle, encryptedLanguage)
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
    var decryptedText = Decrypt(unlistedPaste[0], key)
    var decryptedTitle = Decrypt(unlistedPaste[1], key)
    var decryptedLanguage = Decrypt(unlistedPaste[2], key)
    return {
      "title": decryptedTitle,
      "text": decryptedText,
      "language": decryptedLanguage
    }
  } catch(error) {
    // We received a wrong id or a wrong key
    return {
      "error": "Paste doesn't exist or the key provided is wrong"
    }
  } 
}

// Returns a bool representing if the edit was succesfull
async function editUnlistedPaste(id, key, newText, newLanguage, newTitle) {
  var newEncryptedText = Encrypt(newText, key)
  var newEncryptedTitle = Encrypt(newTitle, key)
  var newEncryptedLanguage = Encrypt(newLanguage, key)
  var hashKey = Hash(key)
  
  var owner
  try {
    owner = (await Blockchain.pastedapp.getUnlistedPaste(id, hashKey))[3]
  } catch(error) {
    // The paste with this id doesn't exist
    return {
      "error": "The paste with this id doesn't exist or the key for it is wrong"
    }
  }

  if (owner == Blockchain.contracts.PasteDapp.currentProvider.selectedAddress) {
    await Blockchain.pastedapp.editUnlistedPaste(id, hashKey, newEncryptedText, newEncryptedTitle, newEncryptedLanguage)
    return
  } else {
    // The user is not allowed to change this paste
    // because it doesn't belong to him
    return {
      "error": "You are not allowed to edit this paste, because it doesn't belong to you"
    }
  }
}

// Returns the id of the Paste
async function addPublicPaste(text, language, title = 'Untitled') {
  await Blockchain.pastedapp.postPublicPaste(text, title, language)
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
      "text": paste[0],
      "language": paste[2]
    }
  } catch(error) {
    // The paste with this id doesn't exist
    return {
      "error": "The paste with this id doesn't exist"
    }
  }
}

// Returns a list of `howmany` Pastes starting with id `index`
async function getLatestPublicPastes(index, howmany) {
  var ids = []
  var texts = []
  if(howmany <= 0) {
    return {
      "error": "Illegal number requested. The requested number should be positive"
    }
  }
  try {
    var latestPastes = await Blockchain.pastedapp.getLatestPastes(index, howmany)
  } catch(error) {
    // Start index is bigger than the last id
    return {
      "error": "Start index is too large"
    }
  }
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
async function editPublicPaste(id, newText, newLanguage, newTitle = 'Untitled') {
  var owner
  try {
    owner = (await Blockchain.pastedapp.getPublicPaste(id))[3]
  } catch(error) {
    // The paste doesn't exist
    return {
      "error": "The paste with this id doesn't exist"
    }
  }

  if(owner == Blockchain.contracts.PasteDapp.currentProvider.selectedAddress){
    await Blockchain.pastedapp.editPublicPaste(id, newText, newTitle, newLanguage)
    return
  } else {
    // This paste doesn't belong to this user
    // He can't edit it
    return {
      "error": "You can't edit this paste, because it doesn't belong to you"
    }
  }
}

