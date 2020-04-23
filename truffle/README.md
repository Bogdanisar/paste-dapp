# Blockchain logic
A user can make two types of pastes: **pulic** pastes and **unlisted** pastes. They can get any public paste and any unlisted pastes for which they have the key/link. Even if all information is stored on the blockchain for all to see, anything that shouldn't be seen by everyone will be stored in encrypted form.

A user can edit any paste that they own.
A user can get the following lists, which are all stored in clear form:
- The ids of the public pastes they made;
- The ids of the unlisted pastes they made;

### Public paste
The text is stored in clear form along with a title, an owner (blockchain address) and a creation date. A public paste has a numeric id assigned on creation and any user can get the paste information by using this id. A list of the most recent pastes is maintained in the contract and can be retrieved by anyone.

### Unlisted paste
This paste stores the text in encrypted form. In order to create one, the client will generate a random key and use an arbitrary algorithm to encrypt the given text. The result will be stored on the blockchain along with a hash of the random key. After getting the new paste id, the client will show a unique string/link (made out of the id and the random key) which will not be stored anywhere. The user must remember this link or share it. Upon retrieval, the client will extract the key from the link and decrypt the text received from the contract. The key hash is used to prevent a fair user from extracting data from the blockchain when they have a faulty link.

## PasteDapp.sol

This is a contract which implements the needed contract logic by storing text directly as strings on the blockchain