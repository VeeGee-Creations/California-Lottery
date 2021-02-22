const lotteryRepo = (function () {
    let pagenumber = 1;
    let drawGameId = undefined;
    const gameData = [];
    const allRegNum = [];
    const allSpecNum = [];
    const mostCommon = [];
    const mostCommonSpecial = [];
    const apiUrl = 'https://www.calottery.com/api/DrawGameApi/DrawGamePastDrawResults/';
    
    document.addEventListener('DOMContentLoaded', () => {
        document
        .getElementById('gameId')
        .addEventListener('input', handleSelect);
    });
    
    function handleSelect (event) {
        const select = event.target;
        drawGameId = select.value;
        pagenumber = 1;
        gameData.length = 0;
        allRegNum.length = 0;
        allSpecNum.length = 0;
        mostCommonSpecial.length = 0;
        mostCommon.length = 0;
        showLoading();
        flipPage();
    }

    // Load Data Table Header Based On Game
    function loadHeader() {
        const table = document.querySelector("body > main > table");
        const headerRow = document.querySelector("#table-head > tr");
        const createdHeader = document.querySelector("#special");
        const header = document.createElement('th');

        switch (drawGameId) {
            case '8':
            case '12':
            case '15':
                // Create Header For Games With Special Number
                if (!createdHeader) {
                    header.setAttribute('id', 'special');
                    switch (drawGameId) {
                        case '8':
                        case '15':
                            header.innerText = 'Mega';
                            headerRow.appendChild(header);
                            break;
                        case '12':
                            header.innerText = 'Power';
                            headerRow.appendChild(header);
                            break;
                        default:
                            break;
                    }
                }
                if (createdHeader) {
                    switch (drawGameId) {
                        case '8':
                        case '15':
                            createdHeader.innerText = 'Mega';
                            break;
                        case '12':
                            createdHeader.innerText = 'Power';
                            break;
                        default:
                            break;
                    }
                }
                break;
            case '9':
            case '10':
            case '14':
                // Create Header For Games With No Special Number
                if (createdHeader) {
                    createdHeader.parentElement.removeChild(createdHeader);
                }
                break;
            default:
                break;
        }

        loadTable();

        // Show Data Table
        if (table.hasAttribute('hidden')) {
            table.removeAttribute('hidden');
        }

        calcNumbers();
    }

    function calcNumbers() {
        const comDiv = document.querySelector("#hide");

        switch (drawGameId) {
            case '8':
            case '12':
            case '15':
                lotteryCartographer(5, allRegNum);
                lotteryCartographer(1, allSpecNum);
                loadResults();
                comDiv.removeAttribute('hidden');
                break;
            case '9':
                lotteryCartographer(3, allRegNum);
                loadResults();
                comDiv.removeAttribute('hidden');
                break;
            case '10':
                lotteryCartographer(5, allRegNum);
                loadResults();
                comDiv.removeAttribute('hidden');
                break;
            case '14':
                lotteryCartographer(4, allRegNum);
                loadResults();
                comDiv.removeAttribute('hidden');
                break;
            default:
                break;
        }
    }

    function loadResults() {
        const regNum = document.querySelector("#reg-numbers");
        const specTit = document.querySelector("#special-title");
        const specNum = document.querySelector("#special-number");

        switch (drawGameId) {
            case '8':
            case '12':
            case '15':
                regNum.innerText = mostCommon.toString().replace(/,/g, ' ');
                specNum.innerText= mostCommonSpecial;
                switch (drawGameId) {
                    case '8':
                    case '15':
                        specTit.innerText = 'Most Common Mega Number';
                        break;
                    case '12':
                        specTit.innerText = 'Most Common Power Number';
                        break;
                    default:
                        break;
                }
                break;
            case '9':
            case '10':
            case '14':
                regNum.innerText = mostCommon.toString().replace(/,/g, ' ');
                specNum.innerText = '';
                specTit.innerText = '';
                break;
            default:
                break;
        }
    }

    // Load Table Based On Game Chosen
    function loadTable() {
        const tableBody = document.querySelector("#table-body");
        let dataHtml = '';

        switch (drawGameId) {
            case '8':
            case '12':
            case '15':
                // Populate Table For Games With Special Number
                gameData.forEach(function (game) {
                    dataHtml += `<tr><td>${game.drawDate}</td><td>${game.drawNumber}</td><td>${game.winningNumbers}</td><td>${game.specialNumber}</td></tr>`;
                });

                tableBody.innerHTML = dataHtml.replace(/,/g, ' ');
                break;
            case '9':
            case '10':
            case '14':
                // Populate Table For Games With No Special Number
                gameData.forEach(function (game) {
                    dataHtml += `<tr><td>${game.drawDate}</td><td>${game.drawNumber}</td><td>${game.winningNumbers}</td></tr>`;
                });

                tableBody.innerHTML = dataHtml.replace(/,/g, ' ');
                break;
            default:
                break;
        }
    }

    // Fetch Data From All API Pages
    async function flipPage() {
        const target = apiUrl + drawGameId + '/' + pagenumber + '/' + 50;
        await fetch(target).then(function(response){
            if (response.ok) {
                return response.json();
            }
        }).then(function(json){
            if (json.PreviousDraws.length > 0) {
                json.PreviousDraws.forEach(function(game){
                    const regularWinning = [];
                    let specialWinning = undefined;
                    const winningNumber = game.WinningNumbers;
                    for (let val in winningNumber) {
                        if (!winningNumber[val].IsSpecial) {
                            regularWinning.push(parseInt(winningNumber[val].Number, 10));
                            allRegNum.push(parseInt(winningNumber[val].Number, 10));
                        }
                        else {
                            specialWinning = parseInt(winningNumber[val].Number, 10);
                            allSpecNum.push(parseInt(winningNumber[val].Number, 10));
                        }
                    };
                    const data = {
                        drawDate: game.DrawDate.slice(0, 10),
                        drawNumber: game.DrawNumber,
                        winningNumbers: regularWinning,
                        specialNumber: specialWinning,
                    };
                    gameData.push(data);
                });
                pagenumber++;
                flipPage();
            }
            if (json.PreviousDraws.length < 1) {
                hideLoading();
                loadHeader();
            }
        }).catch(error => console.log(error));
    }

    // Map Frequency Of Winning Numbers
    function lotteryCartographer(pull, arr) {
        const lotteryMap = new Map();
        const getMax = function (lotMap) {
            let maxValue;
            let maxKey;

            for (let key of lotMap.keys()) {
                let value = lotMap.get(key);

                if (!maxValue || maxValue < value) {
                    maxValue = value;
                    maxKey = key;
                }
            }
            if (arr.length === allRegNum.length) {
                mostCommon.push(maxKey);
            }
            else {
                mostCommonSpecial.push(maxKey);
            }
            lotteryMap.delete(maxKey);
        }

        for (let num of arr) {
            if (lotteryMap.has(num)) {
                lotteryMap.set(num, (lotteryMap.get(num)) + 1);
            }
            else {
                lotteryMap.set(num, 1);
            }
        }
        
        for (let i = 0; i < pull; i++) {
            getMax(lotteryMap);
        }
    }

    // Show Loading Message
    function showLoading() {
        const loadingMessage = document.querySelector("#loading-message");
        const table = document.querySelector("body > main > table");
        const comDiv = document.querySelector("#hide");

        // Hide Data Table
        if (!table.hasAttribute('hidden')) {
            table.setAttribute('hidden', '');
        }

        if (!comDiv.hasAttribute('hidden')) {
            comDiv.setAttribute('hidden', '');
        }

        loadingMessage.removeAttribute('hidden');
    }

    // Hide Loading Message
    function hideLoading() {
        const loadingMessage = document.querySelector("#loading-message");

        loadingMessage.setAttribute('hidden', '');
    }

    function getGameData() {
        return gameData;
    }

})();