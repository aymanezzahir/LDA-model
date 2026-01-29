import { TrendingUp } from "lucide-react";

export default function Header(){
    return (
        <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900">Trendshift</span>
              </div>
              <nav className="hidden md:flex gap-6">
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  Trending repositories
                </button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  Trending developers
                </button>
                <button className="text-gray-600 hover:text-gray-900 transition-colors">
                  Repository engagements
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>
    )
}