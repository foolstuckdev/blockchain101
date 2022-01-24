const {BlockChain, Transaction} = require("./blockchain");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('532045c04c8b41fead62aa13115858515abbf276b695a7a2108bc6430f8e6c4c');
const myWalletAddress = myKey.getPublic('hex');

let devCoin = new BlockChain();

// create transaction, sign it and add the transaction
const transaction1 = new Transaction(myWalletAddress, 'receivers_PUBLICKEY', 10);
transaction1.signTransaction(myKey);
devCoin.addTransaction(transaction1);

// mine pending transactions
devCoin.minePendingTransactions(myWalletAddress);

// create other transaction
const transaction2 = new Transaction(myWalletAddress, 'receivers2_PUBLICKEY', 5);
transaction2.signTransaction(myKey);
devCoin.addTransaction(transaction2);

// mine again
devCoin.minePendingTransactions(myWalletAddress);

console.log(`balance of minerAddress is`, devCoin.getBalanceOfAddress(myWalletAddress));
