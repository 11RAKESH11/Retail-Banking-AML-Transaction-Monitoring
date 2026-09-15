const Transaction = require("../models/Transaction");


describe("Transaction model", () => {
  test("rejects zero amount", () => {
    const transaction = new Transaction({
      transactionId: "TXN-1",
      accountId: "507f1f77bcf86cd799439011",
      customerId: "507f1f77bcf86cd799439012",
      type: "DEPOSIT",
      amount: 0
    });
    const error = transaction.validateSync();
    expect(error.errors.amount).toBeDefined();
  });
});
