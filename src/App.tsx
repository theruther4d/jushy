import "./App.scss";
import { QueryClient, QueryClientProvider } from "react-query";
import { Contributions } from "./contributions/Contributions";
import { History } from "./history/History";
import { SelfTaught } from "./self-taught/SelfTaught";
import { Stats } from "./stats/Stats";
import { Hero } from "./hero/Hero";
import { Footer } from "./footer/Footer";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Hero />
      <History />
      <SelfTaught />
      <Stats />
      <Contributions />
      <Footer />
    </QueryClientProvider>
  );
}

export default App;
