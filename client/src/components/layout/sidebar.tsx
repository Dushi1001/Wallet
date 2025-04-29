import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  AppLogo, 
  ChartIcon, 
  WalletIcon, 
  TransactionsIcon, 
  MarketsIcon, 
  SwapIcon, 
  PortfolioIcon, 
  SettingsIcon, 
  KycVerificationIcon, 
  SupportIcon, 
  LogoutIcon
} from "@/components/ui/svg-icons";
import { getInitials } from "@/lib/utils";

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: ChartIcon },
    { name: "Wallets", href: "/wallets", icon: WalletIcon },
    { name: "Transactions", href: "/transactions", icon: TransactionsIcon },
    { name: "Markets", href: "/markets", icon: MarketsIcon },
    { name: "Swap", href: "/swap", icon: SwapIcon },
  ];

  const accountNavigation = [
    { name: "Portfolio", href: "/portfolio", icon: PortfolioIcon },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
    { name: "KYC Verification", href: "/kyc", icon: KycVerificationIcon },
    { name: "Support & FAQ", href: "/support", icon: SupportIcon },
  ];

  return (
    <aside className={cn("hidden lg:flex lg:flex-col fixed top-0 left-0 z-40 h-screen w-64 transition-all duration-300 ease-in-out", "bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]", className)}>
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
            <AppLogo className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-[hsl(var(--sidebar-foreground))]">AUTTOBI</span>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-1.5">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors",
                    location === item.href 
                      ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]" 
                      : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]"
                  )}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            ))}
            
            <li className="mt-8 pt-6 border-t border-[hsl(var(--sidebar-border))]">
              <h4 className="px-4 py-2 text-xs uppercase tracking-wider text-[hsl(var(--sidebar-foreground))]/60">Account</h4>
            </li>
            
            {accountNavigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors",
                    location === item.href 
                      ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]" 
                      : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]"
                  )}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className="mt-auto p-4 border-t border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/70 flex items-center justify-center text-white font-medium">
                {user?.fullName ? getInitials(user.fullName) : user?.username.substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[hsl(var(--sidebar-background))] rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[hsl(var(--sidebar-foreground))] truncate">
                {user?.fullName || user?.username}
              </p>
              <p className="text-xs text-[hsl(var(--sidebar-foreground))]/60 truncate">
                {user?.email || user?.username}
              </p>
            </div>
            <button 
              type="button" 
              className="text-[hsl(var(--sidebar-foreground))]/60 hover:text-[hsl(var(--sidebar-foreground))]"
              onClick={handleLogout}
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
