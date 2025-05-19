import { useEffect, useRef, useState } from "react";
import { Allocation, Expense, SankeyData, SankeyFlow } from "../schema";

export abstract class Collection<T> {
  protected items: T[];
  private subscriptions: (() => void)[] = [];

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

export const useExpenseCollection = (): ExpenseCollection => {
  const expenses = JSON.parse(window.localStorage.getItem("expenses") || "[]");
  const collectionRef = useRef<ExpenseCollection>(
    new ExpenseCollection(expenses)
  );

  const [, setCurrentHash] = useState(collectionRef.current.hash);

  useEffect(() => {
    return collectionRef.current.subscribe(() => {
      const newExpenses = collectionRef.current.itemList;
      window.localStorage.setItem("expenses", JSON.stringify(newExpenses));
      setCurrentHash(collectionRef.current.hash);
    });
  }, []);

  return collectionRef.current;
};

export const useAllocationCollection = (): AllocationCollection => {
  const allocations = JSON.parse(
    window.localStorage.getItem("allocations") || "[]"
  );
  const collectionRef = useRef<AllocationCollection>(
    new AllocationCollection(allocations)
  );

  const [, setCurrentHash] = useState(collectionRef.current.hash);

  useEffect(() => {
    return collectionRef.current.subscribe(() => {
      const newAllocations = collectionRef.current.itemList;
      window.localStorage.setItem(
        "allocations",
        JSON.stringify(newAllocations)
      );
      setCurrentHash(collectionRef.current.hash);
    });
  }, []);

  return collectionRef.current;
};
