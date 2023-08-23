module.exports = {
  apps : [
    {
      name   : "btc",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3000",
        SYMBOL: "SBTCSUSDT_SUMCBL",
        MARGIN_COIN: "SUSDT",
        MINUTES: 1,
        PERIOD: 10,
        AMOUNT: 2,
        POURCENTAGE: 0.5
      }
    },
    {
      name   : "eth",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3001",
        SYMBOL: "SETHSUSDT_SUMCBL",
        MARGIN_COIN: "SUSDT",
        MINUTES: 1,
        PERIOD: 10,
        AMOUNT: 2,
        POURCENTAGE: 0.5
      }
    },
    {
      name   : "xrp",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3002",
        SYMBOL: "SXRPSUSDT_SUMCBL",
        MARGIN_COIN: "SUSDT",
        MINUTES: 1,
        PERIOD: 10,
        AMOUNT: 2,
        POURCENTAGE: 0.5
      }
    }
  ]
}
