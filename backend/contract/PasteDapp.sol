pragma solidity ^0.6.0;





contract PasteDapp {
    
    function stringsAreEqual(string memory self, string memory other) internal pure returns(bool){
        return keccak256(abi.encodePacked(self)) == keccak256(abi.encodePacked(other));
    }
    
    function getSubarray(uint[] storage arr, uint index, uint howmany) internal view returns (uint[] memory ret) {
        require(index < arr.length, "Index is too large!");
        require(howmany > 0, "Must request a positive number of ids!");
        
        if (arr.length - index < howmany) {
            howmany = arr.length - index;
        }
        
        ret = new uint[](howmany);
        for (uint i = 0; i < howmany; ++i) {
            ret[i] = arr[index + i];
        }
    }
    
    
    uint internal newPasteId;
    
    
    
    
    
    struct PublicPaste {
        string text;
        string title;
        address owner;
        uint creationDate;
        bool edited;
    }
    
    mapping (uint => PublicPaste) internal publicPasteMap;
    mapping (address => uint[]) internal publicPastesOfUser; // last element is most recent;
    uint[] internal latestPastes; // last element is most recent;
    
    
    function postPublicPaste(string memory _text, string memory _title) public returns (uint pasteId) {
        pasteId = newPasteId++;
        publicPasteMap[pasteId] = PublicPaste(_text, _title, msg.sender, now, false);
        
        publicPastesOfUser[msg.sender].push(pasteId);
        latestPastes.push(pasteId);
    }
    
    function postPublicPaste(string memory _text) public returns (uint) {
        return postPublicPaste(_text, "Untitled");
    }
    
    function getPublicPaste(uint id) public view returns (
        string memory text,
        string memory title,
        address owner,
        uint creationDate,
        bool edited
    ) {
        PublicPaste storage pp = publicPasteMap[id];
        require(pp.owner != address(0), "The public paste with that id does not exist!");
        
        (text, title, owner, creationDate, edited) = (pp.text, pp.title, pp.owner, pp.creationDate, pp.edited);
    }
    
    function editPublicPaste(uint id, string memory _text, string memory _title) public {
        PublicPaste storage pp = publicPasteMap[id];
        require(pp.owner != address(0), "The public paste with that id does not exist!");
        require(pp.owner == msg.sender, "Only the owner of a public paste can edit it!");
        
        pp.text = _text;
        pp.title = _title;
        pp.edited = true;
    }
    
    
    function getNumberOfPublicPastes() public view returns (uint) {
        return latestPastes.length;
    }
    
    function getLatestPastes(uint index, uint howmany) public view returns (uint[] memory ret) {
        return getSubarray(latestPastes, index, howmany);
    }
    
    
    function getNumberOfUserPublicPastes() public view returns (uint) {
        return publicPastesOfUser[msg.sender].length;
    }
    
    function getPublicPastesOfUser(uint index, uint howmany) public view returns (uint[] memory ret) {
        return getSubarray(publicPastesOfUser[msg.sender], index, howmany);
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
    mapping (address => uint[]) internal unlistedPastesOfUser; // last element is most recent;
    
    function postUnlistedPaste(string memory _encryptedText, string memory _keyHash, string memory _name) public returns (uint pasteId) {
        pasteId = newPasteId++;
        unlistedPasteMap[pasteId] = UnlistedPaste(_encryptedText, _name, msg.sender, now, false, _keyHash);
        
        unlistedPastesOfUser[msg.sender].push(pasteId);
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
        require(stringsAreEqual(up.keyHash, _keyHash), "Wrong keyHash. The unlisted paste link might be incorrect."); 
        
        (encryptedText, name, owner, creationDate, edited) = (up.encryptedText, up.name, up.owner, up.creationDate, up.edited);
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
    
    
    
    function getNumberOfUserUnlistedPastes() public view returns (uint) {
        return unlistedPastesOfUser[msg.sender].length;
    }
    
    function getUnlistedPastesOfUser(uint index, uint howmany) public view returns (uint[] memory ret) {
        return getSubarray(unlistedPastesOfUser[msg.sender], index, howmany);
    }
    
    
}


