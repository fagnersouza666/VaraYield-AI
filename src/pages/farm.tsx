import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const farms = [
  {
    id: 1,
    name: 'MNT-ETH LP',
    tvl: '$12,234,567',
    apr: '45.2%',
    rewards: ['MNT', 'ETH'],
    yourStake: '$1,234.56',
    earned: '$123.45',
  },
  {
    id: 2,
    name: 'stMNT-MNT LP',
    tvl: '$8,234,567',
    apr: '38.9%',
    rewards: ['MNT'],
    yourStake: '$891.23',
    earned: '$89.12',
  },
  {
    id: 3,
    name: 'MNT-USDC LP',
    tvl: '$5,234,567',
    apr: '32.1%',
    rewards: ['MNT', 'USDC'],
    yourStake: '$567.89',
    earned: '$56.78',
  },
];

export function Farm() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Farm</h1>
        <p className="text-muted-foreground">
          Stake your LP tokens to earn additional rewards
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Farms</CardTitle>
          <CardDescription>
            Earn rewards by providing liquidity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pool</TableHead>
                <TableHead>TVL</TableHead>
                <TableHead>APR</TableHead>
                <TableHead>Rewards</TableHead>
                <TableHead>Your Stake</TableHead>
                <TableHead>Earned</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farms.map((farm) => (
                <TableRow key={farm.id}>
                  <TableCell className="font-medium">{farm.name}</TableCell>
                  <TableCell>{farm.tvl}</TableCell>
                  <TableCell className="text-emerald-500">{farm.apr}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {farm.rewards.map((reward) => (
                        <span
                          key={reward}
                          className="rounded bg-secondary px-2 py-1 text-xs"
                        >
                          {reward}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{farm.yourStake}</TableCell>
                  <TableCell>{farm.earned}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Farm
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}