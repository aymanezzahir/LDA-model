import { useEffect, useState } from "react";
import axios from "axios";
import { TrendingUp, Calendar, BarChart3, PieChart } from "lucide-react";

// Type definitions
interface DateRangeCounts {
  [dateRange: string]: number;
}

interface TopicCounts {
  [topicId: string]: DateRangeCounts;
}

interface TopicShare {
  [topicId: string]: DateRangeCounts;
}

interface TrendsData {
  freq: string;
  counts: TopicCounts;
  share: TopicShare;
}

interface Topic {
  id: number;
  name: string;
  color: string;
  bgColor: string;
}

export default function TrendsPage() {
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<"counts" | "share">("counts");

  // Topic definitions with colors
  const topics: Topic[] = [
    {
      id: 0,
      name: "Security & Vulnerabilities",
      color: "text-red-700",
      bgColor: "bg-red-500",
    },
    {
      id: 1,
      name: "CI/CD & Testing",
      color: "text-orange-700",
      bgColor: "bg-orange-500",
    },
    {
      id: 2,
      name: "API & Backend",
      color: "text-amber-700",
      bgColor: "bg-amber-500",
    },
    {
      id: 3,
      name: "Web Development",
      color: "text-yellow-700",
      bgColor: "bg-yellow-500",
    },
    {
      id: 4,
      name: "AI & Data Engineering",
      color: "text-green-700",
      bgColor: "bg-green-500",
    },
    {
      id: 5,
      name: "Machine Learning",
      color: "text-blue-700",
      bgColor: "bg-blue-500",
    },
    {
      id: 6,
      name: "Software Development & AI Tools",
      color: "text-indigo-700",
      bgColor: "bg-indigo-500",
    },
  ];

  useEffect(() => {
    async function fetchTrends() {
      try {
        setLoading(true);
        const res = await axios.get<TrendsData>(
          "http://localhost:8000/trends/series"
        );
        setTrendsData(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching trends:", err);
        setError("Failed to load trends data");
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show error if failed
  if (error || !trendsData) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700">{error || "Unable to load trends data"}</p>
      </div>
    );
  }

  // Get date ranges from data
  const dateRanges = Object.keys(
    trendsData.counts["0"] || trendsData.counts["1"] || {}
  );

  // Calculate totals for each date range
  const getTotalForDateRange = (dateRange: string): number => {
    return Object.keys(trendsData.counts).reduce((sum, topicId) => {
      return sum + (trendsData.counts[topicId][dateRange] || 0);
    }, 0);
  };

  // Get max value for scaling bars
  const maxCount = Math.max(
    ...Object.values(trendsData.counts).flatMap((dates) =>
      Object.values(dates)
    )
  );

  // Calculate growth rate between periods
  const getGrowthRate = (topicId: string): number | null => {
    if (dateRanges.length < 2) return null;
    const older = trendsData.counts[topicId][dateRanges[0]] || 0;
    const newer = trendsData.counts[topicId][dateRanges[1]] || 0;
    if (older === 0) return newer > 0 ? 100 : 0;
    return ((newer - older) / older) * 100;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-sm font-medium">Topic Trends Analysis</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Weekly Topic Distribution
            </h1>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedView("counts")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === "counts"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Counts
            </button>
            <button
              onClick={() => setSelectedView("share")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === "share"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <PieChart className="w-4 h-4 inline mr-2" />
              Share
            </button>
          </div>
        </div>

        {/* Date Range Info */}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            Frequency: <span className="font-medium">{trendsData.freq}</span> •
            Date Ranges: {dateRanges.length}
          </span>
        </div>
      </div>

      {/* Date Range Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {dateRanges.map((dateRange, idx) => (
          <div
            key={dateRange}
            className="bg-white rounded-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {dateRange}
              </h3>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                {idx === 0 ? "Previous" : "Current"}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Total Documents</p>
              <p className="text-3xl font-bold text-gray-900">
                {getTotalForDateRange(dateRange)}
              </p>
            </div>

            {/* Top Topics for this period */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Top Topics</p>
              <div className="space-y-2">
                {Object.entries(trendsData.counts)
                  .map(([topicId, dates]) => ({
                    topicId: parseInt(topicId),
                    count: dates[dateRange] || 0,
                  }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3)
                  .map(({ topicId, count }) => (
                    <div
                      key={topicId}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${topics[topicId].bgColor}`}
                        ></div>
                        <span className="text-gray-700">
                          {topics[topicId].name}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Topic Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {selectedView === "counts"
            ? "Topic Count Trends"
            : "Topic Share Distribution"}
        </h2>

        <div className="space-y-6">
          {topics.map((topic) => {
            const growthRate = getGrowthRate(topic.id.toString());
            const dataSource =
              selectedView === "counts" ? trendsData.counts : trendsData.share;

            return (
              <div key={topic.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${topic.bgColor}`}
                    ></div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {topic.name}
                      </h3>
                      <p className="text-xs text-gray-500">Topic {topic.id}</p>
                    </div>
                  </div>

                  {/* Growth Indicator */}
                  {growthRate !== null && (
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        growthRate > 0
                          ? "bg-green-100 text-green-700"
                          : growthRate < 0
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <TrendingUp
                        className={`w-4 h-4 ${
                          growthRate < 0 ? "rotate-180" : ""
                        }`}
                      />
                      {growthRate > 0 ? "+" : ""}
                      {growthRate.toFixed(1)}%
                    </div>
                  )}
                </div>

                {/* Timeline bars */}
                <div className="space-y-3 ml-7">
                  {dateRanges.map((dateRange, idx) => {
                    const value =
                      dataSource[topic.id.toString()]?.[dateRange] || 0;
                    const displayValue =
                      selectedView === "share"
                        ? `${(value * 100).toFixed(1)}%`
                        : value.toString();
                    const barWidth =
                      selectedView === "share"
                        ? value * 100
                        : (value / maxCount) * 100;

                    return (
                      <div key={dateRange}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">
                            {dateRange}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {displayValue}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              topic.bgColor
                            } ${idx === dateRanges.length - 1 ? "opacity-100" : "opacity-60"}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raw JSON (for debugging) */}
      <div className="mt-6 bg-gray-900 rounded-lg p-4">
        <p className="text-xs text-gray-400 mb-2">Raw Response</p>
        <pre className="text-xs text-green-400 overflow-x-auto">
          {JSON.stringify(trendsData, null, 2)}
        </pre>
      </div>
    </div>
  );
}