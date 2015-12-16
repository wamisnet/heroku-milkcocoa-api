// JSONファイルの読み込み（ローカル用）/////////////////////////////////
var fs = require('fs');
var setting = {};
var MILKCOCOA_APP_ID = "";
var MILKCOCOA_DATASTORE_ID = "";
if( process.env.PORT ) {
    // Heroku上では環境変数から読み込む（インストール時に設定）
    MILKCOCOA_APP_ID = process.env.MILKCOCOA_APP_ID;
    MILKCOCOA_DATASTORE_ID = process.env.MILKCOCOA_DATASTORE_ID;
} else {
    // .envフォルダはあらかじめ .gitignore 対象にしておく。
    setting = JSON.parse(fs.readFileSync('.env/setting.json', 'utf8'));
    //
    MILKCOCOA_APP_ID = setting.MILKCOCOA_APP_ID;
    MILKCOCOA_DATASTORE_ID = setting.MILKCOCOA_DATASTORE_ID;
}

console.log("MILKCOCOA_APP_ID:" + MILKCOCOA_APP_ID);
console.log("MILKCOCOA_DATASTORE_ID:" + MILKCOCOA_DATASTORE_ID);

// milkcocoa /////////////////////////////////
var MilkCocoa = require("./node_modules/milkcocoa/index.js");
var milkcocoa = new MilkCocoa(MILKCOCOA_APP_ID + ".mlkcca.com");
// dataStore作成 デフォルトのデータストアIDは heroku_sample にしています。
var sampleDataStore = milkcocoa.dataStore(MILKCOCOA_DATASTORE_ID);
// データがpushされたときのイベント通知
sampleDataStore.on("push", function(datum) {
    // 内部のログ
    console.log('[push complete]');
    console.log(datum);
});
//////////////////////////////////////////////

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
    response.send('Hello Milkcocoa!');
});

app.post('/push',function(request, response) {
    // application/json
    console.log(request.body);
    sampleDataStore.push(request.body);
    response.send('back');
});

app.get('/push', function(request, response) {

    var date = new Date();
    var hour = date.getHours();

    response.send(hour+'');
    // 内部のログ
    console.log('[push datastore : ' + MILKCOCOA_DATASTORE_ID + ']');
    console.log(request.query);
    var sendValue = null;  // v値のデフォルトは null
    if(request.query.v){
        var sendValueType = request.query.type || 'string';
        sendValueType = sendValueType.toLowerCase();

        switch(request.query.type){
            case 'string':
                sendValue = request.query.v;
                break;
            case 'number':
                sendValue = Number(request.query.v);
                break;
            case 'boolean':
                sendValue = !!request.query.v;
                break;
            case 'bool':
                sendValue = !!request.query.v;
                break;
            case 'object':
                sendValue = JSON.parse(request.query.v);
                break;
            default:
                sendValue = request.query.v;
                break;
        }
    }
    sampleDataStore.push({v : sendValue});
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});