import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  AppLogo, 
  MenuIcon, 
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
import { getInitials, cn } from "@/lib/utils";

export default function MobileHeader() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setMenuOpen(false);
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: ChartIcon },
    { name: "Wallets", href: "/wallets", icon: WalletIcon },
    { name: "Transactions", href: "/transactions", icon: TransactionsIcon },
    { name: "Markets", href: "/markets", icon: MarketsIcon },
    { name: "Swap", href: "/swap", icon: SwapIcon },
    { name: "Portfolio", href: "/portfolio", icon: PortfolioIcon },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
    { name: "KYC Verification", href: "/kyc", icon: KycVerificationIcon },
    { name: "Support & FAQ", href: "/support", icon: SupportIcon },
  ];

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Menu Button */}
          <button 
            type="button" 
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                <AppLogo className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">AUTTOBI</span>
            </a>
          </Link>
          
          {/* User Avatar */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/70 flex items-center justify-center text-white font-medium">
              {user?.fullName ? getInitials(user.fullName) : user?.username.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <div className="flex flex-col h-full max-h-[500px]">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary">
                <AppLogo className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">AUTTOBI</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 overflow-y-auto">
              <ul className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <a 
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors",
                          location === item.href 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted text-foreground"
                        )}
                        onClick={() => setMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/70 flex items-center justify-center text-white font-medium">
                    {user?.fullName ? getInitials(user.fullName) : user?.username.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.fullName || user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || user?.username}
                  </p>
                </div>
                <button 
                  type="button" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                >
                  <LogoutIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
