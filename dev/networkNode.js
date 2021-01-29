const express=require('express');
const Blockchain=require('./Blockchain');
const{v1:uuid}=require('uuid');
const port=process.argv[2];
const reqp=require('request-promise');



const nodeAddress=uuid().split('-').join('');
const bitcoin=new Blockchain();
const app=new express();
const bodyparser=require('body-parser');
const requestPromise = require('request-promise');
const { request } = require('express');
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
app.get('/block/:blockHash',function(req,res){
    const blockHash=req.params.blockHash;
    const correctBlock=bitcoin.getBlock(blockHash);
    res.json({
        block:correctBlock
    });
});
app.get('/transaction/:transactionId',function(req,res){
    const transactionId=req.params.transactionId;
    const transactionData=bitcoin.getTransaction(transactionId);
    res.json({
        transaction:transactionData.transaction,
        block:transactionData.block
    });
});
app.get('/address/:address',function(req,res){
   const address=req.params.address;
   const addressData=bitcoin.getAddressData(address);
   res.json({
       addressData:addressData
   })
})
app.get('/block-explore',function(req,res){
    res.sendFile('./index.html',{root:__dirname});
});
app.post('/blockchain',function(req,res){
    res.send(bitcoin);
});//전체 블록체인을 가져와서 그 안의 데이터를 조회
app.post('/transaction',function(req,res){
    // const blockIndex=bitcoin.createNewTransaction(
    //     req.body.amount,
    //     req.body.sender,
    //     req.body.recipient)
    const newTransaction=req.body;
    const blockIndex=bitcoin.addTransactionTonewTransactions(newTransaction);

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
    const requestPromise=[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions={
            uri:networkNodeUrl+'/receive-new-block',
            method:'POST',
            body:{newBlock:newBlock},
            json:true
        }
        requestPromise.push(reqp(requestOptions));
    });
    Promise.all(requestPromise)
    .then(data=>{
        const requestOptions={
            uri:bitcoin.currentNodeUrl+'/transaction/broadcast',
            method:'POST',
            body:{
                amount:12.5,
                sender:'00',
                recipient:nodeAddress
            },
            json:true
        };
        return reqp(requestOptions);
    })
    .then(data=>{
        res.json({
            note:'New block mined & broadcast successfully',
            block:newBlock
        });
    });

    // //새로운 블록을 다른 노드들에게 통지.
    // res.json({note:"New block mined successfully",block:newBlock});
    // //새로운 블록을 채굴한 것에 대한 보상 처리
    // //2018년 기준 보상은 12.5BTC,sender가 "00"이면 보상의 의미.
    // bitcoin.createNewTransaction(12.5,"0000",nodeAddress);
});//새로운 블록 채굴.
app.post('/receive-new-block',function(req,res){
    const newBlock=req.body.newBlock;
    const lastBlock=bitcoin.getLastBlock();
    const correctHash=lastBlock.hash===newBlock.prevBlockHash;
    const correctIndex=lastBlock['index']+1===newBlock['index'];

    if(correctHash&&correctIndex){
        bitcoin.chain.push(newBlock);
        bitcoin.newTransactions=[];
        res.json({
            note:'New block received and accepted.',
            newBlock:newBlock
        });
    }
    else{
        res.json({
            note:'New block rejected.',
            newBlock:newBlock
        });
    }
});



app.post(`/register-and-broadcast-node`,function(req,res){
    const newNodeUrl=req.body.newNodeUrl;//등록 요청 URL
    //배열 networkNodes에서 없으면 추가
    if(bitcoin.networkNodes.indexOf(newNodeUrl)==-1)
    bitcoin.networkNodes.push(newNodeUrl);
    //다른 노드에게 브로드캐스팅
    const regNodesPromises=[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOption={
            uri: networkNodeUrl+'/register-node',
            method:'POST',
            body:{ newNodeUrl: newNodeUrl },
            json:true          
        };
        
        regNodesPromises.push(reqp(requestOption));
       
    });
    Promise.all(regNodesPromises)
    .then(data=>{
        const bulkRegisterOptions = {
            uri:newNodeUrl+'/register-nodes-bulk',
            method:'POST',
            body:{allNetworkNodes:[...bitcoin.networkNodes,bitcoin.currentNodeUrl]},
            json:true
        };
        return reqp(bulkRegisterOptions);
    })
    .then(data=>{
        res.json({note: "New Node registered with network successfully"});
    })
});//자신의 서버에 등록하고 전체 네트워크에 브로드캐스팅

app.post(`/register-node`,function(req,res){
    const newNodeUrl=req.body.newNodeUrl;//등록요청 URL
    //배열 networkNodes에 없으면 true,있으면 false
    const nodeNotExist=(bitcoin.networkNodes.indexOf(newNodeUrl)==-1);
    //currentNodeUrl과 newNodeUrl이 다르면 true,같다면  false
    const notCurrentNode=bitcoin.currentNodeUrl!==newNodeUrl;
    //기존에 없고 , 현재 노드의 url과 다르면 추가
    if(nodeNotExist&&notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
    //등록 요청에 대한 회신.
    res.json({note:`New node registered successfully.`});
});//새로 등록 요청받은 노드를 자신의 서버에 등록.

app.post(`/register-nodes-bulk`,function(req,res){
    const allNetworkNodes=req.body.allNetworkNodes;
    allNetworkNodes.forEach(networkNodeUrl=>{
    const nodeNotAlreadyPresent= bitcoin.networkNodes.indexOf(networkNodeUrl)==-1;
    const notCurrentNode=bitcoin.currentNodeUrl!==networkNodeUrl;
    if(nodeNotAlreadyPresent&&notCurrentNode)bitcoin.networkNodes.push(networkNodeUrl);
    });
    res.json({note:'Bulk registration successful.'});
});//여러 개의 노드를 자신의 서버에 한번에 등록.

app.post('/transaction/broadcast',function(req,res){
    const newTransaction=bitcoin.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient);
    bitcoin.addTransactionTonewTransactions(newTransaction);
    const requestPromise=[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions={
            uri:networkNodeUrl+'/transaction',
            method:'POST',
            body:newTransaction,
            json:true
        }
        requestPromise.push(reqp(requestOptions));
    });
    Promise.all(requestPromise).then(data=>{
        res.json({note:'Transaction created and broadcast successfully.'})
    });
});
app.get('/consensus',function(req,res){
    const requestPromise=[];
    bitcoin.networkNodes.forEach(networkNodeUrl=>{
        const requestOptions={
            uri:networkNodeUrl+'/blockchain',
            method:'GET',
            json:true
        };
        requestPromise.push(reqp(requestOptions));
    });
    Promise.all(requestPromise)
    .then(blockchains=>{
        const currentChainLength=bitcoin.chain.length;
        let maxChainLength=currentChainLength;
        let newLongestChain=null;
        let newTransactions=null;

        blockchains.forEach(blockchain=>{
            if(blockchain.chain.length>maxChainLength){
                maxChainLength=blockchain.chain.length;
                newLongestChain=blockchain.chain;
                newTransactions=blockchain.newTransactions;
            };
        })
        if (!newLongestChain ||
			(newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced.',
				chain: bitcoin.chain
			});
		}
		else {
			bitcoin.chain = newLongestChain;
			bitcoin.newTransactions = newTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: bitcoin.chain
			});
		}
    })
})

app.listen(port,function(){
    console.log(`listening on port ${port}...`)
});
