const redis = require("redis");

const redisClient = redis.createClient({
    url: "redis://localhost:6379"
});

redisClient.on("connect", () => {
    console.log("Redis Connected Successfully... ");
});

redisClient.on("error", (error) => {
    console.error(`Redis error: ${error}`);
});

const connectRedis = async () => {
    if(!redisClient.isOpen){
        await redisClient.connect();
    }
};

module.exports = {
    redisClient,
    connectRedis
}