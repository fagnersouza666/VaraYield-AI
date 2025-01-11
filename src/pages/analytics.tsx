import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed statistics and performance metrics
          </p>
        </div>
        <Select defaultValue="24h">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Protocol Statistics</CardTitle>
            <CardDescription>Key protocol metrics</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Value Locked
                </p>
                <p className="text-2xl font-bold">$45,231,891.23</p>
                <p className="text-sm text-emerald-500">+15.2% ↑</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  24h Volume
                </p>
                <p className="text-2xl font-bold">$12,345,678.90</p>
                <p className="text-sm text-emerald-500">+8.7% ↑</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Stakers
                </p>
                <p className="text-2xl font-bold">12,345</p>
                <p className="text-sm text-emerald-500">+123 ↑</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average APY
                </p>
                <p className="text-2xl font-bold">15.2%</p>
                <p className="text-sm text-emerald-500">+2.1% ↑</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Statistics</CardTitle>
            <CardDescription>stMNT token metrics</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Market Cap
                </p>
                <p className="text-2xl font-bold">$89,123,456.78</p>
                <p className="text-sm text-emerald-500">+12.3% ↑</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Circulating Supply
                </p>
                <p className="text-2xl font-bold">12,345,678</p>
                <p className="text-sm text-emerald-500">+1.2% ↑</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Exchange Rate
                </p>
                <p className="text-2xl font-bold">1.05 MNT</p>
                <p className="text-sm text-emerald-500">+0.2% ↑</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Rewards
                </p>
                <p className="text-2xl font-bold">$1,234,567.89</p>
                <p className="text-sm text-emerald-500">+5.6% ↑</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical Performance</CardTitle>
          <CardDescription>Token price and TVL history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Chart placeholder
          </div>
        </CardContent>
      </Card>
    </div>
  );
}