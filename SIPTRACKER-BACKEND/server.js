const express = require('express');
const app = express();
const authRouter = require('./routes/authRouter.js');
const fundRouter = require('./routes/fundRouter.js');
const sipRoutes = require('./routes/sipRoutes.js');
const investorRoute = require('./routes/InvestorRoutes.js');
// const db = require('./utility/dbManager.js');
// const pgManager = require('./pgManager.js');
const cors = require("cors");



const poolManager = require('./poolManager.js');

app.use(cors({
    origin: "http://localhost:3001",
    credentials: true
}));
app.use(express.json());
const router = express.Router();

app.use('/api/auth', authRouter);
app.use('/api', investorRoute);
app.use('/api/funds', fundRouter);
app.use('/api/sips', sipRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});