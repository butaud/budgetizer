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

export class PaycheckCollection {
  private paychecks: Paycheck[];

  constructor(paychecks: Paycheck[]) {
    this.paychecks = paychecks;
  }

  get grossPay(): number {
    return this.paychecks.reduce((acc, paycheck) => acc + paycheck.grossPay, 0);
  }

  get adjustments(): number {
    return this.paychecks.reduce(
      (acc, paycheck) => acc + paycheck.adjustments,
      0
    );
  }

  get bonus(): number {
    return this.paychecks.reduce((acc, paycheck) => {
      if (paycheck.bonus) {
        return acc + paycheck.bonus;
      }
      return acc;
    }, 0);
  }

  get taxableEarnings(): number {
    return this.paychecks.reduce(
      (acc, paycheck) => acc + paycheck.taxableEarnings,
      0
    );
  }

  get taxesWithheld(): number {
    return this.paychecks.reduce(
      (acc, paycheck) => acc + paycheck.taxesWithheld,
      0
    );
  }
  get afterTaxDeductions(): number {
    return this.paychecks.reduce(
      (acc, paycheck) => acc + paycheck.afterTaxDeductions,
      0
    );
  }

  get netPay(): number {
    return this.paychecks.reduce((acc, paycheck) => acc + paycheck.netPay, 0);
  }

  get bonusNetPay(): number {
    return this.paychecks.reduce(
      (acc, paycheck) => acc + paycheck.bonusNetPay,
      0
    );
  }

  get nonBonusNetPay(): number {
    return this.paychecks.reduce(
      (acc, paycheck) => acc + paycheck.nonBonusNetPay,
      0
    );
  }

  get stockVesting(): number {
    return this.paychecks.reduce(
      (acc, paycheck) => acc + paycheck.stockVesting,
      0
    );
  }

  get netStockVestings(): number {
    return this.paychecks.reduce(
      (acc, paycheck) => acc + paycheck.netStockVestings,
      0
    );
  }

  get espp(): number {
    return this.paychecks.reduce((acc, paycheck) => acc + paycheck.espp, 0);
  }

  get rothIra(): number {
    return this.paychecks.reduce((acc, paycheck) => acc + paycheck.rothIra, 0);
  }

  get salary(): number | undefined {
    return this.paychecks.reduce((acc, paycheck) => {
      if (paycheck.salary) {
        return acc + paycheck.salary;
      }
      return acc;
    }, 0);
  }

  get grossPayIncludingStock(): number {
    return this.grossPay + this.stockVesting;
  }

  get paycheckTaxesWithheld(): number {
    return this.paychecks.reduce((acc, paycheck) => {
      if (paycheck.paycheckTaxesWithheld) {
        return acc + paycheck.paycheckTaxesWithheld;
      }
      return acc;
    }, 0);
  }

  get stockAwardTaxes(): number {
    return this.paychecks.reduce((acc, paycheck) => {
      if (paycheck.stockAwardTaxes) {
        return acc + paycheck.stockAwardTaxes;
      }
      return acc;
    }, 0);
  }

  get disabilityInsuranceDeduction(): number {
    return this.paychecks.reduce((acc, paycheck) => {
      if (paycheck.constants.disabilityInsuranceDeduction) {
        return acc + paycheck.constants.disabilityInsuranceDeduction;
      }
      return acc;
    }, 0);
  }

  get legalPlanDeduction(): number {
    return this.paychecks.reduce((acc, paycheck) => {
      if (paycheck.constants.legalPlanDeduction) {
        return acc + paycheck.constants.legalPlanDeduction;
      }
      return acc;
    }, 0);
  }

  get givingDeduction(): number {
    return this.paychecks.reduce((acc, paycheck) => {
      if (paycheck.constants.givingDeduction) {
        return acc + paycheck.constants.givingDeduction;
      }
      return acc;
    }, 0);
  }

  get sankeyData(): string {
    const lines = [];
    lines.push(`Salary [${this.salary?.toFixed(2)}] Pre-tax`);
    lines.push(`Stock [${this.stockVesting.toFixed(2)}] Pre-tax`);
    lines.push(`Bonus [${this.bonus.toFixed(2)}] Pre-tax`);

    lines.push(`Pre-tax [${this.taxesWithheld.toFixed(2)}] Taxes`);
    lines.push(`Pre-tax [*] Net Income`);

    lines.push(
      `Taxes [${this.paycheckTaxesWithheld.toFixed(2)}] Paycheck Taxes`
    );
    lines.push(`Taxes [${this.stockAwardTaxes.toFixed(2)}] Stock Taxes`);

    lines.push(
      `Net Income [${(
        this.disabilityInsuranceDeduction + this.legalPlanDeduction
      ).toFixed(2)}] Deducted Services`
    );
    lines.push(
      `Net Income [${this.givingDeduction.toFixed(2)}] Deducted Giving`
    );
    lines.push(
      `Net Income [${(this.rothIra + this.espp).toFixed(
        2
      )}] Deducted Investments`
    );
    lines.push(
      `Net Income [${this.netStockVestings.toFixed(2)}] Stock Vestings`
    );
    lines.push(`Net Income [*] Paycheck`);

    lines.push(`Deducted Investments [${this.rothIra.toFixed(2)}] Roth IRA`);
    lines.push(`Deducted Investments [${this.espp.toFixed(2)}] ESPP`);

    lines.push(`ESPP [*] Irregular Income`);
    lines.push(`Stock Vestings [*] Irregular Income`);

    lines.push(`Paycheck [${this.bonusNetPay.toFixed(2)}] Bonus Take-Home`);
    lines.push(`Bonus Take-Home [*] Irregular Income`);

    lines.push(`Paycheck [*] Salary Take-Home`);

    return lines.join("\n");
  }
}
