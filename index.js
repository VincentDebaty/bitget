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
    run(process.env.SYMBOL,process.env.MARGIN_COIN, process.env.MINUTES, process.env.PERIOD, process.env.AMOUNT, process.env.POURCENTAGE, process.env.LEVERAGE);
})

app.get('/test', (req, res) => {
  res.sendStatus(200)
})

app.post('/run', (req, res) => {
    let data = req.body;
    res.send(JSON.stringify(run(data.symbol, data.margin_coin, data.minutes, data.period, data.amount, data.pourcentage, data.leverage)));
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

const newOrder = async function(symbol, marginCoin, side, price, quantity, leverage) {
  try {
    //const sizeCount = await client.getOpenCount(symbol, marginCoin, price, quantity * price, leverage);
    //if(sizeCount){

      const sizeMultiplier = parseFloat(currentPosition.settings.sizeMultiplier);
      const size = Math.round(quantity / sizeMultiplier) * sizeMultiplier;

      if(size > 0) {
        if(currentPosition.plan != null){
          console.log('Remove plan...');
          await client.cancelPlanOrderTPSL({orderId: currentPosition.plan.orderId, symbol, marginCoin, planType: 'normal_plan'});
        }
        const order = {
          marginCoin,
          orderType: 'market',
          triggerType: 'fill_price',
          side,
          size,
          symbol,
          triggerPrice: price,
          executePrice: price,
        };

        console.log('placing plan: ', order);

        const result = await client.submitPlanOrder(order);
        console.log('plan result: ', result);
        currentPosition.plan = result.data;
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
      triggerType: 'market_price',
      holdSide
    };
    console.log(params)
    const result = await client.submitPositionTPSL(params);
    currentPosition.SL = true;
    console.log(result);
  } catch (e) {
    console.error('request failed: ', e);
  }
}


// getBalance('SBTCSUSDT_SUMCBL', 'SUSDT');

const getCandles = async function(symbol, granularityInMinute, candlesToFetch) {
  try {
    const timestampNow = Date.now();
    const msPerCandle = granularityInMinute * 60 * 1000; // 60 seconds x 1000
    const msFor1kCandles = candlesToFetch * 2 * msPerCandle;
    const startTime = timestampNow - msFor1kCandles;

    const resultCandles = await client.getCandles(symbol, granularityInMinute + 'm', startTime.toString(), timestampNow.toString());
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

    return await client.getOrderHistory(symbol, startTime, timestampNow.toString(), 10);
  } catch (e) {
    console.error('request failed: ', e);
  }
  
}

function calculateEMA(closingPrices, period) {
  const k = 2 / (period + 1);
  let ema = closingPrices[0];
  for (let i = 1; i < closingPrices.length; i++) {
    ema = (closingPrices[i] * k) + (ema * (1 - k));
  }

  return ema;
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

const run = async function(symbol, marginCoin, minutes, period, amount, pourcentage, leverage){
  if(!currentPosition){
    currentPosition = {
      plan: null,
      SL: false,
      ema: 0,
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

      var symbolResult = await getSymbols(productType);
      currentPosition.settings = symbolResult.data.filter((e) => e.symbol == symbol)[0];

      var candles = await getCandles(symbol, minutes, period);
      var currentPrice = formatNumber(candles[candles.length-1][4], symbol);
      console.log('Price: ' + currentPrice);
      currentPosition.ema = formatNumber(calculateEMA(candles.map((x) => x[4]), period), symbol);

      console.log('Ema: ' + currentPosition.ema);

      const positionsResult = await client.getPositions(productType);
      const positions = positionsResult.data.filter(
          (pos) => pos.total !== '0' && pos.symbol == symbol
      );


      var lossInARow = 0;
      var lockedRow = false;

      var orderHistory = await getOrderHistory(symbol);
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
      }

      if(positions.length == 0){
        currentPosition.SL = false;
    
        if(lossInARow < maxLossInARow){
          var positionAmount = currentPosition.initAmount * (Math.pow(2, lossInARow));
          var quantity = positionAmount * leverage / currentPosition.ema;
          
          if(currentPrice < currentPosition.ema){
            await newOrder(symbol, marginCoin, 'open_long', currentPosition.ema, quantity, leverage);
          }else{
            await newOrder(symbol, marginCoin, 'open_short', currentPosition.ema, quantity, leverage);
          }
        }
      }else{
        currentPosition.plan = null;
        var averageOpenPrice = positions[0].averageOpenPrice * 1;

        var tp = 0;
        var sl = 0;
        var gainTP = formatNumber(averageOpenPrice * (pourcentage + (currentPosition.settings.takerFeeRate * 100)) / 100, symbol);
        var gainSL = formatNumber(averageOpenPrice * (pourcentage - (currentPosition.settings.takerFeeRate * 100)) / 100, symbol);

        if(!currentPosition.SL){
          if(positions[0].holdSide == 'long'){
            tp = formatNumber(averageOpenPrice + gainTP, symbol);
            sl = formatNumber(averageOpenPrice - gainSL, symbol);
            await submitPositionTPSL(symbol, marginCoin, 'profit_plan', tp, 'long');
            await submitPositionTPSL(symbol, marginCoin, 'loss_plan', sl, 'long');
          }else{
            tp = formatNumber(averageOpenPrice - gainTP, symbol);
            sl = formatNumber(averageOpenPrice + gainSL, symbol);
            await submitPositionTPSL(symbol, marginCoin, 'profit_plan', tp, 'short');
            await submitPositionTPSL(symbol, marginCoin, 'loss_plan', sl, 'short');
          }
        }
      }

      console.log('Loss in a row : ' + lossInARow);

      if(lossInARow < maxLossInARow){
        console.log('-------');
        setTimeout(() => run(symbol, marginCoin, minutes, period, amount, pourcentage, leverage), 10000);
      }
    }
  } catch (e) {
    console.error('run failed: ', e);
  }
}