const SHA256 = require('crypto-js/sha256')

class Block{
    constructor(index, timestamp, data, previousHash=''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock(){
        return new Block(0, "01/01/2022", "Genesis block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    isChainValid(){
        // iterate through chain and check if currentBlock's hash and previousBlock's hash are intact
        for (let block = 1; block < this.chain.length; block++){
            const currentBlock = this.chain[block];
            const previousBlock = this.chain[block - 1];

            // re-calculate the current block's hash to compare
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false
            }

            // check previous block's hash to compare
            if(currentBlock.previousHash !== previousBlock.hash){
                return false
            }
        }

        return true;
    }
}

let devCoin = new BlockChain();
devCoin.addBlock(new Block(1, "01/01/2022", {amount: 1}));
devCoin.addBlock(new Block(2, "01/01/2022", {amount: 2}));

//console.log(JSON.stringify(devCoin, null, 4));

// console.log(`is current block chain valid?: ${devCoin.isChainValid()}`);

// // tampering data
// devCoin.chain[1].data = {amount: 100};
// // recalculate hash again
// devCoin.chain[1].hash = devCoin.chain[1].calculateHash();

// console.log(`is current block chain valid?: ${devCoin.isChainValid()}`);


/**
 * Limitations:
 * 1. Proof of work
 * 2. P2P communication
 * 3. Check if enough balance is available
 * 4. Rollback new addition to block in case of discrepancy
 * 5. Merkel trees, Nonce
 */