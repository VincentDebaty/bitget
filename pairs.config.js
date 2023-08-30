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
        LEVERAGE: 50
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
        LEVERAGE: 50
      }
    }
  ]
}
