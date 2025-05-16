import { SankeyD3Props } from "./SankeyD3";

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

  stringify(): string {
    return JSON.stringify({
      date: this.date,
      payPeriodStart: this.payPeriodStart,
      payPeriodEnd: this.payPeriodEnd,
      grossPay: this.grossPay,
      adjustments: this.adjustments,
      taxableEarnings: this.taxableEarnings,
      taxesWithheld: this.taxesWithheld,
      afterTaxDeductions: this.afterTaxDeductions,
      netPay: this.netPay,
      salary: this.salary,
      perksPlus: this.perksPlus,
      stockAwardTaxes: this.stockAwardTaxes,
      constants: this.constants,
    });
  }

  static fromString(data: string): Paycheck {
    const parsedData = JSON.parse(data);
    const paycheck = new Paycheck(
      parsedData.constants,
      parsedData.date,
      parsedData.payPeriodStart,
      parsedData.payPeriodEnd,
      parsedData.grossPay,
      parsedData.adjustments,
      parsedData.taxableEarnings,
      parsedData.taxesWithheld,
      parsedData.afterTaxDeductions,
      parsedData.netPay
    );
    paycheck.salary = parsedData.salary;
    paycheck.perksPlus = parsedData.perksPlus;
    paycheck.stockAwardTaxes = parsedData.stockAwardTaxes;
    return paycheck;
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

  stringify(): string {
    return JSON.stringify(
      this.paychecks.map((paycheck) => paycheck.stringify())
    );
  }

  static fromString(data: string): PaycheckCollection {
    const parsedData = JSON.parse(data);
    const paychecks = parsedData.map((paycheckData: string) =>
      Paycheck.fromString(paycheckData)
    );
    return new PaycheckCollection(paychecks);
  }

  get length(): number {
    return this.paychecks.length;
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

  get sankeyD3Data(): SankeyD3Props["data"] {
    const nodes: SankeyD3Props["data"]["nodes"] = [
      { id: "Salary", name: "Salary" },
      { id: "Stock", name: "Stock" },
      { id: "Bonus", name: "Bonus" },
      { id: "Pre-tax", name: "Pre-tax" },
      { id: "Taxes", name: "Taxes" },
      { id: "Net Income", name: "Net Income" },
      { id: "Paycheck", name: "Paycheck" },
      { id: "Deducted Services", name: "Deducted Services" },
      { id: "Deducted Investments", name: "Deducted Investments" },
      { id: "Deducted Giving", name: "Deducted Giving" },
      { id: "Irregular Income", name: "Irregular Income" },
      { id: "Paycheck Taxes", name: "Paycheck Taxes" },
      { id: "Stock Taxes", name: "Stock Taxes" },
      { id: "Roth IRA", name: "Roth IRA" },
      { id: "ESPP", name: "ESPP" },
      { id: "Stock Vestings", name: "Stock Vestings" },
      { id: "Bonus Take-Home", name: "Bonus Take-Home" },
      { id: "Salary Take-Home", name: "Salary Take-Home" },
    ];
    const links: SankeyD3Props["data"]["links"] = [
      {
        source: "Salary",
        target: "Pre-tax",
        value: this.salary ?? 0,
      },
      {
        source: "Stock",
        target: "Pre-tax",
        value: this.stockVesting,
      },
      {
        source: "Bonus",
        target: "Pre-tax",
        value: this.bonus,
      },
      {
        source: "Pre-tax",
        target: "Taxes",
        value: this.taxesWithheld,
      },
      {
        source: "Pre-tax",
        target: "Net Income",
        value: this.grossPayIncludingStock - this.taxesWithheld,
      },
      {
        source: "Taxes",
        target: "Paycheck Taxes",
        value: this.paycheckTaxesWithheld,
      },
      {
        source: "Taxes",
        target: "Stock Taxes",
        value: this.stockAwardTaxes,
      },
      {
        source: "Net Income",
        target: "Deducted Services",
        value: this.disabilityInsuranceDeduction + this.legalPlanDeduction,
      },
      {
        source: "Net Income",
        target: "Deducted Giving",
        value: this.givingDeduction,
      },
      {
        source: "Net Income",
        target: "Deducted Investments",
        value: this.rothIra + this.espp,
      },
      {
        source: "Net Income",
        target: "Stock Vestings",
        value: this.netStockVestings,
      },
      {
        source: "Net Income",
        target: "Paycheck",
        value: this.nonBonusNetPay + this.bonusNetPay,
      },
      {
        source: "Deducted Investments",
        target: "Roth IRA",
        value: this.rothIra,
      },
      {
        source: "Deducted Investments",
        target: "ESPP",
        value: this.espp,
      },
      {
        source: "ESPP",
        target: "Irregular Income",
        value: this.espp,
      },
      {
        source: "Stock Vestings",
        target: "Irregular Income",
        value: this.netStockVestings,
      },
      {
        source: "Paycheck",
        target: "Bonus Take-Home",
        value: this.bonusNetPay,
      },
      {
        source: "Bonus Take-Home",
        target: "Irregular Income",
        value: this.bonusNetPay,
      },
      {
        source: "Paycheck",
        target: "Salary Take-Home",
        value: this.nonBonusNetPay,
      },
    ];
    return { nodes, links };
  }

  get sankeymaticData(): string {
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
    lines.push("size w 1200\n  h 600");

    return lines.join("\n");
  }
}
