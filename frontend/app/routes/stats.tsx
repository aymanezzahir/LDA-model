import { Link } from "react-router";
import { BarChart3, TrendingUp, FileText, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

// Type definitions
interface TopicStats {
  topic_id: number;
  article_count: number;
  avg_confidence: number;
  date_range: string;
}

interface Topic {
  id: number;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [topicStats, setTopicStats] = useState<TopicStats[]>([]);

  // Topic definitions
  const topics: Topic[] = [
    {
      id: 0,
      name: "Security & Vulnerabilities",
      description: "Security, data vulnerabilities, application testing",
      color: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      icon: "🔒",
    },
    {
      id: 1,
      name: "CI/CD & Testing",
      description: "Continuous integration, deployment, testing strategies",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      icon: "🔄",
    },
    {
      id: 2,
      name: "API & Backend",
      description: "Server architecture, APIs, HTTP protocols, databases",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      icon: "⚙️",
    },
    {
      id: 3,
      name: "Web Development",
      description: "GitHub, TypeScript, React, JavaScript",
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      icon: "🌐",
    },
    {
      id: 4,
      name: "AI & Data Engineering",
      description: "AI implementation, data pipelines, real-time systems",
      color: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      icon: "🤖",
    },
    {
      id: 5,
      name: "Machine Learning",
      description: "ML models, neural networks, data systems",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: "🧠",
    },
    {
      id: 6,
      name: "Software Development & AI Tools",
      description: "Software development, AI-powered tools, developer teams",
      color: "text-indigo-700",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      icon: "💻",
    },
  ];

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        // Fetch stats for all topics
        const statsPromises = topics.map(async (topic) => {
          try {
            const res = await axios.get(
              `http://localhost:8000/topics/${topic.id}/articles`
            );
            return {
              topic_id: topic.id,
              article_count: res.data.items.length,
              avg_confidence:
                res.data.items.reduce(
                  (sum: number, item: any) => sum + item.confidence,
                  0
                ) / (res.data.items.length || 1),
              date_range: "Last 7 days",
            };
          } catch {
            return {
              topic_id: topic.id,
              article_count: 0,
              avg_confidence: 0,
              date_range: "Last 7 days",
            };
          }
        });

        const stats = await Promise.all(statsPromises);
        setTopicStats(stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const getTopicStats = (topicId: number) => {
    return (
      topicStats.find((s) => s.topic_id === topicId) || {
        article_count: 0,
        avg_confidence: 0,
        date_range: "N/A",
      }
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-20">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate total stats
  const totalArticles = topicStats.reduce((sum, s) => sum + s.article_count, 0);
  const avgConfidenceAll =
    topicStats.reduce((sum, s) => sum + s.avg_confidence * s.article_count, 0) /
    (totalArticles || 1);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BarChart3 className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Topic Statistics</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Explore articles and insights across all topics
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6" />
            <h3 className="text-sm font-medium opacity-90">Total Articles</h3>
          </div>
          <p className="text-4xl font-bold">{totalArticles}</p>
          <p className="text-sm opacity-75 mt-1">Across all topics</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            <h3 className="text-sm font-medium opacity-90">Avg Confidence</h3>
          </div>
          <p className="text-4xl font-bold">
            {(avgConfidenceAll * 100).toFixed(1)}%
          </p>
          <p className="text-sm opacity-75 mt-1">Overall accuracy</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-6 h-6" />
            <h3 className="text-sm font-medium opacity-90">Active Topics</h3>
          </div>
          <p className="text-4xl font-bold">
            {topicStats.filter((s) => s.article_count > 0).length}
          </p>
          <p className="text-sm opacity-75 mt-1">Out of {topics.length} total</p>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Browse by Topic
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const stats = getTopicStats(topic.id);
            const hasArticles = stats.article_count > 0;

            return (
              <Link
                key={topic.id}
                to={`/stats/${topic.id}`}
                className={`group ${topic.bgColor} ${topic.borderColor} border-2 rounded-lg p-6 hover:shadow-lg transition-all ${
                  hasArticles
                    ? "hover:scale-105 cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{topic.icon}</span>
                    <div>
                      <h3
                        className={`text-lg font-bold ${topic.color} group-hover:underline`}
                      >
                        {topic.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Topic {topic.id}
                      </p>
                    </div>
                  </div>
                  {hasArticles && (
                    <ArrowRight
                      className={`w-5 h-5 ${topic.color} group-hover:translate-x-1 transition-transform`}
                    />
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {topic.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Articles</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.article_count}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Confidence</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.article_count > 0
                        ? `${(stats.avg_confidence * 100).toFixed(1)}%`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {!hasArticles && (
                  <p className="text-xs text-gray-500 italic mt-2">
                    No articles available
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/trends"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <TrendingUp className="w-4 h-4" />
            View Trends
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <FileText className="w-4 h-4" />
            Search Articles
          </Link>
        </div>
      </div>
    </div>
  );
}