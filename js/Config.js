Config = Class.extend({
    API_KEY: process.env.API_KEY,
    FEE: process.env.FEE,
    BITCOIN_VALUE: process.env.BITCOIN_VALUE,
  });
  
  config = new Config();