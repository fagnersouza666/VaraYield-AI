import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function Stake() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">Stake</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Stake your MNT tokens and earn rewards
        </p>
      </div>

      <div className="grid gap-6 md:gap-8 grid-cols-1 xl:grid-cols-2">
        <Card className="p-4 md:p-6">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Staking Stats</CardTitle>
            <CardDescription>Current staking metrics</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <p className="text-sm md:text-base font-medium text-muted-foreground">
                  Total Staked
                </p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold">$45,231.89</p>
                <p className="text-sm text-emerald-500">+15.2% ↑</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm md:text-base font-medium text-muted-foreground">
                  APY
                </p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold">15.2%</p>
                <p className="text-sm text-emerald-500">+2.1% ↑</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm md:text-base font-medium text-muted-foreground">
                  Your Stake
                </p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold">$891.23</p>
                <p className="text-sm text-emerald-500">+5.6% ↑</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm md:text-base font-medium text-muted-foreground">
                  Your Rewards
                </p>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold">$12.34</p>
                <p className="text-sm text-emerald-500">+0.8% ↑</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-4 md:p-6">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Stake / Unstake</CardTitle>
            <CardDescription>Manage your staking position</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="stake" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="stake">Stake</TabsTrigger>
                <TabsTrigger value="unstake">Unstake</TabsTrigger>
              </TabsList>
              <TabsContent value="stake">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      placeholder="0.0"
                      className="text-right text-lg md:text-xl"
                    />
                    <Button variant="outline" className="shrink-0">
                      MAX
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-sm md:text-base">
                    <span className="text-muted-foreground">You will receive</span>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                      <span>0.0 stMNT</span>
                    </div>
                  </div>
                  <Button size="lg" className="w-full">Stake MNT</Button>
                </div>
              </TabsContent>
              <TabsContent value="unstake">
                {/* Similar structure for unstake tab */}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <p className="text-sm md:text-base text-muted-foreground">
              Note: Unstaking has a 7-day cooldown period
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}