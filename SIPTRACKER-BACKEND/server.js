const express = require('express');
const app = express();
const authRouter = require('./routes/authRouter.js');
const investorRoutes = require('./routes/InvestorRoutes.js');
const fundRouter = require('./routes/fundRouter.js');
const sipRoutes = require('./routes/sipRoutes.js');
//const db = require('./utility/dbManager.js');
const pgd = require('./utility/pgManager.js');
const {connectRedis} = require("./utility/redis.js");

connectRedis();
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api', investorRoutes);
app.use('/api/funds', fundRouter);
app.use('/api/sips', sipRoutes);

app.get("/", (req, res) => {
  res.json({
    success : true,
    message : "SIP Tracker Backend Running"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Server is running on port ${PORT}`
    );
});