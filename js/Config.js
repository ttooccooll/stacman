Config = Class.extend({
    API_KEY: process.env.API_KEY,
    FEE: parseInt(process.env.FEE),
    BITCOIN_VALUE: parseFloat(process.env.BITCOIN_VALUE),
});

config = new Config();