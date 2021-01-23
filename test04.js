const Blockchain=require('./dev/Blockchain');
const bitcoin=new Blockchain();
const prevBlockHash='6B86B2AA22F1D49C01E52DDB7875B4B'
const curBlockData=[
    {amount:100,sender:'JOHN',recipient:'TOM'},
    {amount:50,sender:'JANE',recipient:'MARK'},
    {amount:150,sender:'JACK',recipient:'JANE'},
];
console.log(bitcoin.proofOfWork([prevBlockHash,curBlockData]));