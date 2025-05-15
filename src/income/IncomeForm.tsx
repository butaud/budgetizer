import { FC, useState } from "react";

import "./IncomeForm.css";
import { IncomeConstants, Paycheck } from "../schema";
import { useStickyState } from "../hooks";

type IncomeFormProps = {
  onSubmit: (data: any) => void;
};

const parsePaycheckTableRow = (row: string, constants: IncomeConstants) => {
  const columns = row.trim().split("\t");
  return new Paycheck(
    constants,
    columns[0],
    columns[1],
    columns[2],
    parseFloat(columns[3].replace(/[$,]/g, "")),
    parseFloat(columns[4].replace(/[$,]/g, "")),
    parseFloat(columns[5].replace(/[$,]/g, "")),
    -1 * parseFloat(columns[6].replace(/[$,]/g, "")),
    parseFloat(columns[7].replace(/[$,]/g, "")),
    parseFloat(columns[8].replace(/[$,]/g, ""))
  );
};

const parsePaycheckTable = (
  table: string,
  constants: IncomeConstants,
  salaries: Record<string, number>,
  perksPlus: Record<string, number>,
  stockAwardTaxes: Record<string, number>
) => {
  const rows = table
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.length > 0 && row.split("\t").length === 9)
    .map((row) => {
      const paycheck = parsePaycheckTableRow(row, constants);
      paycheck.salary = salaries[paycheck.date];
      paycheck.perksPlus = perksPlus[paycheck.date];
      paycheck.stockAwardTaxes = stockAwardTaxes[paycheck.date];
      return paycheck;
    });
  return rows;
};

export const IncomeForm: FC<IncomeFormProps> = ({ onSubmit }) => {
  const [disabilityInsuranceDeduction, setDisabilityInsuranceDeduction] =
    useState(0);
  const [legalPlanDeduction, setLegalPlanDeduction] = useState(0);
  const [givingDeduction, setGivingDeduction] = useState(0);
  const [paycheckTable, setPaycheckTable] = useState("");
  const [salaries, setSalaries] = useStickyState<Record<string, number>>(
    "salaries",
    {}
  );
  const [perksPlus, setPerksPlus] = useStickyState<Record<string, number>>(
    "perksPlus",
    {}
  );
  const [stockAwardTaxes, setStockAwardTaxes] = useStickyState<
    Record<string, number>
  >("stockAwardTaxes", {});

  const rows = parsePaycheckTable(
    paycheckTable,
    {
      disabilityInsuranceDeduction,
      legalPlanDeduction,
      givingDeduction,
    },
    salaries,
    perksPlus,
    stockAwardTaxes
  );
  const totalGrossPay = rows.reduce((acc, row) => acc + row.grossPay, 0);

  return (
    <div className="income-form">
      <h2>Income Form</h2>
      <div className="constants">
        <label htmlFor="disabilityInsuranceDeduction">
          Disability Insurance Deduction:
          <input
            type="number"
            id="disabilityInsuranceDeduction"
            value={disabilityInsuranceDeduction}
            onChange={(e) =>
              setDisabilityInsuranceDeduction(Number(e.target.value))
            }
          />
        </label>
        <label htmlFor="legalPlanDeduction">
          Legal Plan Deduction:
          <input
            type="text"
            id="legalPlanDeduction"
            value={legalPlanDeduction}
            onChange={(e) => setLegalPlanDeduction(Number(e.target.value))}
          />
        </label>
        <label htmlFor="givingDeduction">
          Giving Deduction:
          <input
            type="text"
            id="givingDeduction"
            value={givingDeduction}
            onChange={(e) => setGivingDeduction(Number(e.target.value))}
          />
        </label>
      </div>
      <textarea
        value={paycheckTable}
        onChange={(e) => setPaycheckTable(e.target.value)}
      />
      <p>
        <strong>Total Gross Pay from {rows.length} paychecks:</strong>
        {" $"}
        {totalGrossPay.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
      {rows.length > 0 && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Pay Period Start</th>
                <th>Gross Pay</th>
                <th>Adjustments</th>
                <th>Salary</th>
                <th>Perks Plus</th>
                <th>Bonus</th>
                <th>Stock Vesting</th>
                <th>Taxes Withheld</th>
                <th>Stock Award Taxes</th>
                <th>Paycheck Taxes Withheld</th>
                <th>Est. Salary Taxes Withheld</th>
                <th>Est. Bonus Taxes Withheld</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>{row.payPeriodStart}</td>
                  <td>
                    {row.grossPay.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    {row.adjustments.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.salary ?? 0}
                      onChange={(e) => {
                        const newSalary = parseFloat(
                          e.target.value.replace(/[$,]/g, "")
                        );
                        setSalaries((prev) => ({
                          ...prev,
                          [row.date]: newSalary,
                        }));
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.perksPlus ?? 0}
                      onChange={(e) => {
                        const newPerksPlus = parseFloat(
                          e.target.value.replace(/[$,]/g, "")
                        );
                        setPerksPlus((prev) => ({
                          ...prev,
                          [row.date]: newPerksPlus,
                        }));
                      }}
                    />
                  </td>
                  <td>
                    {row.bonus?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) ?? ""}
                  </td>
                  <td>
                    {row.stockVesting.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    {row.taxesWithheld.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    <input
                      type="number"
                      value={row.stockAwardTaxes ?? 0}
                      onChange={(e) => {
                        const newStockAwardTaxes = parseFloat(
                          e.target.value.replace(/[$,]/g, "")
                        );
                        setStockAwardTaxes((prev) => ({
                          ...prev,
                          [row.date]: newStockAwardTaxes,
                        }));
                      }}
                    />
                  </td>
                  <td>
                    {row.paycheckTaxesWithheld.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    {row.estSalaryTaxesWithheld?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) ?? ""}
                  </td>
                  <td>
                    {row.estBonusTaxesWithheld?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
