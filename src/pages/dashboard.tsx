import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Wallet,
  TrendingUp,
  PieChart,
  ArrowUpRight,
} from 'lucide-react';

export function Dashboard() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Overview of your staking and farming positions
        </p>
      </div>
      
      <div className="grid gap-4 md:gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        <Card className="p-2 md:p-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 md:pb-4">
            <CardTitle className="text-sm md:text-base font-medium">Total Staked</CardTitle>
            <Wallet className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl lg:text-3xl font-bold">$45,231.89</div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        {/* Repeat for other stat cards */}
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 xl:grid-cols-7">
        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] md:h-[300px] lg:h-[400px] flex items-center justify-center text-muted-foreground">
              Chart placeholder
            </div>
          </CardContent>
        </Card>
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Active Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 md:space-y-6">
              {[
                {
                  name: 'MNT-ETH LP',
                  value: '$12,234.56',
                  change: '+14.2%',
                },
                {
                  name: 'stMNT',
                  value: '$8,234.56',
                  change: '+23.1%',
                },
                {
                  name: 'MNT-USDC LP',
                  value: '$5,234.56',
                  change: '+9.2%',
                },
              ].map((position) => (
                <div
                  key={position.name}
                  className="flex items-center justify-between p-2 md:p-4 rounded-lg bg-muted/50"
                >
                  <div className="space-y-1">
                    <p className="text-sm md:text-base font-medium">{position.name}</p>
                    <p className="text-sm text-muted-foreground">{position.value}</p>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 text-emerald-500">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-sm md:text-base">{position.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}