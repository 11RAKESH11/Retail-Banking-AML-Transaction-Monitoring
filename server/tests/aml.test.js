const { calculateRiskScore, classifyRisk } = require("../services/aml/riskScoring");
describe("AML risk scoring", () => {
  test("caps score at 100", () => {
    expect(calculateRiskScore([70, 60])).toBe(100);
  });

  test("classifies risk levels", () => {
    expect(classifyRisk(20)).toBe("LOW");
    expect(classifyRisk(50)).toBe("MEDIUM");
    expect(classifyRisk(70)).toBe("HIGH");
    expect(classifyRisk(90)).toBe("CRITICAL");
  });
});
