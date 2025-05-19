import { useEffect, useRef, useState } from "react";
import { Expense, SankeyData, SankeyFlow } from "../schema";

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
