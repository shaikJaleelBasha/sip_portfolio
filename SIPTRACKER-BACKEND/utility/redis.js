const redis = require("redis");

const client = redis.createClient({
    url: "redis://localhost:6379"
});

client.on("error", (error) => {
    console.error(`Redis error: ${error}`);
});

async function main(){
    await client.connect();
    await client.set("name","Rama",{EX : 10});
    console.log(`Data available: ${await client.get("name")}`);
}

main()
setInterval(async () => {
    console.log(await client.get("name"));
},3000);

module.exports = client;