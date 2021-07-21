import "./App.scss";
import { QueryClient, QueryClientProvider } from "react-query";
import { Contributions } from "./contributions/Contributions";
import { History } from "./history/History";
import { SelfTaught } from "./self-taught/SelfTaught";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <History />
      <SelfTaught />
      <Contributions />
    </QueryClientProvider>
  );
}

export default App;
