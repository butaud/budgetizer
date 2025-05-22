import { useEffect, useRef, useState } from "react";
import {
  Allocation,
  Expense,
  Paycheck,
  SankeyData,
  SankeyFlow,
} from "../schema";

export abstract class Collection<T> {
  protected items: T[];
  private subscriptions: (() => void)[] = [];
  private shouldNotify = true;

  constructor(items: T[]) {
    this.items = items;
  }
  subscribe(callback: () => void): () => void {
    this.subscriptions.push(callback);
    return () => {
      const index = this.subscriptions.indexOf(callback);
      if (index !== -1) {
        this.subscriptions.splice(index, 1);
      }
    };
  }
  private notify(): void {
    if (!this.shouldNotify) return;
    this.subscriptions.forEach((callback) => callback());
  }
  get length(): number {
    return this.items.length;
  }
  get itemList(): T[] {
    return this.items;
  }

  abstract hashItem(item: T): string;
  get hash(): string {
    return this.items.map((item) => this.hashItem(item)).join(",");
  }

  abstract areItemsEqual(item1: T, item2: T): boolean;

  findItemIndex(item: T): number {
    return this.items.findIndex((i) => this.areItemsEqual(i, item));
  }

  beginTransaction(): void {
    this.shouldNotify = false;
  }

  commitTransaction(): void {
    this.shouldNotify = true;
    this.notify();
  }

  upsertItem(item: T): void {
    const index = this.findItemIndex(item);
    if (index !== -1) {
      this.items[index] = item;
    } else {
      this.items.push(item);
    }
    this.notify();
  }
  removeItem(item: T): void {
    const index = this.findItemIndex(item);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.notify();
    }
  }

  empty(): void {
    this.items = [];
    this.notify();
  }

  sum(callback: (item: T) => number): number {
    return this.items.reduce((acc, item) => acc + callback(item), 0);
  }
}

export class PaycheckCollection extends Collection<Paycheck> {
  hashItem(item: Paycheck): string {
    return item.stringify();
  }

  areItemsEqual(item1: Paycheck, item2: Paycheck): boolean {
    return item1.date === item2.date;
  }

  get grossPay(): number {
    return this.sum((paycheck) => paycheck.grossPay);
  }

  get adjustments(): number {
    return this.sum((paycheck) => paycheck.adjustments);
  }

  get bonus(): number {
    return this.sum((paycheck) => paycheck.bonus ?? 0);
  }

  get taxableEarnings(): number {
    return this.sum((paycheck) => paycheck.taxableEarnings);
  }

  get taxesWithheld(): number {
    return this.sum((paycheck) => paycheck.taxesWithheld);
  }
  get afterTaxDeductions(): number {
    return this.sum((paycheck) => paycheck.afterTaxDeductions);
  }

  get netPay(): number {
    return this.sum((paycheck) => paycheck.netPay);
  }

  get bonusNetPay(): number {
    return this.sum((paycheck) => paycheck.bonusNetPay);
  }

  get nonBonusNetPay(): number {
    return this.sum((paycheck) => paycheck.nonBonusNetPay);
  }

  get stockVesting(): number {
    return this.sum((paycheck) => paycheck.stockVesting);
  }

  get netStockVestings(): number {
    return this.sum((paycheck) => paycheck.netStockVestings);
  }

  get espp(): number {
    return this.sum((paycheck) => paycheck.espp);
  }

  get rothIra(): number {
    return this.sum((paycheck) => paycheck.rothIra);
  }

  get salary(): number | undefined {
    return this.sum((paycheck) => paycheck.salary ?? 0);
  }

  get grossPayIncludingStock(): number {
    return this.grossPay + this.stockVesting;
  }

  get paycheckTaxesWithheld(): number {
    return this.sum((paycheck) => paycheck.paycheckTaxesWithheld);
  }

  get stockAwardTaxes(): number {
    return this.sum((paycheck) => paycheck.stockAwardTaxes ?? 0);
  }

  get disabilityInsuranceDeduction(): number {
    return this.sum(
      (paycheck) => paycheck.constants.disabilityInsuranceDeduction
    );
  }

  get legalPlanDeduction(): number {
    return this.sum((paycheck) => paycheck.constants.legalPlanDeduction);
  }

  get givingDeduction(): number {
    return this.sum((paycheck) => paycheck.constants.givingDeduction);
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

export class ExpenseCollection extends Collection<Expense> {
  hashItem(item: Expense): string {
    return `${item.name}:${item.amount}`;
  }

  areItemsEqual(item1: Expense, item2: Expense): boolean {
    return item1.id === item2.id;
  }

  get total(): number {
    return this.items.reduce((acc, expense) => acc + expense.amount, 0);
  }

  get names(): string[] {
    return this.items.map((expense) => expense.name);
  }

  get sankeyData(): SankeyData {
    const flows: SankeyFlow[] = this.items.map((expense) => ({
      source: "Expenses",
      target: expense.name,
      value: expense.amount,
    }));
    return new SankeyData(flows);
  }
}

export class AllocationCollection extends Collection<Allocation> {
  hashItem(item: Allocation): string {
    return `${item.from}:${item.to}:${item.value}`;
  }
  areItemsEqual(item1: Allocation, item2: Allocation): boolean {
    return item1.from === item2.from && item1.to === item2.to;
  }

  get total(): number {
    return this.itemList.reduce((acc, allocation) => acc + allocation.value, 0);
  }

  get irregularTotal(): number {
    return this.itemList
      .filter((allocation) => allocation.from === "Irregular Income")
      .reduce((acc, allocation) => acc + allocation.value, 0);
  }

  get salaryTotal(): number {
    return this.itemList
      .filter((allocation) => allocation.from === "Salary Take-Home")
      .reduce((acc, allocation) => acc + allocation.value, 0);
  }

  getAllocatedAmount(name: string): number {
    return this.itemList
      .filter((allocation) => allocation.to === name)
      .reduce((acc, allocation) => acc + allocation.value, 0);
  }

  get sankeyData(): SankeyData {
    const flows: SankeyFlow[] = this.itemList.map((allocation) => ({
      source: allocation.from,
      target: allocation.to,
      value: allocation.value,
    }));
    return new SankeyData(flows);
  }
}

export const useCollection = <ItemType, C extends Collection<ItemType>>(
  key: string,
  factory: (items: ItemType[]) => C,
  itemFactory?: (itemRaw: any) => ItemType
): C => {
  const items = itemFactory
    ? JSON.parse(window.localStorage.getItem(key) || "[]").map(itemFactory)
    : JSON.parse(window.localStorage.getItem(key) || "[]");
  const collectionRef = useRef<C>(factory(items));
  const [, setCurrentHash] = useState(collectionRef.current.hash);
  useEffect(() => {
    return collectionRef.current.subscribe(() => {
      const newItems = collectionRef.current.itemList;
      window.localStorage.setItem(key, JSON.stringify(newItems));
      setCurrentHash(collectionRef.current.hash);
    });
  }, [key]);
  return collectionRef.current;
};
