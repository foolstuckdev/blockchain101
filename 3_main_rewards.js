// Mining rewards = steadily increases new money in system

const SHA256 = require('crypto-js/sha256')

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block{
    constructor(timestamp, transactions, previousHash=''){
        // this.index = index; order of block is determined by their position in Array and not index
        this.timestamp = timestamp;
        // this.data = data; support multiple transactions in a block
        this.transactions = transactions; 
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
        this.pendingTransactions = []; // all transactions that are pending while a PoW completes are stored here
        this.miningReward = 100; // the reward for successfully computing block
    }

    createGenesisBlock(){
        return new Block("01/01/2022", "Genesis block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    // addBlock(newBlock){
    //     newBlock.previousHash = this.getLatestBlock().hash;
    //     // newBlock.hash = newBlock.calculateHash();
    //     newBlock.mineBlock(this.difficulty);
    //     this.chain.push(newBlock);
    // }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log("block mined successfully");
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
        // fromAddress is null since the money (here, mining reward) is deposited from the system
    }

    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        // to get the balance, we have to iterate throughout the chain and check for each transaction within it
        let balance = 0;
        for (const block of this.chain){
            for (const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }
                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
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

senderAddress = "LaCasaDelPapel_PUBLICKEY";
receiverAddress = "profressor_PUBLICKEY";
minerAddress = "alexPina_PUBLICKEY";

devCoin.createTransaction(new Transaction(senderAddress, receiverAddress, 1000));
devCoin.createTransaction(new Transaction(receiverAddress, senderAddress, 180));

console.log('start mining ..');
devCoin.minePendingTransactions(minerAddress);

console.log(`balance of minerAddress is`, devCoin.getBalanceOfAddress(minerAddress));

// we need to mine a Transaction again since the reward for the miner is in pending transactions list
console.log('start mining again ..');
devCoin.minePendingTransactions(minerAddress);

console.log(`balance of minerAddress is`, devCoin.getBalanceOfAddress(minerAddress));

