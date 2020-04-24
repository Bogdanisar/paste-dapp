var MyContract = artifacts.require("PasteDapp");

module.exports = function(deployer) {
  deployer.deploy(MyContract);
};
