import { useEffect, useRef, useState } from "react";
import { Allocation, Expense, SankeyData, SankeyFlow } from "../schema";

export class ExpenseCollection {
  private expenses: Expense[];
  private subscriptions: (() => void)[] = [];

  constructor(expenses: Expense[]) {
    this.expenses = expenses;
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

  get hash(): string {
    return this.expenses
      .map((expense) => `${expense.name}:${expense.amount}`)
      .join(",");
  }

  upsertExpense(expense: Expense): void {
    const index = this.expenses.findIndex((e) => e.id === expense.id);
    if (index !== -1) {
      this.expenses[index] = expense;
    } else {
      this.expenses.push(expense);
    }
    this.notify();
  }
  removeExpense(expense: Expense): void {
    const index = this.expenses.findIndex((e) => e.id === expense.id);
    if (index !== -1) {
      this.expenses.splice(index, 1);
      this.notify();
    }
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

export class AllocationCollection {
  private allocations: Allocation[];
  private subscriptions: (() => void)[] = [];

  constructor(allocations: Allocation[]) {
    this.allocations = allocations;
  }

  get length(): number {
    return this.allocations.length;
  }

  get allocationList(): Allocation[] {
    return this.allocations;
  }

  get hash(): string {
    return this.allocations
      .map(
        (allocation) =>
          `${allocation.from}:${allocation.to}:${allocation.value}`
      )
      .join(",");
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

  upsertAllocation(allocation: Allocation): void {
    const index = this.allocations.findIndex(
      (a) => a.from === allocation.from && a.to === allocation.to
    );
    if (index !== -1) {
      this.allocations[index] = allocation;
    } else {
      this.allocations.push(allocation);
    }
    this.notify();
  }

  removeAllocation(allocation: Allocation): void {
    const index = this.allocations.findIndex(
      (a) => a.from === allocation.from && a.to === allocation.to
    );
    if (index !== -1) {
      this.allocations.splice(index, 1);
      this.notify();
    }
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

export const useExpenseCollection = (): ExpenseCollection => {
  const expenses = JSON.parse(window.localStorage.getItem("expenses") || "[]");
  const collectionRef = useRef<ExpenseCollection>(
    new ExpenseCollection(expenses)
  );

  const [, setCurrentHash] = useState(collectionRef.current.hash);

  useEffect(() => {
    return collectionRef.current.subscribe(() => {
      const newExpenses = collectionRef.current.expenseList;
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
      const newAllocations = collectionRef.current.allocationList;
      window.localStorage.setItem(
        "allocations",
        JSON.stringify(newAllocations)
      );
      setCurrentHash(collectionRef.current.hash);
    });
  }, []);

  return collectionRef.current;
};
