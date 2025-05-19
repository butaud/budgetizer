import { ExpenseCollection } from "../data/collection";
import { generateRandomId } from "../data/utils";
import { Expense } from "../schema";
import "./ExpensesTab.css";

export type ExpensesTabProps = {
  expenseCollection: ExpenseCollection;
};

export const ExpensesTab = ({ expenseCollection }: ExpensesTabProps) => {
  const handleExpenseChange = (expense: Expense) => {
    expenseCollection.upsertItem(expense);
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
          {expenseCollection.itemList.map((expense, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={expense.name}
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    handleExpenseChange({
                      ...expense,
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
                    handleExpenseChange({
                      ...expense,
                      name: expense.name,
                      amount: parseFloat(e.target.value),
                    })
                  }
                />
              </td>
              <td>
                <button onClick={() => expenseCollection.removeItem(expense)}>
                  X
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <button
                onClick={() =>
                  expenseCollection.upsertItem({
                    id: generateRandomId(),
                    name: "New Expense",
                    amount: 0,
                  })
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
