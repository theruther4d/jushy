import React from "react";
import "./App.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { Contributions } from "./Contributions";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Contributions />
    </QueryClientProvider>
  );
}

export default App;
