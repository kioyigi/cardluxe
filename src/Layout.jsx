import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { 
  Menu, X, Home, CreditCard, Gavel, User, 
  LogIn, Search, ChevronDown, TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        // Not logged in
      }
    };
    checkAuth();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', page: 'Home', icon: Home },
    { name: 'Cards', page: 'Cards', icon: CreditCard },
    { name: 'Trending', page: 'HighlyActiveCards', icon: TrendingUp },
    { name: 'Auctions', page: 'Auctions', icon: Gavel },
  ];

  const isActive = (page) => currentPageName === page;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-zinc-950/95 backdrop-blur-lg border-b border-zinc-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">CardVault</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.page} to={createPageUrl(item.page)}>
                  <Button
                    variant="ghost"
                    className={`px-4 py-2 rounded-full transition-all ${
                      isActive(item.page)
                        ? 'bg-zinc-800 text-amber-400'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Search button */}
              <Link to={createPageUrl("Cards")}>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>

              {/* User menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-zinc-400 hover:text-white">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <span className="text-sm font-bold text-black">
                          {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
                    <div className="px-3 py-2">
                      <p className="text-white font-medium truncate">{user.full_name || 'Collector'}</p>
                      <p className="text-zinc-500 text-sm truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("Profile")} className="cursor-pointer text-zinc-300 hover:text-white focus:text-white focus:bg-zinc-800">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem 
                      onClick={() => base44.auth.logout(createPageUrl("Home"))}
                      className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-zinc-800"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}

              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-zinc-400"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-900 border-t border-zinc-800">
            <div className="px-6 py-4 space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.page} 
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      isActive(item.page)
                        ? 'bg-zinc-800 text-amber-400'
                        : 'text-zinc-400'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="pt-16 md:pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">CardVault</span>
              </div>
              <p className="text-zinc-500 text-sm">
                The premier destination for Pokémon card collectors and traders.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Navigate</h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.page}>
                    <Link 
                      to={createPageUrl(item.page)}
                      className="text-zinc-500 hover:text-amber-400 text-sm transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-zinc-500 hover:text-amber-400 text-sm transition-colors">FAQ</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-amber-400 text-sm transition-colors">Contact</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-amber-400 text-sm transition-colors">Terms</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-zinc-500 hover:text-amber-400 text-sm transition-colors">Twitter</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-amber-400 text-sm transition-colors">Discord</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-amber-400 text-sm transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 mt-12 pt-8 text-center">
            <p className="text-zinc-600 text-sm">
              © {new Date().getFullYear()} CardVault. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}