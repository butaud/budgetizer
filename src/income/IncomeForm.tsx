import { FC, useState } from "react";

import "./IncomeForm.css";
import { IncomeConstants, Paycheck } from "../data/items";
import { useStickyState } from "../hooks";
import { PaycheckCollection } from "../data/collections";

type IncomeFormProps = {
  paycheckCollection: PaycheckCollection;
};

const parseMonth = (month: string) => {
  const monthMap: { [key: string]: string } = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  return monthMap[month] ?? "";
};

const reformatCsvDate = (rawDate: string) => {
  const dateParts = rawDate.split(" ");
  if (dateParts.length !== 3) {
    throw new Error(`Invalid date format: ${rawDate}`);
  }
  const month = parseMonth(dateParts[0]);
  const day = parseInt(dateParts[1].substring(0, dateParts[1].length - 1), 10);
  const year = parseInt(dateParts[2], 10);
  if (month === "" || isNaN(day) || isNaN(year)) {
    throw new Error(`Invalid date format: ${rawDate}`);
  }
  return `${year}-${month}-${day.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })}`;
};

const parsePaycheckTableRow = (row: string, constants: IncomeConstants) => {
  const columns = row.trim().split("\t");
  return new Paycheck(
    constants,
    reformatCsvDate(columns[0]),
    reformatCsvDate(columns[1]),
    reformatCsvDate(columns[2]),
    parseFloat(columns[3].replace(/[$,]/g, "")),
    parseFloat(columns[4].replace(/[$,]/g, "")),
    parseFloat(columns[5].replace(/[$,]/g, "")),
    -1 * parseFloat(columns[6].replace(/[$,]/g, "")),
    -1 * parseFloat(columns[7].replace(/[$,]/g, "")),
    parseFloat(columns[8].replace(/[$,]/g, ""))
  );
};

const parsePaycheckTable = (table: string, constants: IncomeConstants) => {
  const rows = table
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.length > 0 && row.split("\t").length === 9)
    .map((row) => parsePaycheckTableRow(row, constants));
  return rows;
};

export const IncomeForm: FC<IncomeFormProps> = ({ paycheckCollection }) => {
  const [disabilityInsuranceDeduction, setDisabilityInsuranceDeduction] =
    useStickyState("disabilityInsuranceDeduction", 0);
  const [legalPlanDeduction, setLegalPlanDeduction] = useStickyState(
    "legalPlanDeduction",
    0
  );
  const [givingDeduction, setGivingDeduction] = useStickyState(
    "givingDeduction",
    0
  );
  const [esppRate, setEsppRate] = useStickyState("esppRate", 0);
  const [paycheckTable, setPaycheckTable] = useState("");

  const applyCsv = () => {
    const rows = parsePaycheckTable(paycheckTable, {
      disabilityInsuranceDeduction,
      legalPlanDeduction,
      givingDeduction,
      esppRate,
    });

    paycheckCollection.beginTransaction();
    rows.forEach((row) => {
      paycheckCollection.upsertItem(row);
    });
    const paychecksToRemove = paycheckCollection.itemList.filter(
      (paycheck) => !rows.some((row) => row.date === paycheck.date)
    );
    paychecksToRemove.forEach((paycheck) => {
      paycheckCollection.removeItem(paycheck);
    });
    paycheckCollection.commitTransaction();
    setPaycheckTable("");
  };

  return (
    <div className="income-form">
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
            type="number"
            id="legalPlanDeduction"
            value={legalPlanDeduction}
            onChange={(e) => setLegalPlanDeduction(Number(e.target.value))}
          />
        </label>
        <label htmlFor="givingDeduction">
          Giving Deduction:
          <input
            type="number"
            id="givingDeduction"
            value={givingDeduction}
            onChange={(e) => setGivingDeduction(Number(e.target.value))}
          />
        </label>
        <label htmlFor="esppRate">
          ESPP Rate:
          <input
            type="number"
            id="esppRate"
            value={esppRate}
            onChange={(e) => setEsppRate(Number(e.target.value))}
          />
        </label>
      </div>
      <textarea
        value={paycheckTable}
        onChange={(e) => setPaycheckTable(e.target.value)}
      />
      <button onClick={applyCsv} disabled={paycheckTable === ""}>
        Apply CSV
      </button>
      {paycheckCollection.length > 0 && (
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
                <th>After-tax Deductions</th>
                <th>Non-stock After Tax Deductions</th>
                <th>Non-investment After Tax Deductions</th>
                <th>Investment After Tax Deductions</th>
                <th>ESPP</th>
                <th>Roth IRA</th>
                <th>Bonus Net Pay</th>
                <th>Non-bonus Net Pay</th>
                <th>Net Stock Vestings</th>
              </tr>
            </thead>
            <tbody>
              {paycheckCollection.itemList
                .sort((a, b) => {
                  if (a.payPeriodStart < b.payPeriodStart) {
                    return -1;
                  }
                  if (a.payPeriodStart > b.payPeriodStart) {
                    return 1;
                  }
                  return 0;
                })
                .map((row, index) => (
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
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const newSalary = parseFloat(
                            e.target.value.replace(/[$,]/g, "")
                          );
                          const cloned = Paycheck.clone(row);
                          cloned.salary = newSalary;
                          paycheckCollection.upsertItem(cloned);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.perksPlus ?? 0}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const newPerksPlus = parseFloat(
                            e.target.value.replace(/[$,]/g, "")
                          );
                          const cloned = Paycheck.clone(row);
                          cloned.perksPlus = newPerksPlus;
                          paycheckCollection.upsertItem(cloned);
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
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const newStockAwardTaxes = parseFloat(
                            e.target.value.replace(/[$,]/g, "")
                          );
                          const cloned = Paycheck.clone(row);
                          cloned.stockAwardTaxes = newStockAwardTaxes;
                          paycheckCollection.upsertItem(cloned);
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
                    <td>
                      {row.afterTaxDeductions.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {row.nonStockAfterTaxDeductions.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {row.nonInvestmentAfterTaxDeductions.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>
                    <td>
                      {row.investmentAfterTaxDeductions.toLocaleString(
                        "en-US",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>
                    <td>
                      {row.espp.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {row.rothIra.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {row.bonusNetPay.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {row.nonBonusNetPay.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      {row.netStockVestings.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
