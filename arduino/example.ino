#include <ESP8266WiFi.h>
#include <ArduinoJson.h>

/************************* WiFi Access Point *********************************/

#define WLAN_SSID           "...ssid..."
#define WLAN_PASS           "...pass..."

/************************* Milkcocoa Setting *********************************/

#define MILKCOCOA_DATA_ID   "...milkcocoa_data_id..."
#define MILKCOCOA_DATA_KEY  "...milkcocoa_data_key..."
#define HEROKU_URL          "nefrytest.herokuapp.com"

// Create an ESP8266 WiFiClient class to connect to the MQTT server.
WiFiClient client;

char server[] = HEROKU_URL;
boolean write_flag = false;
String data = "";

void setup() {
  Serial.begin(115200);
  delay(10);

  Serial.println(F("HTTP GET"));

  // Connect to WiFi access point.
  Serial.println(); Serial.println();
  Serial.print("Connecting to ");
  Serial.println(WLAN_SSID);

  WiFi.begin(WLAN_SSID, WLAN_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  if (client.connect(server, 80)) {
    Serial.println("connected");
    // Make a HTTP request:
    client.println("GET /get?id=" MILKCOCOA_DATA_ID " HTTP/1.1");
    client.println("Host: " HEROKU_URL);
    client.println("Connection: close");
    client.println();
  } else {
    // if you didn't get a connection to the server:
    Serial.println("connection failed");
  }

};

void loop() {
  // if there are incoming bytes available
  // from the server, read them and print them:
  if (client.available()) {
    char c = client.read();
    Serial.print(c);
    if(c=='{'){
      write_flag = true;
    }
    if(write_flag){
      data = data + c;
    }
  }

  // if the server's disconnected, stop the client:
  if (!client.connected()) {
    const char *json = data.c_str();

    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(json);
    const char* v = root["value"][MILKCOCOA_DATA_KEY];
    Serial.println("\nGet value from milkcocoa Below");
    Serial.println(v);
    Serial.println("disconnecting.");
    client.stop();

    // do nothing forevermore:
    while (true);
  }
}

