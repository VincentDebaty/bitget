require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.NODE_PORT;

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

var currentPosition = null;
var maxLossInARow = 8;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    setTimeout(async () => {
      try{
        await client.setMarginMode(process.env.SYMBOL, process.env.MARGIN_COIN, 'fixed');
        await client.setLeverage(process.env.SYMBOL, process.env.MARGIN_COIN, process.env.LEVERAGE, 'long');
        await client.setLeverage(process.env.SYMBOL, process.env.MARGIN_COIN, process.env.LEVERAGE, 'short');
      }catch(e){
        console.log(e);
      }
      run(process.env.SYMBOL,process.env.MARGIN_COIN, parseInt(process.env.MINUTES), process.env.AMOUNT, parseFloat(process.env.POURCENTAGE), parseInt(process.env.LEVERAGE), parseInt(process.env.ACTIVE));
    }, (port - 3000) * 3000);
    
})

app.get('/test', (req, res) => {
  res.sendStatus(200)
})

app.post('/run', (req, res) => {
    let data = req.body;
    res.send(JSON.stringify(run(data.symbol, data.margin_coin, data.minutes, data.amount, data.pourcentage, data.leverage, data.active)));
})

app.post('/stop', (req, res) => {
  let data = req.body;
  res.send(JSON.stringify(stop(data.symbol)));
})

app.post('/balance', (req, res) => {
  let data = req.body;
  res.send(JSON.stringify(getBalance(data.symbol, data.margin_coin)));
})

var balance = 0;

const getBalance = async function(symbol, marginCoin) {
    const balanceResult = await client.getAccount(symbol, marginCoin);
    const accountBalance = balanceResult.data;
    // const balances = allBalances.filter((bal) => Number(bal.available) != 0);
    const usdtAmount = accountBalance.available;
    balance = usdtAmount;
    console.log('USDT balance: ', usdtAmount);
}

const newOrder = async function(symbol, marginCoin, side, price, quantity, leverage, pourcentage) {
  try {
    //const sizeCount = await client.getOpenCount(symbol, marginCoin, price, quantity * price, leverage);
    //if(sizeCount){

      const sizeMultiplier = parseFloat(currentPosition.settings.sizeMultiplier);
      var decimal = sizeMultiplier.toString().split('.').length > 1 ? sizeMultiplier.toString().split('.')[1].length : 0;
      const size = parseFloat((Math.round(quantity / sizeMultiplier) * sizeMultiplier).toFixed(decimal));

      if(size > 0) {
        const order = {
          marginCoin,
          orderType: 'market',
          price,
          side,
          size,
          symbol,
        };

        console.log('placing order: ', order);

        const result = await client.submitOrder(order);
        
        const position = await client.getPosition(symbol, marginCoin);
        if(position.data){
          setSLTP(symbol, marginCoin, pourcentage, price, side.replace('open_',''));
        }

        console.log('order result: ', result);
      }else{
        console.log('**** Size too low !!! ****');
      }
    //}

  } catch (e) {
    console.error('request failed: ', e);
  }
}

const submitPositionTPSL = async function(symbol, marginCoin, planType, triggerPrice, holdSide) {
  try {
    const params = {
      symbol,
      marginCoin,
      planType,
      triggerPrice,
      triggerType: 'fill_price',
      holdSide
    };
    console.log(params)
    const result = await client.submitPositionTPSL(params);
    currentPosition.SL = currentPosition.SL + 1;
    console.log(result);
  } catch (e) {
    console.error('request failed: ', e);
  }
}

const getOpenOrders = async function(symbol){
  try {
    const result = await client.getOpenSymbolOrders(symbol);
    return result;
  } catch (e) {
    console.error('request failed: ', e);
  }
}


// getBalance('SBTCSUSDT_SUMCBL', 'SUSDT');

const getCandles = async function(symbol, granularityInMinute, candlesToFetch) {
  try {
    const timestampNow = Date.now();
    const msPerCandle = granularityInMinute * 60 * 1000; // 60 seconds x 1000
    const msFor1kCandles = candlesToFetch * msPerCandle;
    const startTime = timestampNow - msFor1kCandles;

    const resultCandles = await client.getCandles(symbol, granularityInMinute + 'm', startTime.toString(), timestampNow.toString(), candlesToFetch);
    return resultCandles;
  } catch (e) {
    console.error('request failed: ', e);
  }
}

const getSymbols = async function(productType){
  try {
    return await client.getSymbols(productType);
  } catch (e) {
    console.error('request failed: ', e);
  }
}

const getOrderHistory = async function(symbol){
  try {
    const timestampNow = Date.now();
    const hours = 168;
    const period = hours * 60 * 60 * 1000; // 60 seconds x 1000
    const startTime = timestampNow - period;

    return await client.getOrderHistory(symbol, startTime, timestampNow.toString(), 50);
  } catch (e) {
    console.error('request failed: ', e);
  } 
}

