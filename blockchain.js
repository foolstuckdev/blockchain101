// Mining rewards = steadily increases new money in system
// sign the transactions and check if the transactions are valid
const SHA256 = require("crypto-js/sha256");
const crypto = require("crypto");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  calculateHash() {
    return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount + this.timestamp).digest('hex');   
}

  // to sign the transaction(actually hash of transaction), we need the key
  signTransaction(signingKey) {
    // only sign your transactions
    if (signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error(
        "You may only sign your transactions, not any other wallet"
      );
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, "base64"); // signature
    this.signature = sig.toDER("hex"); // save the signature in hex format
  }

  isValid() {
    if (this.fromAddress == null) return true; // for mining address case - they have null from address since the money is added from the system

    // check if signature exists, and then if the transaction has been signed
    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature in this transaction");
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, "hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = "") {
    // this.index = index; order of block is determined by their position in Array and not index
    this.timestamp = timestamp;
    // this.data = data; support multiple transactions in a block
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return crypto.createHash('sha256').update(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).digest('hex');
    }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`mineBlock complete, hash = ${this.hash}`);
  }

  // block now has multiple transactions instead of an amount
  // so we need to validate if the transactions are valid
  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class BlockChain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = []; // all transactions that are pending while a PoW completes are stored here
    this.miningReward = 100; // the reward for successfully computing block
  }

  createGenesisBlock() {
    return new Block("01/01/2022", "Genesis block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // addBlock(newBlock){
  //     newBlock.previousHash = this.getLatestBlock().hash;
  //     // newBlock.hash = newBlock.calculateHash();
  //     newBlock.mineBlock(this.difficulty);
  //     this.chain.push(newBlock);
  // }

  minePendingTransactions(miningRewardAddress) {
    let block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log("block mined successfully");
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward),
    ];
    // fromAddress is null since the money (here, mining reward) is deposited from the system
  }

  // createTransaction(transaction){
  //     this.pendingTransactions.push(transaction);
  // } we are just adding transactions that we receive

  // validate the transaction received to add it to be chain
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include from and to address");
    }

    // Verify the transactiion
    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain");
    }

    if (transaction.amount <= 0) {
      throw new Error("Transaction amount should be higher than 0");
    }

    // Making sure that the amount sent is not greater than existing balance
    // if (
    //   this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount
    // ) {
    //   throw new Error("Not enough balance");
    // }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    // to get the balance, we have to iterate throughout the chain and check for each transaction within it
    let balance = 0;
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    return balance;
  }

  isChainValid() {
    // Check if the Genesis block hasn't been tampered with by comparing
    // the output of createGenesisBlock with the first block on our chain
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    // Check the remaining blocks on the chain to see if there hashes and
    // signatures are correct
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (previousBlock.hash !== currentBlock.previousHash) {
        return false;
      }

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
    }

    return true;
  }
}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;
