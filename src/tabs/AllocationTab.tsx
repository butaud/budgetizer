import { FC, Fragment, useState } from "react";
import { Allocation, Expense } from "../data/items";

import "./AllocationTab.css";
import ReactSlider from "react-slider";
import {
  AllocationCollection,
  ExpenseCollection,
  PaycheckCollection,
} from "../data/collections";
import { generateRandomId } from "../data/utils";

export type AllocationTabProps = {
  allocationCollection: AllocationCollection;
  paycheckCollection: PaycheckCollection;
  expenseCollection: ExpenseCollection;
};

const Total: FC<{
  label: string;
  allocated: number;
  total: number;
  className?: string;
}> = ({ label, allocated, total, className }) => (
  <div
    className={
      "total" +
      (allocated > total ? " error" : "") +
      (className ? " " + className : "")
    }
  >
    <div className="label">{label}</div>
    <div className="value">
      {" "}
      $
      {allocated.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}{" "}
      / $
      {total.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}
    </div>
  </div>
);

export const AllocationTab: FC<AllocationTabProps> = ({
  allocationCollection,
  paycheckCollection,
  expenseCollection,
}) => {
  const expenseSliderValues = expenseCollection.itemList.map((expense) => {
    const salaryAllocation = allocationCollection.itemList.find(
      (allocation) =>
        allocation.to === expense.name && allocation.from === "Salary Take-Home"
    );
    const irregularAllocation = allocationCollection.itemList.find(
      (allocation) =>
        allocation.to === expense.name && allocation.from === "Irregular Income"
    );
    const salaryValue = salaryAllocation?.value ?? 0;
    const irregularValue = expense.amount - (irregularAllocation?.value ?? 0);
    return { expense, values: [salaryValue, irregularValue] };
  });

  return (
    <div className="allocation-tab">
      <Total
        label="Salary Take-Home"
        allocated={allocationCollection.salaryTotal}
        total={paycheckCollection.nonBonusNetPay}
        className="salary"
      />
      <div className="sliders">
        {expenseSliderValues.map(({ expense, values }, index) => (
          <Fragment key={expense.name}>
            <ExpenseHeader
              expense={expense}
              removeExpense={() => {
                expenseCollection.removeItem(expense);
                allocationCollection.itemList
                  .filter((allocation) => allocation.to === expense.name)
                  .forEach((allocation) => {
                    allocationCollection.removeItem(allocation);
                  });
              }}
              updateAmount={(newAmount) => {
                expenseCollection.upsertItem({
                  ...expense,
                  amount: newAmount,
                });
                if (expense.amount !== 0) {
                  const oldSalaryAllocation =
                    allocationCollection.itemList.find(
                      (allocation) =>
                        allocation.to === expense.name &&
                        allocation.from === "Salary Take-Home"
                    );
                  const oldIrregularAllocation =
                    allocationCollection.itemList.find(
                      (allocation) =>
                        allocation.to === expense.name &&
                        allocation.from === "Irregular Income"
                    );
                  const oldSalaryAllocationRate =
                    (oldSalaryAllocation?.value ?? 0) / expense.amount;
                  const oldIrregularAllocationRate =
                    (expense.amount - (oldIrregularAllocation?.value ?? 0)) /
                    expense.amount;
                  const newSalaryAllocation: Allocation = {
                    from: "Salary Take-Home",
                    to: expense.name,
                    value: newAmount * oldSalaryAllocationRate,
                  };
                  allocationCollection.upsertItem(newSalaryAllocation);
                  const newIrregularAllocation: Allocation = {
                    from: "Irregular Income",
                    to: expense.name,
                    value: newAmount * oldIrregularAllocationRate,
                  };
                  allocationCollection.upsertItem(newIrregularAllocation);
                }
              }}
              updateTitle={(newTitle) => {
                expenseCollection.upsertItem({
                  ...expense,
                  name: newTitle,
                });
                allocationCollection.itemList
                  .filter((allocation) => allocation.to === expense.name)
                  .forEach((allocation) => {
                    allocationCollection.removeItem(allocation);
                    allocationCollection.upsertItem({
                      ...allocation,
                      to: newTitle,
                    });
                  });
              }}
            />
            <ReactSlider
              className="horizontal-slider"
              thumbClassName="example-thumb"
              trackClassName="example-track"
              min={0}
              max={expense.amount}
              step={1}
              pearling
              value={values}
              renderTrack={(props, state) => (
                <div {...props}>
                  {state.index === 0
                    ? values[0].toFixed(0)
                    : state.index === 2
                    ? (expense.amount - values[1]).toFixed(0)
                    : ""}
                </div>
              )}
              onChange={(newValues) => {
                const newSalaryAllocation: Allocation = {
                  from: "Salary Take-Home",
                  to: expense.name,
                  value: newValues[0],
                };
                const newIrregularAllocation: Allocation = {
                  from: "Irregular Income",
                  to: expense.name,
                  value: expense.amount - newValues[1],
                };
                allocationCollection.upsertItem(newSalaryAllocation);
                allocationCollection.upsertItem(newIrregularAllocation);
              }}
            />
          </Fragment>
        ))}
        <button
          onClick={() => {
            expenseCollection.upsertItem({
              id: generateRandomId(),
              name: "New Expense",
              amount: 0,
            });
            allocationCollection.upsertItem({
              from: "Salary Take-Home",
              to: "New Expense",
              value: 0,
            });
            allocationCollection.upsertItem({
              from: "Irregular Income",
              to: "New Expense",
              value: 0,
            });
          }}
        >
          + Add Expense
        </button>
      </div>
      <Total
        label="Irregular Income"
        allocated={allocationCollection.irregularTotal}
        total={paycheckCollection.irregularIncome}
        className="irregular"
      />
    </div>
  );
};

type ExpenseHeaderProps = {
  expense: Expense;
  removeExpense: () => void;
  updateTitle: (newTitle: string) => void;
  updateAmount: (newAmount: number) => void;
};

const ExpenseHeader: FC<ExpenseHeaderProps> = ({
  expense,
  removeExpense,
  updateTitle,
  updateAmount,
}) => {
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState(expense.name);
  return (
    <div className="expense">
      <button onClick={removeExpense}>X</button>
      {isUpdatingTitle ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateTitle(updatedTitle);
            setIsUpdatingTitle(false);
          }}
        >
          <input
            type="text"
            value={updatedTitle}
            onChange={(e) => setUpdatedTitle(e.target.value)}
          />
          <input type="submit"></input>
        </form>
      ) : (
        <span onDoubleClick={() => setIsUpdatingTitle(true)}>
          {expense.name}
        </span>
      )}
      :{" "}
      <input
        type="text"
        value={expense.amount}
        onChange={(e) => {
          const newAmount = parseFloat(e.target.value);
          if (!isNaN(newAmount)) {
            updateAmount(newAmount);
          }
        }}
      />
    </div>
  );
};
