const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const {
  FuturesClient,
  NewFuturesOrder,
} = require('bitget-api');

const API_KEY = 'bg_e6aca1d87e0e557ae15435733acb2d53';
const API_SECRET = '505ccfc51eb8caa9fac73cf85192da75d4f9458fe1e67b9ca601cee70e9f7e79';
const API_PASS = 'Julia2305';

const client = new FuturesClient({
    apiKey: API_KEY,
    apiSecret: API_SECRET,
    apiPass: API_PASS,
});

const PRODUCT_TYPE = 'sumcbl';

var balance  = 0;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/newOrder', (req, res) => {
    let data = req.body;
    if(data.type == 'entry'){
      res.send(JSON.stringify(newOrder(data.symbol, data.margin_coin, data.side, data.price, data.quantity, data.leverage)));
    }
    if(data.type == 'exit'){
      res.send(JSON.stringify(closePositions()));
    }
})

app.post('/closeAll', (req, res) => {
  res.send(JSON.stringify(closePositions()));
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


  
  // For public-only API calls, simply don't provide a key & secret or set them to undefined
  // const client = new SpotClient();

  client.getAccounts(PRODUCT_TYPE)
    .then(result => {
      console.log("Get account result: ", result);
      balance = result.data[0].available;
      console.log(balance);
    })
    .catch(err => {
      console.error("Get account error: ", err);
    });

  // client.getSymbols(PRODUCT_TYPE)
  //   .then(result => {
  //     console.log("getSymbols result: ", result);
  //     balance = result.data.available;
  //     newOrder();
  //   })
  //   .catch(err => {
  //     console.error("getSymbols error: ", err);
  //   });

  async function newOrder(symbol, marginCoin, side, price, qty, leverage){
    // await closePositions();
    // await setLeverage(marginCoin, symbol, leverage);
    var params  = {
      marginCoin: marginCoin,
      orderType: 'market',
      side,
      size: (parseInt(balance) / price) * qty,
      symbol: symbol
    };
    console.log(params);
    client.submitOrder(params) 
      .then(result => {
        console.log('New order: ', result);
      })
      .catch(err => {
        console.log('Error new order: ', err);
      });
  }

  async function closePositions(){  
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
      return result;
    }
  }

  function setLeverage(marginCoin, symbol, leverage){
    client.setLeverage(symbol, marginCoin, leverage) 
      .then(result => {
        console.log('Set leverage: ', result);
      })
      .catch(err => {
        console.log('Set leverage error: ', err);
      });
  }

  client.getCopyFollowersOpenOrder()
