const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const SHA256 = require('crypto-js/sha256');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const balances = {
  "1": 100,
  "2": 50,
  "3": 75,
}

for(let balKey of Object.keys(balances)) {
  const key = ec.genKeyPair();
  balances[balKey] = {
    publicKey: key.getPublic().encode('hex'),
    balance: balances[balKey],
    privateKey: key.getPrivate().toString(16)
  }
}

console.log(balances)

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address].balance || 0;
  res.send({ balance });
});

app.post('/verify', (req, res) => {
  const {signature, sender, amount} = req.body;
  const publicKey = balances[sender].publicKey;
  const key = ec.keyFromPublic(publicKey, 'hex');
  const msg = { amount };
  const msgHash = SHA256(msg).toString();
  const signatureData = {
    r: signature.r,
    s: signature.s
  };
  const verify = key.verify(msgHash, signatureData);
  res.send({ verify });
});

app.post('/signin', (req, res) => {
  const {sender, amount} = req.body;
  const privateKey = balances[sender].privateKey;
  const key = ec.keyFromPrivate(privateKey);
  const message = { amount }
  const msgHash = SHA256(message);
  const signature = key.sign(msgHash.toString());
  
  res.send({ signature });
});


app.post('/send', (req, res) => {
  const {sender, recipient, amount} = req.body;
  balances[sender].balance -= amount;
  balances[recipient].balance = (balances[recipient].balance || 0) + +amount;
  res.send({ balance: balances[sender].balance });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
