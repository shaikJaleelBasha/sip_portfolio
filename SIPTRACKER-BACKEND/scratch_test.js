const { getInvestorNetWorth, getInvestorHoldings, getInvestorDashboardTransactions, getInvestorRecentPayments } = require('./controller/InvestorController.js');

const req = {
  params: {
    investorId: 19
  }
};

const res = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log(`Status: ${this.statusCode}`);
    console.log(JSON.stringify(data, null, 2));
    return this;
  }
};

async function run() {
  console.log("--- Net Worth ---");
  await getInvestorNetWorth(req, res);
  
  console.log("\n--- Holdings ---");
  await getInvestorHoldings(req, res);
  
  console.log("\n--- Transactions ---");
  await getInvestorDashboardTransactions(req, res);
  
  console.log("\n--- Recent Payments ---");
  await getInvestorRecentPayments(req, res);

  process.exit(0);
}

run();
