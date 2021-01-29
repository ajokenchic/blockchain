const sha256=require('sha256');
const currentNodeUrl=process.argv[3];
const{v1:uuid}=require('uuid');
function Blockchain(){
    this.chain=[];//채굴한 블록을 저장하는 배열
    this.newTransactions=[];//블록에 저장되지 않은 모든 트랜젝션을 저장하는 배열.
    //GENESIS블록을 만들기 위해 임의의 값으로 생성.
    this.createNewBlock(100,'0','0');
    this.currentNodeUrl=currentNodeUrl;
    this.networkNodes=[];
}

Blockchain.prototype.createNewBlock=function(nonce,prevBlockHash,hash){
    const newBlock={
        //Blockchain 안의 새로운 블록으로 관련 데이터들은 모두 이 안에 저장.
        index:this.chain.length+1,//새로운 블록이 몇번째 블록인지.
        timestamp:Date.now(),//블록이 생성된 시점.
        transactions: this.newTransactions,//새로운 트랜섹션과 미결 트랜섹션이 추가
        nonce:nonce,//POW를 통해 찾아진 숫자값
        hash:hash,//트랜섹션의 해시값
        prevBlockHash:prevBlockHash,//이전 블록에서 직전 블록까지 트랜섹션의 해시값
    }
    //console.log(this.chain);
    this.newTransactions=[];//새로운 블록의 만들 때 새로운 트랜섹션을 저장할 배열을 초기화.
    this.chain.push(newBlock);//새로운 블록을 체인에 추가.
    return newBlock;//새로운 블록을 반환.
}
Blockchain.prototype.getLastBlock=function(){
    return this.chain[this.chain.length-1];
}
Blockchain.prototype.createNewTransaction=function(amount,sender,recipient){
    const newTransaction={
        amount:amount,
        sender:sender,
        recipient:recipient,
        transactionId:uuid().split('-').join('')
    };
    // this.newTransactions.push(newTransaction);
    // return this.getLastBlock()['index'+1];
    return newTransaction;
}
Blockchain.prototype.addTransactionTonewTransactions=function(transactionObj){
    this.newTransactions.push(transactionObj);
    return this.getLastBlock()['index']+1;
}
Blockchain.prototype.hashBlock=function(prevBlockHash,curBlockData,nonce){
    const dataString=prevBlockHash
    +nonce.toString()//숫자인 nonce를 문자열로 변경.
    +JSON.stringify(curBlockData);//JSON데이터를 문자열로 변경
    //문자열로 만ㅁ든 블록 데이터를 해싱.
    const hash=sha256(dataString);
    return hash;
}
Blockchain.prototype.proofOfWork=function(prevBlockHash,curBlockData){
    let nonce=0;
    let hash=this.hashBlock(prevBlockHash,curBlockData,nonce);
    while(hash.substring(0,4)!="0000"){
        nonce++;
        hash=this.hashBlock(prevBlockHash,curBlockData,nonce);
        //console.log(hash);
        process.stdout.write(hash+'\r');
        
    }
    process.stdout.write('\n');
    return nonce;
}
Blockchain.prototype.chainIsValid=function(blockchain){
    let validChain=true;
    //모든 블록을 순회하며 직전 블록의 해쉬 함수값과 현재 블록의 해쉬값 비교확인.
    for(var i=1;i<blockchain.length;i++){
        const currentBlock=blockchain[i];
        const prevBlock=blockchain[i-1];
        const blockHash=this.hashBlock(prevBlock['hash'],
        {transaction:currentBlock['transactions'],Index:currentBlock['index']},
        currentBlock['nonce']);
        if(blockHash.substring(0,4)!=='0000') validChain=false;
        if(currentBlock['prevBlockHash']!==prevBlock['hash']) validChain=false;
    };
    const genesisBlock=blockchain[0];
    const correctNonce=genesisBlock['nonce']===100;
    const correctPreviousBlockHash=genesisBlock['prevBlockHash']==='0';
    const correctHash = (genesisBlock['hash']==='0');
    // const correctHash=false;
    // if( genesisBlock['hash']==='0') correctHash=true;
    const correctTransactions = genesisBlock['transactions'].length===0;

    if(!correctNonce||!correctPreviousBlockHash||!correctHash||!correctTransactions)validChain=false;

    return validChain;
}
Blockchain.prototype.getBlock=function(blockHash){
    let correctBlock=null;
    this.chain.forEach(block=>{
        if(block.hash===blockHash) correctBlock=block;
    });
    return correctBlock;
};
Blockchain.prototype.getTransaction=function(transactionId){
    let correctTransactions=null;
    let correctBlock=null;
    this.chain.forEach(block=>{
        block.transactions.forEach(transaction=>{
            if(transaction.transactionId===transactionId){
                correctTransactions=transaction;
                correctBlock=block;
            };
        });
    });
    return{
        transaction:correctTransactions,
        block:correctBlock
    };
};
Blockchain.prototype.getAddressData=function(address){
    const addressTransactions=[];
    this.chain.forEach(block=>{
        block.transactions.forEach(transaction=>{
            if(transaction.sender===address||transaction.recipient===address){
                addressTransactions.push(transaction);
            };
        });
    });
    let balance=0;
    addressTransactions.forEach(transaction=>{
        if(transaction.recipient===address) balance+=transaction.amount;
        else if(transaction.sender===address) balance-=transaction.amount;
    });
    return{
        addressTransactions:addressTransactions,
        addressBalance:balance,
    };
};
module.exports=Blockchain;//Blockchain 생성자 함수를 exports하기 위해 dev/blockchain.js 파일 제일 하단에 추가.