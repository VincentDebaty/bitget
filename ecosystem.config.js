module.exports = {
  apps : [
    {
      name   : "btc",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3000",
        NODE_ENV:"development"
      }
    },
    {
      name   : "eth",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3001",
        NODE_ENV:"development"
      }
    },
    {
      name   : "xrp",
      script : "./index.js",
      watch  : true,
      env: {
        NODE_PORT:"3002",
        NODE_ENV:"development"
      }
    }
  ]
}
