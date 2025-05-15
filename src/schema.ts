export type IncomeConstants = {
  disabilityInsuranceDeduction: number;
  legalPlanDeduction: number;
  givingDeduction: number;
  esppRate: number;
};

export class Paycheck {
  constants: IncomeConstants;
  date: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossPay: number;
  adjustments: number;
  taxableEarnings: number;
  taxesWithheld: number;
  afterTaxDeductions: number;
  netPay: number;

  salary?: number;
  perksPlus?: number;
  stockAwardTaxes?: number;

  constructor(
    constants: IncomeConstants,
    date: string,
    payPeriodStart: string,
    payPeriodEnd: string,
    grossPay: number,
    adjustments: number,
    taxableEarnings: number,
    taxesWithheld: number,
    afterTaxDeductions: number,
    netPay: number
  ) {
    this.constants = constants;
    this.date = date;
    this.payPeriodStart = payPeriodStart;
    this.payPeriodEnd = payPeriodEnd;
    this.grossPay = grossPay;
    this.adjustments = adjustments;
    this.taxableEarnings = taxableEarnings;
    this.taxesWithheld = taxesWithheld;
    this.afterTaxDeductions = afterTaxDeductions;
    this.netPay = netPay;
  }

  get bonus(): number | undefined {
    if (!this.salary) return undefined;
    return this.grossPay - this.salary - (this.perksPlus ?? 0);
  }

  get stockVesting(): number {
    return this.adjustments - this.constants.disabilityInsuranceDeduction;
  }

  get paycheckTaxesWithheld(): number {
    return this.taxesWithheld - (this.stockAwardTaxes ?? 0);
  }

  get salaryPaycheckRatio(): number | undefined {
    if (!this.salary) return undefined;
    return (this.salary + (this.perksPlus ?? 0)) / this.grossPay;
  }

  get estSalaryTaxesWithheld(): number | undefined {
    if (!this.salaryPaycheckRatio || !this.paycheckTaxesWithheld)
      return undefined;
    return this.salaryPaycheckRatio * this.paycheckTaxesWithheld;
  }

  get estBonusTaxesWithheld(): number | undefined {
    if (!this.paycheckTaxesWithheld || !this.estSalaryTaxesWithheld)
      return undefined;
    return this.paycheckTaxesWithheld - this.estSalaryTaxesWithheld;
  }

  get nonStockAfterTaxDeductions(): number {
    return (
      this.afterTaxDeductions - this.stockVesting + (this.stockAwardTaxes ?? 0)
    );
  }

  get nonInvestmentAfterTaxDeductions(): number {
    return (
      this.constants.disabilityInsuranceDeduction +
      this.constants.legalPlanDeduction +
      this.constants.givingDeduction
    );
  }

  get investmentAfterTaxDeductions(): number {
    return (
      this.nonStockAfterTaxDeductions - this.nonInvestmentAfterTaxDeductions
    );
  }

  get espp(): number {
    return (this.grossPay - (this.perksPlus ?? 0)) * this.constants.esppRate;
  }

  get rothIra(): number {
    return this.investmentAfterTaxDeductions - this.espp;
  }

  get bonusNetPay(): number {
    return (this.bonus ?? 0) - (this.estBonusTaxesWithheld ?? 0);
  }

  get nonBonusNetPay(): number {
    return this.netPay - this.bonusNetPay;
  }

  get netStockVestings(): number {
    return this.stockVesting - (this.stockAwardTaxes ?? 0);
  }
}
