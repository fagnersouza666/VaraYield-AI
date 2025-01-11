import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

const items = [
  {
    title: 'Dashboard',
    href: '/',
  },
  {
    title: 'Stake',
    href: '/stake',
  },
  {
    title: 'Farm',
    href: '/farm',
  },
  {
    title: 'Analytics',
    href: '/analytics',
  },
];

interface NavigationProps {
  orientation?: 'horizontal' | 'vertical';
}

export function Navigation({ orientation = 'horizontal' }: NavigationProps) {
  const location = useLocation();

  return (
    <nav className={cn(
      'flex text-sm font-medium',
      orientation === 'horizontal' 
        ? 'items-center space-x-6' 
        : 'flex-col space-y-4'
    )}>
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            'transition-colors hover:text-foreground/80',
            location.pathname === item.href
              ? 'text-foreground'
              : 'text-foreground/60',
            orientation === 'vertical' && 'w-full'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}