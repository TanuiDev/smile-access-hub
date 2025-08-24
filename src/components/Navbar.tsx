import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart } from 'lucide-react';
import { useAuthStore } from '@/Store/UserStore';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthStore(state => state.user);
  const isAuthenticated = !!user;

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },   
  ];

  const AuthButtons = () => {
    if (isAuthenticated) {
      return (
        <Button variant="default" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
          <Link to="/dashboard">Dashboard</Link>
        </Button>
      );
    }
    
    return (
      <>
        <Button variant="default" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
          <Link to="/register">Signup</Link>
        </Button>
        <Button variant="default" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
          <Link to="/login">Login</Link>
        </Button>
      </>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">DentaLink</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
            <AuthButtons />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border bg-card">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2 space-y-2">
                {isAuthenticated ? (
                  <Button variant="default" className="w-full bg-gradient-to-r from-primary to-accent">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="default" className="w-full bg-gradient-to-r from-primary to-accent mb-2">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button variant="default" className="w-full bg-gradient-to-r from-primary to-accent">
                      <Link to="/register">Signup</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;