const Blockchain=require('./dev/Blockchain');
const SHA256=require('./dev/SHA256');
const bitcoin=new Blockchain();

bitcoin.createNewBlock(1234,'ACDKWLKQMDSAD',"입금");
bitcoin.createNewTransaction(100000,'JO','CHOI');
bitcoin.createNewBlock(3234,87613165,"출금");
bitcoin.createNewTransaction(150,'BANK','TOM');
bitcoin.createNewBlock(1634,54648646,"출금");
bitcoin.createNewTransaction(50,'JO','Timothy');

console.log(bitcoin);
console.log(bitcoin.chain[1]);
