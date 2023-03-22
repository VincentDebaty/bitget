require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const {
  FuturesClient,
  NewFuturesOrder,
} = require('bitget-api');

const API_KEY = process.env.API_KEY_COM;
const API_SECRET = process.env.API_SECRET_COM;
const API_PASS = process.env.API_PASS_COM;

const client = new FuturesClient({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  apiPass: API_PASS,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.post('/order', (req, res) => {
    let data = req.body;
    if(data.type == 'entry'){
      res.send(JSON.stringify(newOrder(data.symbol, data.margin_coin, data.side, data.price, data.quantity, data.leverage)));
    }
    if(data.type == 'exit'){
      res.send(JSON.stringify(closePositions()));
    }
})

const PRODUCT_TYPE = 'sumcbl';
const symbol = "SBTCSUSDT_SUMCBL";
const marginCoin = "SUSDT";
var balance = 0;

const start = async function(a, b) {
    const balanceResult = await client.getAccount(symbol, marginCoin);
    const accountBalance = balanceResult.data;
    // const balances = allBalances.filter((bal) => Number(bal.available) != 0);
    const usdtAmount = accountBalance.available;
    balance = usdtAmount;
    console.log('USDT balance: ', usdtAmount);
}

const newOrder = async function(symbol, marginCoin, side, price, quantity, leverage) {

    await client.setLeverage(symbol, marginCoin, leverage) 
        .then(result => {
        console.log('Set leverage: ', result);
        })
        .catch(err => {
        console.log('Set leverage error: ', err);
    });

    const order = {
        marginCoin,
        orderType: 'market',
        side,
        size: (parseInt(balance) / price) * quantity,
        symbol,
    };

    console.log('placing order: ', order);

    const result = 
    await client.submitOrder(order);

    console.log('order result: ', result);

    const positionsResult = await client.getPositions('umcbl');
    const positionsToClose = positionsResult.data.filter(
        (pos) => pos.total !== '0'
    );
}

const closePositions = async function(){
    const positionsResult = await client.getPositions(PRODUCT_TYPE);
    const positionsToClose = positionsResult.data.filter(
      (pos) => pos.total !== '0'
    );

    for (const position of positionsToClose) {
      const closingSide =
        position.holdSide === 'long' ? 'close_long' : 'close_short';
      const closingOrder = {
        marginCoin: position.marginCoin,
        orderType: 'market',
        side: closingSide,
        size: position.available,
        symbol: position.symbol,
      };

      console.log('closing position with market order: ', closingOrder);

      const result = await client.submitOrder(closingOrder);
      console.log('position closing order result: ', result);
    }
}

start();