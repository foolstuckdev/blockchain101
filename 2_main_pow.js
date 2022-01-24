// POW ensures 1 block is created every 10 minutes

const SHA256 = require('crypto-js/sha256')

class Block{
    constructor(index, timestamp, data, previousHash=''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log(`mineBlock complete, hash = ${this.hash}`)
    }
}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
    }

    createGenesisBlock(){
        return new Block(0, "01/01/2022", "Genesis block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        // newBlock.hash = newBlock.calculateHash();
        newBlock.mineBlock(this.difficulty);
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

console.log("mining block 1 ..");
d1 = Date.now();
devCoin.addBlock(new Block(1, "01/01/2022", {amount: 1}));

console.log("mining block 2 ..");
devCoin.addBlock(new Block(2, "01/01/2022", {amount: 2}));
d2 = Date.now();

console.log(`time taken to mine blocks = ${d2-d1}`)

console.log(JSON.stringify(devCoin, null, 4));

console.log(`is current block chain valid?: ${devCoin.isChainValid()}`);
