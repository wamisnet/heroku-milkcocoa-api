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
    console.log(request);
    if(!!request.body){
        console.log('+++++body');
        if(Object.keys(request.body).length > 0){
            console.log('+++++pushed');
            sampleDataStore.push(request.body);
        }
    }
    response.send('pushed!');
});

app.post('/send',function(request, response) {
    // application/json
    console.log(request);
    if(!!request.body){
        if(Object.keys(request.body).length > 0){
            sampleDataStore.send(request.body);
        }
    }
    response.send('sended!');
});

app.post('/set',function(request, response) {
    // application/json

    if(!!request.body){
        if(Object.keys(request.body).length > 0){
            var data_id = request.body.id;
            var data_params = request.body.params;

            sampleDataStore.set(data_id, data_params);
        }
    }
    response.send('setted!');
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});