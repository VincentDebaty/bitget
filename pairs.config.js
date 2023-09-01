module.exports = {
  apps : [
    {
      name   : "tomo",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3001",
        SYMBOL: "TOMOUSDT_UMCBL",
        MARGIN_COIN: "USDT",
        MINUTES: 1,
        AMOUNT: 0.5,
        POURCENTAGE: 1.2,
        LEVERAGE: 25,
        RANGE_PERIOD: 240
      }
    },
    {
      name   : "idex",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3002",
        SYMBOL: "IDEXUSDT_UMCBL",
        MARGIN_COIN: "USDT",
        MINUTES: 1,
        AMOUNT: 0.5,
        POURCENTAGE: 1.3,
        LEVERAGE: 20,
        RANGE_PERIOD: 240
      }
    }
  ]
}
