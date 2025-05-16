import { SankeyD3Props } from "./diagram/SankeyD3";

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

  get irregularIncome(): number {
    return this.espp + this.netStockVestings + this.bonusNetPay;
  }

  get sankeyData(): SankeyData {
    return new SankeyData([
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
    ]);
  }
}

export type SankeyFlow = {
  source: string;
  target: string;
  value: number;
};

export class SankeyData {
  flows: SankeyFlow[];

  constructor(flows: SankeyFlow[]) {
    this.flows = flows;
  }

  append(other: SankeyData | SankeyFlow[] | SankeyFlow): void {
    if (other instanceof SankeyData) {
      this.flows = this.flows.concat(other.flows);
    } else if (Array.isArray(other)) {
      this.flows = this.flows.concat(other);
    } else {
      this.flows.push(other);
    }
  }

  get sankeyD3Data(): SankeyD3Props["data"] {
    const links = this.flows;
    const nodes: SankeyD3Props["data"]["nodes"] = [];
    links.forEach((link) => {
      if (!nodes.some((node) => node.id === link.source)) {
        nodes.push({ id: link.source });
      }
      if (!nodes.some((node) => node.id === link.target)) {
        nodes.push({ id: link.target });
      }
    });
    return { nodes, links };
  }
  get sankeymaticData(): string {
    const lines = this.flows.map(
      (link) => `${link.source} [${link.value.toFixed(2)}] ${link.target}`
    );

    return lines.join("\n");
  }
}

export type Expense = {
  name: string;
  amount: number;
};

export class ExpenseCollection {
  private expenses: Expense[];

  constructor(expenses: Expense[]) {
    this.expenses = expenses;
  }

  get length(): number {
    return this.expenses.length;
  }

  get expenseList(): Expense[] {
    return this.expenses;
  }

  get total(): number {
    return this.expenses.reduce((acc, expense) => acc + expense.amount, 0);
  }

  get names(): string[] {
    return this.expenses.map((expense) => expense.name);
  }

  get sankeyData(): SankeyData {
    const flows: SankeyFlow[] = this.expenses.map((expense) => ({
      source: "Expenses",
      target: expense.name,
      value: expense.amount,
    }));
    return new SankeyData(flows);
  }
}

export type Allocation = {
  from: "Irregular Income" | "Salary Take-Home";
  to: string;
  value: number;
};

export class AllocationCollection {
  private allocations: Allocation[];

  constructor(allocations: Allocation[]) {
    this.allocations = allocations;
  }

  get length(): number {
    return this.allocations.length;
  }

  get total(): number {
    return this.allocations.reduce(
      (acc, allocation) => acc + allocation.value,
      0
    );
  }

  get irregularTotal(): number {
    return this.allocations
      .filter((allocation) => allocation.from === "Irregular Income")
      .reduce((acc, allocation) => acc + allocation.value, 0);
  }

  get salaryTotal(): number {
    return this.allocations
      .filter((allocation) => allocation.from === "Salary Take-Home")
      .reduce((acc, allocation) => acc + allocation.value, 0);
  }

  getAllocatedAmount(name: string): number {
    return this.allocations
      .filter((allocation) => allocation.to === name)
      .reduce((acc, allocation) => acc + allocation.value, 0);
  }

  get sankeyData(): SankeyData {
    const flows: SankeyFlow[] = this.allocations.map((allocation) => ({
      source: allocation.from,
      target: allocation.to,
      value: allocation.value,
    }));
    return new SankeyData(flows);
  }
}
