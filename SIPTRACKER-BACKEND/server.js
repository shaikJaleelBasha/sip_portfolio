const express = require('express');
const app = express();
const authRouter = require('./routes/authRouter.js');
const investorRoutes = require('./routes/InvestorRoutes.js');
const fundRouter = require('./routes/fundRouter.js');
const sipRoutes = require('./routes/sipRoutes.js');
const db = require('./utility/dbManager.js');


app.use(express.json());
const router = express.Router();

app.use('/api/auth', authRouter);
app.use('/api', investorRoutes);
app.use('/api/funds', fundRouter);
app.use('/api/sips', sipRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});