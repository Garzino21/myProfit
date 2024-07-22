// mettere il profitto totale da inizio di sempre 
//metto il valore totale degli assets in USD
//metto se ho tempo grafic

window.onload = async function () {
        let _unified = $("#divUnified");
        let _funding = $("#divFunding");
        let _listProfits = $("#divListProfits");
        let _weekProfit = $("#divWeekProfit");
        let _positions = $("#divPositions");
        let _occasions = $("#divOccasions");
        let _select = $("#intervalControl");
        let coinArray = [];
        let coinMarker = 0;
        let intervalId;


        getCoinInfo();

        await getWalletBalanceUnified("UNIFIED");
        await getWalletBalanceFunding("FUND");
        await getLastWeekProfits();
        await getOpenPositions();
        intervalId = setInterval(getOccasions, 1000);
        console.log(intervalId);
        //await getMail();
        // await getTransactions();
        setInterval(getWalletBalanceUnified, 60000);
        setInterval(getWalletBalanceFunding, 60000);
        setInterval(getLastWeekProfits, 120000);
        setInterval(getOpenPositions, 60000);

        _select.on("change", function () {
                let value = _select.val();
                clearInterval(intervalId);
                intervalId = setInterval(function () {
                        getOccasions();
                }, 1000);
        }).prop("disabled", true);     

        async function getOccasions() {
                console.log(coinMarker);
                console.log(coinArray.length);
                if (coinMarker <= coinArray.length) {
                        if (coinMarker + 10 > coinArray.length) {
                                let add = coinArray.length - coinMarker;
                                for (let i = coinMarker; i < add + coinMarker; i++) {
                                        let symbol = coinArray[i];
                                        let request = inviaRichiesta("GET", "/api/occasions", { 'symbol': symbol })
                                        request.catch((err) => alert(err))
                                        request.then((occasions) => {
                                                console.log(occasions)
                                        })
                                }
                                clearInterval(intervalId);
                                console.log(intervalId);
                                console.log("clear");
                                console.log(coinMarker);
                                console.log(coinArray.length);
                        }
                        else if (coinMarker + 10 <= coinArray.length) {
                                for (let i = coinMarker; i < 10 + coinMarker; i++) {
                                        let symbol = coinArray[i];
                                        let request = inviaRichiesta("GET", "/api/occasions", { 'symbol': symbol })
                                        request.catch((err) => alert(err))
                                        request.then((occasions) => {
                                                console.log(occasions)
                                                if (occasions.data.result.list) {
                                                        let cont = 0;
                                                        let valoreOdierno = 0;
                                                        let minStoric = 100000000;

                                                        for (let item of occasions.data.result.list) {
                                                                if (cont == 0) {
                                                                        valoreOdierno = item[3];
                                                                        cont++;
                                                                }

                                                                if (minStoric > item[3]) {
                                                                        minStoric = item[3];
                                                                }
                                                        }
                                                        if (valoreOdierno < minStoric) {
                                                                let _div = $("<div>").appendTo(_occasions)
                                                                $("<div>").appendTo(_div).text(symbol).addClass("symbol");
                                                        }
                                                }
                                        })
                                }
                                coinMarker += 10;
                        }
                }
        }

        async function getCoinInfo() {
                let request = inviaRichiesta("GET", "/api/coinInfo")
                request.catch((err) => alert(err))
                request.then((coinInfo) => {
                        console.log(coinInfo)
                        for (let item of coinInfo.data.result.rows) {
                                coinArray.push(item.name + "USDT");
                        }
                })
                console.log(coinArray);
        }

        async function getTransactions() {
                let request = inviaRichiesta("GET", "/api/transactions")
                request.catch((err) => alert(err))
                request.then((transactions) => {
                        console.log(transactions)
                        //createTransactionsList(transactions);
                })
        }

        async function getMail() {
                let request = inviaRichiesta("GET", "/api/weeklyReport")
                request.catch((err) => alert(err))
                request.then((transactions) => {
                        console.log(transactions)
                })
        }


        async function getWalletBalanceUnified(accountType) {
                let request = inviaRichiesta("GET", "/api/wallet-balance", { accountType })
                request.catch((err) => alert(err))
                request.then((balance) => {
                        console.log(balance)
                        if (balance.data.result.list) {
                                _unified.text(parseFloat(balance.data.result.list[0].totalEquity).toFixed(2) + " USD");
                                $("<div>").appendTo(_unified).text("UNIFIED BALANCE").addClass("bottomDescription");
                        }
                        else
                                getWalletBalanceUnified("UNIFIED");


                })

        }

        async function getWalletBalanceFunding(accountType) {
                let request = inviaRichiesta("GET", "/api/wallet-balance-funding", { accountType })
                request.catch((err) => alert(err))
                request.then((balance) => {
                        console.log(balance)
                        if (balance.data.result.balance) {
                                _funding.text(parseFloat(balance.data.result.balance[0].walletBalance).toFixed(2) + " USD");
                                $("<div>").appendTo(_funding).text("FUNDING BALANCE").addClass("bottomDescription");
                        }
                        else {
                                getWalletBalanceFunding("FUND");

                        }
                })

        }

        async function getLastWeekProfits() {
                let request = inviaRichiesta("GET", "/api/lastWeekProfits")
                request.catch((err) => alert(err))
                request.then((profits) => {
                        console.log(profits)
                        createProfitList(profits);
                })
        }

        async function createProfitList(profits) {
                _listProfits.empty();
                let sum = 0;
                $("<div>").appendTo(_listProfits).text("LAST WEEK PROFITS").addClass("title");
                if (profits.data.result.list) {
                        for (let item of profits.data.result.list) {
                                let _div = $("<div>").appendTo(_listProfits).addClass("profitItem");
                                $("<div>").appendTo(_div).text(item.symbol).addClass("symbol");
                                if (parseFloat(item.closedPnl) < 0)
                                        $("<div>").appendTo(_div).text(parseFloat(item.closedPnl).toFixed(2)).addClass("loss");
                                else
                                        $("<div>").appendTo(_div).text(parseFloat(item.closedPnl).toFixed(2)).addClass("profit");
                                sum += parseFloat(item.closedPnl);
                        }
                        _weekProfit.text(sum.toFixed(2) + " USD");
                        $("<div>").appendTo(_weekProfit).text("WEEK PROFIT").addClass("bottomDescription");
                }

                else
                        getLastWeekProfits();
        }

        async function getOpenPositions() {
                let request = inviaRichiesta("GET", "/api/openPositions")
                request.catch((err) => alert(err))
                request.then((positions) => {
                        console.log(positions)
                        if (positions.data.result.list)
                                createOpenPositionsList(positions);
                })
        }

        async function createOpenPositionsList(positions) {
                _positions.empty();
                $("<div>").appendTo(_positions).text("OPEN POSITIONS").addClass("perfectTitle");
                if (positions.data.result.list.length == 0)
                        $("<div>").appendTo(_positions).text("No open positions...").addClass("noPositions");
                else {
                        for (let item of positions.data.result.list) {
                                let _table = $("<table>").appendTo(_positions).addClass("indentTable");
                                let _thead = $("<thead>").appendTo(_table);
                                let _tr = $("<tr>").appendTo(_thead);
                                $("<th>").appendTo(_tr).text("Symbol");
                                $("<th>").appendTo(_tr).text("Entry Price");
                                $("<th>").appendTo(_tr).text("Market Price");
                                $("<th>").appendTo(_tr).text("Unrealised PnL");
                                let _tbody = $("<tbody>").appendTo(_table);
                                _tr = $("<tr>").appendTo(_tbody).addClass("trTablePositions");
                                $("<td>").appendTo(_tr).text(item.symbol).addClass("fz15");
                                $("<td>").appendTo(_tr).text(item.avgPrice).addClass("fz15");
                                $("<td>").appendTo(_tr).text(item.markPrice).addClass("fz15");
                                if (parseFloat(item.unrealisedPnl) < 0)
                                        $("<td>").appendTo(_tr).text(parseFloat(item.unrealisedPnl).toFixed(2) + " USD").addClass("loss");
                                else
                                        $("<td>").appendTo(_tr).text(parseFloat(item.unrealisedPnl).toFixed(2) + " USD").addClass("profit");
                        }
                }

        }
}