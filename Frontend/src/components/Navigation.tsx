import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { ChefHat, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-neutral-900 font-semibold">
              Restaurant LMS
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/drafts"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/drafts')
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Drafts
            </Link>
            <Link
              to="/published"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/published')
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Published
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-neutral-700">{user?.name || "User"}</span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-neutral-200">
                      <p className="text-sm font-medium text-neutral-900">
                        {user?.name}
                      </p>
                      <p className="text-sm text-neutral-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors flex items-center gap-2 text-neutral-700"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-neutral-700" />
            ) : (
              <Menu className="w-6 h-6 text-neutral-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-neutral-200 bg-white"
          >
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/drafts"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  isActive('/drafts')
                    ? 'bg-orange-500 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Drafts
              </Link>
              <Link
                to="/published"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  isActive('/published')
                    ? 'bg-orange-500 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Published
              </Link>

              <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-lg">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <span className="text-neutral-900">{user?.name || "User"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors flex items-center gap-2 text-neutral-700 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
