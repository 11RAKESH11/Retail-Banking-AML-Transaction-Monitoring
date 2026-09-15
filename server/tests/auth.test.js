const { calculateRiskScore, classifyRisk } = require("../services/aml/riskScoring");






describe("Basic authentication-related utility setup", () => {
  test("risk utility can be imported", () => {
    expect(calculateRiskScore([20, 30])).toBe(50);
    expect(classifyRisk(50)).toBe("MEDIUM");
  });
});
