import "./App.css";
import { IncomeForm } from "./income/IncomeForm";

function App() {
  return (
    <div className="App">
      <IncomeForm onSubmit={(data) => console.log(data)} />
    </div>
  );
}

export default App;
