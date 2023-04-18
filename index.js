require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const {
  FuturesClient,
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
      res.send(JSON.stringify(closePositions(data.symbol)));
    }
})

app.post('/balance', (req, res) => {
  let data = req.body;
  res.send(JSON.stringify(getBalance(data.symbol, data.margin_coin)));
})

app.post('/leverage', (req, res) => {
  let data = req.body;
  res.send(JSON.stringify(setLeverage(data.symbol, data.margin_coin, data.leverage)));
})

const PRODUCT_TYPE = 'umcbl';
var balance = 0;

const getBalance = async function(symbol, marginCoin) {
    const balanceResult = await client.getAccount(symbol, marginCoin);
    const accountBalance = balanceResult.data;
    // const balances = allBalances.filter((bal) => Number(bal.available) != 0);
    const usdtAmount = accountBalance.available;
    balance = usdtAmount;
    console.log('USDT balance: ', usdtAmount);
}

const newOrder = async function(symbol, marginCoin, side, price, quantity, leverage) {
  try {
    const sizeCount = await client.getOpenCount(symbol, marginCoin, price, balance * quantity / 100 , leverage);

    if(sizeCount){

      const size = sizeCount.data.openCount;

      const order = {
          marginCoin,
          orderType: 'market',
          side,
          size,
          symbol,
      };

      console.log('placing order: ', order);

      const result = await client.submitOrder(order);

      console.log('order result: ', result);

      const positionsResult = await client.getPositions('umcbl');
      const positionsToClose = positionsResult.data.filter(
          (pos) => pos.total !== '0'
      );
    }

  } catch (e) {
    console.error('request failed: ', e);
  }
}

const closePositions = async function(symbol){
  
    const positionsResult = await client.getPositions(PRODUCT_TYPE);
    const positionsToClose = positionsResult.data.filter(
      (pos) => pos.total !== '0'
    );
    console.log(positionsToClose);

    for (const position of positionsToClose) {
      if(position.symbol == symbol){
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
}

const setLeverage = async function(symbol, marginCoin, leverage) {
  try {
    const resultLeverage = await client.setLeverage(symbol, marginCoin, leverage);
    console.log('set leverage result: ', resultLeverage);
  } catch (e) {
    console.error('request failed: ', e);
  }
}

getBalance('BTCUSDT_UMCBL', 'USDT');