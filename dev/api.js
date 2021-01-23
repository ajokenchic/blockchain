const express=require('express');
const Blockchain=require('./Blockchain');
const{v1:uuid}=require('uuid');
var nodeAddress=uuid().split('-').join('');
var bitcoin=new Blockchain();
var app=new express();
const bodyparser=require('body-parser');
//const { urlencoded } = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));

app.get('/',function(req,res){
    res.send('Hello World111!')
});
app.get('/transaction',function(req,res){
    res.send('It works!');
});//새로운 트렌섹션 생성
app.get('/blockchain',function(req,res){
    res.send(bitcoin);
});//전체 블록체인을 가져와서 그 안의 데이터를 조회
app.post('/transaction',function(req,res){
    const blockIndex=bitcoin.createNewTransaction(
        req.body.amount,
        req.body.sender,
        req.body.recipient)
    res.json({note:`Transaction will be added in block${blockIndex}.`});
    //console.log(req.body);
    //res.send(`The amount of the transaction is ${req.body.amount} bitcoin from ${req.body.sender} to ${req.body.recipient}.`);
});//새로운 트렌섹션 생성;
app.post('/mine',function(req,res){
    const lastBlock=bitcoin.getLastBlock();
    const preBlockHash=lastBlock['hash'];
    const curBlockData={
        transaction:bitcoin.newTransactions,
        Index:lastBlock['index']+1
    }
    const nonce=bitcoin.proofOfWork(preBlockHash,curBlockData);
    const blockHash=bitcoin.hashBlock(preBlockHash,curBlockData,nonce);
    const newBlock=bitcoin.createNewBlock(nonce,preBlockHash,blockHash);
    //새로운 블록을 다른 노드들에게 통지.
    res.json({note:"New block mined successfully",block:newBlock});
    //새로운 블록을 채굴한 것에 대한 보상 처리
    //2018년 기준 보상은 12.5BTC,sender가 "00"이면 보상의 의미.
    bitcoin.createNewTransaction(12.5,"0000",nodeAddress);
});//새로운 블록 채굴.



app.listen(3000,function(){console.log('listening on port 3000')})