const setSLTP = async function(symbol, marginCoin, pourcentage, price, side){
  var tp = 0;
  var sl = 0;
  var gainTP = formatNumber(price * (pourcentage + (currentPosition.settings.takerFeeRate * 2 * 100)) / 100, symbol);
  var gainSL = formatNumber(price * (pourcentage - (currentPosition.settings.takerFeeRate * 2 * 100)) / 100, symbol);

  if(currentPosition.SL < 2){
    if(side == 'long'){
      tp = formatNumber(price + gainTP, symbol);
      sl = price - gainSL, symbol;
      sl = formatNumber(sl);
      await submitPositionTPSL(symbol, marginCoin, 'profit_plan', tp, 'long');
      await submitPositionTPSL(symbol, marginCoin, 'loss_plan', sl, 'long');
    }else{
      tp = formatNumber(price - gainTP, symbol);
      sl = price + gainSL, symbol;
      sl = formatNumber(sl)
      await submitPositionTPSL(symbol, marginCoin, 'profit_plan', tp, 'short');
      await submitPositionTPSL(symbol, marginCoin, 'loss_plan', sl, 'short');
    }
  }
}

function formatNumber(number, symbol) {
  number = Math.round(number * Math.pow(10, currentPosition.settings.pricePlace));
  number = number - (number % currentPosition.settings.priceEndStep);
  number = number / Math.pow(10, currentPosition.settings.pricePlace);
  return number;
}

const stop = function(symbol){
  if(currentPosition){
    currentPosition = null;
    console.log(symbol + ' is stopped');
  }
}

const run = async function(symbol, marginCoin, minutes, amount, pourcentage, leverage, active){
  if(!currentPosition){
    currentPosition = {
      SL: 0,
      settings: null,
      initAmount: 0,
    };
  }

  try {
    if(currentPosition){
      console.log(symbol);
      //await getBalance(symbol, marginCoin);

      if(currentPosition.initAmount == 0){
        currentPosition.initAmount = amount;
      }

      productType = symbol.substring(symbol.indexOf('_') + 1);

      if(!currentPosition.settings){
        symbolResult = await getSymbols(productType);
        currentPosition.settings = symbolResult.data.filter((e) => e.symbol == symbol)[0];
      }

      var candles = await getCandles(symbol, minutes, process.env.RANGE_PERIOD);

      var lastHigh = 0
      var lastLow = 9999999
      var highInARow = 0
      var lowInARow = 0

      candles.forEach((candle) => {
        if(lastHigh * 1.0005 < candle[2] || highInARow > process.env.RANGE_PERIOD){
          lastHigh = candle[2]
          highInARow = 0
        }else{
          highInARow = highInARow + 1
        }
        if(lastLow / 1.0005 > candle[3] || lowInARow > process.env.RANGE_PERIOD){
          lastLow = candle[3]
          lowInARow = 0
        }else{
          lowInARow = lowInARow + 1
        }
      });

      console.log('highInARow: ' + highInARow);
      console.log('lowInARow: ' + lowInARow);
      
      var currentPrice = formatNumber(candles[candles.length-1][4], symbol);
      console.log('Price: ' + currentPrice);

      const positionsResult = await client.getPositions(productType);
      const positions = positionsResult.data.filter(
          (pos) => pos.total !== '0' && pos.symbol == symbol
      );


      var lossInARow = 0;
      var lockedRow = false;
      var lastTrade = null;

      var orderHistory = await getOrderHistory(symbol);
      if(orderHistory){
        if(orderHistory.data.orderList){
          orderHistory.data.orderList.forEach((order) => {
            if(!lockedRow && order.state == 'filled' && (order.side == 'close_long' || order.side == 'close_short')){
              if(order.totalProfits < 0){
                lossInARow++;
              }else{
                lockedRow = true;
              }
            }
          });
          lastTrade = orderHistory.data.orderList[0];
        }

        if(positions.length == 0){
          if(lossInARow==0 && active=='0'){
            return;
          }
          currentPosition.SL = 0;
      
          if(lossInARow < maxLossInARow){
            var positionAmount = currentPosition.initAmount * (Math.pow(2, lossInARow));
            // var positionAmount = currentPosition.initAmount;
            var quantity = positionAmount * leverage / currentPrice / pourcentage
            
            var buyCond = (lastTrade == null || 
              (
                (lastTrade.posSide == 'long' && lastTrade.totalProfits > 0) ||
                (lastTrade.posSide == 'short' && lastTrade.totalProfits < 0)
              )
            );

            var sellCond = 
              (
                lastTrade != null && (
                  (lastTrade.posSide == 'short' && lastTrade.totalProfits > 0) ||
                  (lastTrade.posSide == 'long' && lastTrade.totalProfits < 0)
              )
              );

            if((highInARow > 120 && lowInARow > 120) && (buyCond || sellCond) && (lastTrade && lastTrade.totalProfits < 0)){
              buyCond = lastTrade.posSide == 'long';
              sellCond = lastTrade.posSide == 'short';
            }

            if(buyCond){
              await newOrder(symbol, marginCoin, 'open_long', currentPrice, quantity, leverage, pourcentage);
            }
            if(sellCond){
              await newOrder(symbol, marginCoin, 'open_short', currentPrice, quantity, leverage, pourcentage);
            }
          }
        }else{
          var price = positions[0].averageOpenPrice * 1;
          setSLTP(symbol, marginCoin, pourcentage, price, positions[0].holdSide);
        }
        console.log('Loss in a row : ' + lossInARow);
      }

      if(lossInARow < maxLossInARow){
        console.log('-------');
        setTimeout(() => run(symbol, marginCoin, minutes, amount, pourcentage, leverage, active), 12000);
      }
    }
  } catch (e) {
    console.error('run failed: ', e);
  }
}