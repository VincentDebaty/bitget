module.exports = {
  apps : [
    {
      name   : "btc",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3001",
        SYMBOL: "SBTCSUSDT_SUMCBL",
        MARGIN_COIN: "SUSDT",
        MINUTES: 1,
        PERIOD: 10,
        AMOUNT: 2,
        POURCENTAGE: 1,
        LEVERAGE: 50
      }
    },
    {
      name   : "eth",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3002",
        SYMBOL: "SETHSUSDT_SUMCBL",
        MARGIN_COIN: "SUSDT",
        MINUTES: 1,
        PERIOD: 10,
        AMOUNT: 2,
        POURCENTAGE: 1,
        LEVERAGE: 50,
        RANGE_PERIOD: 240
      }
    },
    {
      name   : "xrp",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3003",
        SYMBOL: "SXRPSUSDT_SUMCBL",
        MARGIN_COIN: "SUSDT",
        MINUTES: 1,
        PERIOD: 10,
        AMOUNT: 2,
        POURCENTAGE: 1,
        LEVERAGE: 50,
        RANGE_PERIOD: 240
      }
    },
    {
      name   : "xrp",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3003",
        SYMBOL: "SXRPSUSDT_SUMCBL",
        MARGIN_COIN: "SUSDT",
        MINUTES: 1,
        PERIOD: 10,
        AMOUNT: 2,
        POURCENTAGE: 1,
        LEVERAGE: 50,
        RANGE_PERIOD: 240
      }
    },
    {
      name   : "tomo",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3004",
        SYMBOL: "TOMOUSDT_UMCBL",
        MARGIN_COIN: "USDT",
        MINUTES: 1,
        PERIOD: 10,
        AMOUNT: 0.5,
        POURCENTAGE: 1.2,
        LEVERAGE: 25,
        RANGE_PERIOD: 240
      }
    }
  ]
}
