import "./App.scss";
import { QueryClient, QueryClientProvider } from "react-query";
import { Contributions } from "./Contributions";
import { History } from "./history/History";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <History />
      <Contributions />
    </QueryClientProvider>
  );
}

export default App;
