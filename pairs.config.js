module.exports = {
  apps : [
    {
      name   : "tomo",
      script : "./index.js",
      watch  : true,
      env: {
        ACTIVE: '1',
        NODE_PORT:"3001",
        SYMBOL: "TOMOUSDT_UMCBL",
        MARGIN_COIN: "USDT",
        MINUTES: 1,
        AMOUNT: 0.5,
        LEVERAGE: 25, // gains: 0.125
        POURCENTAGE: 1.2,
        RANGE_PERIOD: 240
      }
    },
    {
      name   : "idex",
      script : "./index.js",
      watch  : true,
      env: {
        ACTIVE: '1',
        NODE_PORT:"3002",
        SYMBOL: "IDEXUSDT_UMCBL",
        MARGIN_COIN: "USDT",
        MINUTES: 1,
        AMOUNT: 0.5, // gains: 0.10
        LEVERAGE: 20,
        POURCENTAGE: 1.3,
        RANGE_PERIOD: 240
      }
    },
    // {
    //   name   : "cyber",
    //   script : "./index.js",
    //   watch  : true,
    //   env: {
    //     ACTIVE: '1',
    //     NODE_PORT:"3003",
    //     SYMBOL: "CYBERUSDT_UMCBL",
    //     MARGIN_COIN: "USDT",
    //     MINUTES: 1,
    //     AMOUNT: 0.5, // gains: 0.10
    //     LEVERAGE: 20,
    //     POURCENTAGE: 1.6,
    //     RANGE_PERIOD: 240
    //   }
    // }
  ]
}
