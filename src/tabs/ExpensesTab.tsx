import { Expense } from "../schema";
import "./ExpensesTab.css";

export type ExpensesTabProps = {
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
};

export const ExpensesTab = ({ expenses, setExpenses }: ExpensesTabProps) => {
  const handleExpenseChange = (index: number, expense: Expense) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index] = expense;
    setExpenses(updatedExpenses);
  };
  return (
    <div className="expenses-tab">
      <table>
        <thead>
          <tr>
            <th>Expense</th>
            <th>Amount</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={expense.name}
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    handleExpenseChange(index, {
                      amount: expense.amount,
                      name: e.target.value,
                    })
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={expense.amount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    handleExpenseChange(index, {
                      name: expense.name,
                      amount: parseFloat(e.target.value),
                    })
                  }
                />
              </td>
              <td>
                <button
                  onClick={() =>
                    setExpenses(expenses.filter((_, i) => i !== index))
                  }
                >
                  X
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <button
                onClick={() =>
                  setExpenses([...expenses, { name: "New Expense", amount: 0 }])
                }
              >
                + Add Expense
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
