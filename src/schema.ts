export type IncomeConstants = {
  disabilityInsuranceDeduction: number;
  legalPlanDeduction: number;
  givingDeduction: number;
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
}
