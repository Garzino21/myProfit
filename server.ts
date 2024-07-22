import { coerceInteger } from "openai/core";
import { symbolName } from "typescript";
const _nodemailer = require("nodemailer");
//faccio un app angular che mi fa una richiesta a questo server ogni settimana e mese

// Importing required modules
const _express = require('express');
const dotenv = require('dotenv');
const { RestClientV5 } = require('bybit-api');

dotenv.config({ "path": ".env" });

const app = _express();

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log("Server is running on port 3000");
});

// Setting up middlewares
app.use("/", _express.static("./static"));
app.use("/", (req, res, next) => {
    console.log("-----> ${req.method}: ${req.originalUrl}");
    next();
});

app.use("/", _express.static("./static"));
app.use("/", _express.json({ "limit": "50mb" }));
app.use("/", _express.urlencoded({ "limit": "50mb", "extended": true }));
app.use("/", (req, res, next) => {
    if (Object.keys(req["query"]).length > 0) {
        console.log(`       ${JSON.stringify(req["query"])}`);
    }
    if (Object.keys(req["body"]).length > 0) {
        console.log(`       ${JSON.stringify(req["body"])}`);
    }
    next();
});

const auth = { user: process.env.mail, pass: process.env.password };
const transporter = _nodemailer.createTransport({
    service: 'gmail',
    auth: auth
});

// Setting up routes
app.get('/api/openPositions', (req, res) => {
    let symbol = req["query"]["symbol"];
    const client = new RestClientV5({
        testnet: false,
        key: 'vZu16sERUzefXtrZr9',
        secret: '3e5l1IsyIVFoD09dH9Ul8263Z1KOuyTTV9J9',
    });

    client.getPositionInfo({
        category: "linear",
        openOnly: 0,
        settleCoin: "USDT",
        limit: 50,
    })
        .catch((error) => {
            res.send(JSON.stringify(error));
        })
        .then((response) => {
            res.send(JSON.stringify(response));
        });
});

app.get('/api/coinInfo', (req, res) => {
    const client = new RestClientV5({
        testnet: false,
        key: 'vZu16sERUzefXtrZr9',
        secret: '3e5l1IsyIVFoD09dH9Ul8263Z1KOuyTTV9J9',
    });

    client.getCoinInfo()
        .catch((error) => {
            res.send(JSON.stringify(error));
        })
        .then((response) => {
            res.send(JSON.stringify(response));
        });
});

app.get('/api/occasions', (req, res) => {
    let symbol = req["query"]["symbol"];
    const client = new RestClientV5({
        testnet: false,
        key: 'vZu16sERUzefXtrZr9',
        secret: '3e5l1IsyIVFoD09dH9Ul8263Z1KOuyTTV9J9',
    });

    client.getIndexPriceKline({
        category: "linear",
        symbol: symbol,
        interval: "M",
    })
        .catch((error) => {
            res.send(JSON.stringify(error));
        })
        .then((response) => {
            res.send(JSON.stringify(response));
        });
});

app.get('/api/wallet-balance', (req, res) => {
    let accountType = req["query"]["accountType"];
    const client = new RestClientV5({
        testnet: false,
        key: 'vZu16sERUzefXtrZr9',
        secret: '3e5l1IsyIVFoD09dH9Ul8263Z1KOuyTTV9J9',
    });

    client.getWalletBalance({
        accountType: accountType,
    })
        .catch((error) => {
            res.send(JSON.stringify(error));
        })
        .then((response) => {
            res.send(JSON.stringify(response));
        });
});

app.get('/api/weeklyReport', (req, res) => {
    let sum=0;
    const client = new RestClientV5({
        testnet: false,
        key: 'vZu16sERUzefXtrZr9',
        secret: '3e5l1IsyIVFoD09dH9Ul8263Z1KOuyTTV9J9',
    });

    client.getClosedPnL({
        category: "linear",
    })
        .catch((error) => {
            res.send(JSON.stringify(error));
        })
        .then((response) => {
            console.log(JSON.stringify(response));
            for (let item of response.result.list) {
                sum += parseFloat(item.closedPnl);
            }
            console.log(sum);
            res.send(sum.toString());
        });

    let mailOptions = {
        from: auth.user,
        to: auth.user,
        subject: 'WEEKLY PROFIT',
        text: `Questa settimana hai un profitto netto di: ${sum} USD`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            res.send('Email sent: ' + info.response);
        }
    });
});



app.get('/api/transactions', (req, res) => {
    const client = new RestClientV5({
        testnet: false,
        key: 'vZu16sERUzefXtrZr9',
        secret: '3e5l1IsyIVFoD09dH9Ul8263Z1KOuyTTV9J9',
    });

    client.getTransactionLog({
    })
        .catch((error) => {
            res.send(JSON.stringify(error));
        })
        .then((response) => {
            res.send(JSON.stringify(response));
        });
});

app.get('/api/wallet-balance-funding', (req, res) => {
    let accountType = req["query"]["accountType"];
    const client = new RestClientV5({
        testnet: false,
        key: 'vZu16sERUzefXtrZr9',
        secret: '3e5l1IsyIVFoD09dH9Ul8263Z1KOuyTTV9J9',
    });

    client.getAllCoinsBalance({
        accountType: accountType,
        coin: "USDT",
    })
        .catch((error) => {
            res.send(JSON.stringify(error));
        })
        .then((response) => {
            res.send(JSON.stringify(response));
        });
});

app.get('/api/lastWeekProfits', (req, res) => {
    const client = new RestClientV5({
        testnet: false,
        key: 'vZu16sERUzefXtrZr9',
        secret: '3e5l1IsyIVFoD09dH9Ul8263Z1KOuyTTV9J9',
    });


    client.getClosedPnL({
        category: "linear",
    })
        .catch((error) => {
            res.send(JSON.stringify(error));
        })
        .then((response) => {
            res.send(JSON.stringify(response));
        });
});

// app.get('/api/openPositions', (req, res) => {
//     const client = new RestClientV5({
//         testnet: false,
//         key: 'vZu16sERUzefXtrZr9',
//         secret: '3e5l1IsyIVFoD09dH9Ul8263Z1KOuyTTV9J9',
//     });


//     client.getPositionInfo({
//         category: "linear",
//         symbol:"BTCUSDT",
//     })
//         .catch((error) => {
//             res.send(JSON.stringify(error));
//         })
//         .then((response) => {
//             res.send(JSON.stringify(response));
//         });
// });



