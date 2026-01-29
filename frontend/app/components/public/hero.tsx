import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";


export default function Hero() {
  const [inputValue, setInputValue] = useState(""); 
  
  return (
    <div className="bg-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          A better way to discover open source projects
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          We analyze activity across a curated collection of open-source repositories
        </p>

        <div className="flex gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Analise article de Dev.to et github ressources"
              className="pl-10 h-12"
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          <Button
            onClick={() => {
              window.location.assign(
                `/search?q=${encodeURIComponent(inputValue)}`,
              );
            }}
            className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
