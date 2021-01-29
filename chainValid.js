const Blockchain=require('./dev/Blockchain');
const bitcoin=new Blockchain();

const bc1=
{
    "chain": [
        {
            "index": 1,
            "timestmap": 1611816535408,
            "transactions": [],
            "nonce": 100,
            "hash": "0",
            "prevBlockHash": "0"
        },
        {
            "index": 2,
            "timestmap": 1611816678811,
            "transactions": [],
            "nonce": 112088,
            "hash": "0000356b4561249916210c6e146f364bf04fe3a1562ba151ea9d507397f833ef",
            "prevBlockHash": "0"
        }
    ]
}
console.log('Valid:',bitcoin.chainIsValid(bc1.chain));