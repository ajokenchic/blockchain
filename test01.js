const Blockchain=require('./dev/Blockchain');//Blockchain.js를 사용하기 위해 import(=require)
const SHA256=require('./dev/SHA256');

const bitcoin=new Blockchain();//Blockchain 생성자의 인스턴스 생성.
idx=0;
bitcoin.createNewBlock(1233,'13546315',"입금");
bitcoin.createNewTransaction(50,'JOHN','TOM');
bitcoin.createNewBlock(1234,'13654635',"출금");
bitcoin.createNewTransaction(530,'Jack','CHOI');
// bitcoin.createNewBlock(3234,87613165,"출금");
// bitcoin.createNewTransaction(150,'BANK','TOM');
// bitcoin.createNewBlock(1634,54648646,"출금");
// bitcoin.createNewTransaction(50,'JO','Timothy');


console.log(bitcoin);//터미널에서 확인.

//패치되는지 확인.
