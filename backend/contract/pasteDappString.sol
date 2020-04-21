pragma solidity ^0.6.0;


library StringOps {
    function isEqualToString(string memory self, string memory other) public pure returns(bool){
        return keccak256(abi.encodePacked(self)) == keccak256(abi.encodePacked(other));
    }
}

library DynamicUIntArrayOps {
    function find(uint[] memory self, uint elem) public pure returns (uint) {
        for (uint i = 0; i < self.length; ++i) {
            if (self[i] == elem) {
                return i;
            }
        }
        
        return uint(-1);
    }
    
    function remove(uint[] storage self, uint index) public returns (bool) {
        if (index >= self.length) {
            return false;
        }
        
        (self[index], self[self.length - 1]) = (self[self.length - 1], self[index]);
        self.pop();
        return true;
    }
    
    function insert(uint[] storage self, uint index, uint value) public returns (bool) {
        if (index > self.length) {
            return false;
        }
        
        self.push();
        for (uint i = self.length - 1; index < i; --i) {
            self[i] = self[i-1];
        }
        
        self[index] = value;
        return true;
    }
}



contract PasteDapp {
    using StringOps for string;
    using DynamicUIntArrayOps for uint[];
    
    uint constant internal maxLatestPastes = 10;
    uint internal newPasteId;
    
    
    
    
    
    struct PublicPaste {
        string text;
        string name;
        address owner;
        uint creationDate;
        bool edited;
    }
    
    mapping (uint => PublicPaste) internal publicPasteMap;
    mapping (address => uint[]) public publicPastesOfUser; // these aren't stored in any particular order
    uint[] public latestPastes; // first element is most recent;
    
    
    function postPublicPaste(string memory _text, string memory _name) public returns (uint pasteId) {
        pasteId = newPasteId++;
        publicPasteMap[pasteId] = PublicPaste(_text, _name, msg.sender, now, false);
        publicPastesOfUser[msg.sender].push(pasteId);
        
        latestPastes.insert(0, pasteId);
        if (latestPastes.length > maxLatestPastes) {
            latestPastes.pop();
        }
    }
    
    function postPublicPaste(string memory _text) public returns (uint) {
        return postPublicPaste(_text, "Untitled");
    }
    
    function getPublicPaste(uint id) public view returns (
        string memory text,
        string memory name,
        address owner,
        uint creationDate,
        bool edited
    ) {
        PublicPaste storage pp = publicPasteMap[id];
        require(pp.owner != address(0), "The public paste with that id does not exist!");
        
        (text, name, owner, creationDate, edited) = (pp.text, pp.name, pp.owner, pp.creationDate, pp.edited);
    }
    
    function deletePublicPaste(uint id) public {
        PublicPaste storage pp = publicPasteMap[id];
        require(pp.owner != address(0), "The public paste with that id does not exist!");
        require(pp.owner == msg.sender, "Only the owner of a public paste can delete it!");
        
        delete publicPasteMap[id];
        
        uint[] storage arr = publicPastesOfUser[msg.sender];
        uint index = arr.find(id);
        if (index != uint(-1)) {
            arr.remove(index);
        }
    }
    
    function editPublicPaste(uint id, string memory _text, string memory _name) public {
        PublicPaste storage pp = publicPasteMap[id];
        require(pp.owner != address(0), "The public paste with that id does not exist!");
        require(pp.owner == msg.sender, "Only the owner of a public paste can edit it!");
        
        pp.text = _text;
        pp.name = _name;
        pp.edited = true;
    }
    
    
    
    
    
    // The client will generate a random key, encrypt the user's text with an arbitrary encryption algorithm
    // and send this encrypted text to the blockchain along with a hash of that random key; After the new paste id is received, 
    // the client will give a unique string (made out of the paste id and the random key) which will be used to access the paste;
    // This string/link will not be stored anywhere and the user must remember/share it;
    struct UnlistedPaste {
        string encryptedText;
        string name;
        address owner;
        uint creationDate;
        bool edited;
        string keyHash;
    }
    
    mapping (uint => UnlistedPaste) unlistedPasteMap;
    mapping (address => uint[]) public unlistedPastesOfUser; // these aren't stored in any particular order
    
    function postUnlistedPaste(string memory _encryptedText, string memory _keyHash, string memory _name) public returns (uint pasteId) {
        pasteId = newPasteId++;
        unlistedPasteMap[pasteId] = UnlistedPaste(_encryptedText, _name, msg.sender, now, false, _keyHash);
        unlistedPastesOfUser[msg.sender].push(pasteId);
    }
    
    function postUnlistedPaste(string memory _encryptedText, string memory _keyHash) public returns (uint pasteId) {
        return postUnlistedPaste(_encryptedText, _keyHash, "Untitled");
    }
    
    function getUnlistedPaste(uint id, string memory _keyHash) public view returns (
        string memory encryptedText,
        string memory name,
        address owner,
        uint creationDate,
        bool edited
    ) {
        UnlistedPaste storage up = unlistedPasteMap[id];
        require(up.owner != address(0), "The unlisted paste with that id does not exist!");
        // The next check is only for more forgiveness to user error. It can be bypassed by anyone
        // by checking the value of the keyHash on the blockchain, but the text will be encrypted anyway;
        require(up.keyHash.isEqualToString(_keyHash), "Wrong keyHash. The unlisted paste link might be incorrect."); 
        
        (encryptedText, name, owner, creationDate, edited) = (up.encryptedText, up.name, up.owner, up.creationDate, up.edited);
    }
    
    function deleteUnlistedPaste(uint id) public {
        UnlistedPaste storage up = unlistedPasteMap[id];
        require(up.owner != address(0), "The unlisted paste with that id does not exist!");
        require(up.owner == msg.sender, "Only the owner of an unlisted paste can delete it!");
        
        delete unlistedPasteMap[id];
        
        uint[] storage arr = unlistedPastesOfUser[msg.sender];
        uint index = arr.find(id);
        if (index != uint(-1)) {
            arr.remove(index);
        }
    }
    
    // We assume that the encryption was done using the same key. This is required so that the previously generated link remains valid
    function editUnlistedPaste(uint id, string memory _encryptedText, string memory _name) public {
        UnlistedPaste storage up = unlistedPasteMap[id];
        require(up.owner != address(0), "The unlisted paste with that id does not exist!");
        require(up.owner == msg.sender, "Only the owner of an unlisted paste can edit it!");
        
        up.encryptedText = _encryptedText;
        up.name = _name;
        up.edited = true;
    }
    
    
    
    
    // a private paste can only be accessed by the account that created it;
    // the text will be stored on the blockchain after encrypting it with the private key of the user;
    struct PrivatePaste {
        string encryptedText;
        string name;
        address owner;
        uint creationDate;
        bool edited;
    }
    
    mapping (uint => PrivatePaste) privatePasteMap;
    mapping (address => uint[]) public privatePastesOfUser; // these aren't stored in any particular order
    
    function postPrivatePaste(string memory _encryptedText, string memory _name) public returns (uint pasteId) {
        pasteId = newPasteId++;
        privatePasteMap[pasteId] = PrivatePaste(_encryptedText, _name, msg.sender, now, false);
        privatePastesOfUser[msg.sender].push(pasteId);
    }
    
    function postPrivatePaste(string memory _encryptedText) public returns (uint pasteId) {
        return postPrivatePaste(_encryptedText, "Untitled");
    }
    
    function getPrivatePaste(uint id) public view returns (
        string memory encryptedText,
        string memory name,
        uint creationDate,
        bool edited
    ) {
        PrivatePaste storage pp = privatePasteMap[id];
        require(pp.owner != address(0), "The private paste with that id does not exist!");
        // The next check is only for more forgiveness to user error. It can be bypassed by anyone
        // by getting the value of the text from the blockchain, but the text will be encrypted anyway;
        require(pp.owner == msg.sender, "You do not have permissions to view this private paste.");
        
        (encryptedText, name, creationDate, edited) = (pp.encryptedText, pp.name, pp.creationDate, pp.edited);
    }
    
    function deletePrivatePaste(uint id) public {
        PrivatePaste storage pp = privatePasteMap[id];
        require(pp.owner != address(0), "The private paste with that id does not exist!");
        require(pp.owner == msg.sender, "Only the owner of a private paste can delete it!");
        
        delete privatePasteMap[id];
        
        uint[] storage arr = privatePastesOfUser[msg.sender];
        uint index = arr.find(id);
        if (index != uint(-1)) {
            arr.remove(index);
        }
    }
    
    function editPrivatePaste(uint id, string memory _encryptedText, string memory _name) public {
        PrivatePaste storage pp = privatePasteMap[id];
        require(pp.owner != address(0), "The private paste with that id does not exist!");
        require(pp.owner == msg.sender, "Only the owner of a private paste can edit it!");
        
        pp.encryptedText = _encryptedText;
        pp.name = _name;
        pp.edited = true;
    }
    
}