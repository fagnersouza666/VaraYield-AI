import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout';
import { Routes } from '@/components/routes';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="nexus-theme">
      <Layout>
        <Routes />
      </Layout>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;