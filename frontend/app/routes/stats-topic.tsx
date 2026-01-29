import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import axios from "axios";
import {
  FileText,
  ExternalLink,
  Calendar,
  TrendingUp,
  ArrowLeft,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";

// Type definitions
interface Article {
  title: string;
  url: string;
  published_at: string;
  confidence: number;
}

interface TopicArticlesResponse {
  topic: number;
  items: Article[];
}

interface Topic {
  id: number;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  chartColor: string;
}

interface ChartDataPoint {
  name: string;
  confidence: number;
  title: string;
  url: string;
  date: string;
  index: number;
}

export default function TopicArticlesPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const [articlesData, setArticlesData] = useState<TopicArticlesResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartView, setChartView] = useState<"bar" | "line" | "scatter">("bar");

  // Topic definitions
  const topics: Topic[] = [
    {
      id: 0,
      name: "Security & Vulnerabilities",
      description:
        "Articles about security, data vulnerabilities, application testing, and secure coding practices",
      color: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      chartColor: "#dc2626",
    },
    {
      id: 1,
      name: "CI/CD & Testing",
      description:
        "Content focused on continuous integration, deployment, testing strategies, and DevOps practices",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      chartColor: "#ea580c",
    },
    {
      id: 2,
      name: "API & Backend",
      description:
        "Articles about server architecture, APIs, HTTP protocols, databases, and backend services",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      chartColor: "#d97706",
    },
    {
      id: 3,
      name: "Web Development",
      description:
        "Content about GitHub, TypeScript, React, JavaScript, and modern web development practices",
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      chartColor: "#ca8a04",
    },
    {
      id: 4,
      name: "AI & Data Engineering",
      description:
        "Articles about AI implementation, data pipelines, real-time systems, and building with AI",
      color: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      chartColor: "#16a34a",
    },
    {
      id: 5,
      name: "Machine Learning",
      description:
        "Content about ML models, neural networks, data systems, and machine learning infrastructure",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      chartColor: "#2563eb",
    },
    {
      id: 6,
      name: "Software Development & AI Tools",
      description:
        "Articles about software development, AI-powered tools, developer teams, and modern workflows",
      color: "text-indigo-700",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      chartColor: "#4f46e5",
    },
  ];

  const currentTopic = topics[parseInt(topicId || "0")] || topics[0];

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get<TopicArticlesResponse>(
          `http://localhost:8000/topics/${topicId}/articles`
        );
        setArticlesData(res.data);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Failed to load articles");
      } finally {
        setLoading(false);
      }
    }

    if (topicId) {
      fetchArticles();
    }
  }, [topicId]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDateLong = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.7) return "#16a34a"; // green
    if (confidence > 0.5) return "#ca8a04"; // yellow
    if (confidence > 0.3) return "#ea580c"; // orange
    return "#dc2626"; // red
  };

  // Prepare chart data
  const prepareChartData = (): ChartDataPoint[] => {
    if (!articlesData) return [];

    return articlesData.items.map((article, index) => ({
      name: `Article ${index + 1}`,
      confidence: parseFloat((article.confidence * 100).toFixed(1)),
      title: article.title.length > 50 
        ? article.title.substring(0, 50) + "..." 
        : article.title,
      url: article.url,
      date: formatDate(article.published_at),
      index: index + 1,
    }));
  };

  const chartData = prepareChartData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
          <p className="font-semibold text-gray-900 mb-2 text-sm">
            {data.title}
          </p>
          <div className="space-y-1 text-xs">
            <p className="text-gray-600">
              Confidence: <span className="font-semibold text-gray-900">{data.confidence}%</span>
            </p>
            <p className="text-gray-600">
              Published: <span className="font-semibold text-gray-900">{data.date}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-96 bg-gray-200 rounded mt-8"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !articlesData) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-700 mb-6">
          {error || "Unable to load articles"}
        </p>
        <Link
          to="/stats"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stats
        </Link>
      </div>
    );
  }

  const avgConfidence =
    articlesData.items.reduce((sum, item) => sum + item.confidence, 0) /
    articlesData.items.length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <Link
        to="/stats"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Stats</span>
      </Link>

      {/* Topic Header */}
      <div
        className={`${currentTopic.bgColor} ${currentTopic.borderColor} border rounded-lg p-6 mb-8`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-lg ${currentTopic.bgColor} ${currentTopic.borderColor} border-2 flex items-center justify-center`}
            >
              <BarChart3 className={`w-6 h-6 ${currentTopic.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className={`text-2xl font-bold ${currentTopic.color}`}>
                  {currentTopic.name}
                </h1>
                <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-600">
                  Topic {topicId}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {currentTopic.description}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {articlesData.items.length}
              </span>{" "}
              articles
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Avg confidence:{" "}
              <span className="font-semibold text-gray-900">
                {(avgConfidence * 100).toFixed(1)}%
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Range:{" "}
              <span className="font-semibold text-gray-900">
                {(
                  Math.min(...articlesData.items.map((a) => a.confidence)) * 100
                ).toFixed(1)}
                % -{" "}
                {(
                  Math.max(...articlesData.items.map((a) => a.confidence)) * 100
                ).toFixed(1)}
                %
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Chart View Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Confidence Analysis
          </h2>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setChartView("bar")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                chartView === "bar"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartView("line")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                chartView === "line"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Line Chart
            </button>
            <button
              onClick={() => setChartView("scatter")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                chartView === "scatter"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Scatter Plot
            </button>
          </div>
        </div>

        {/* Charts */}
        {articlesData.items.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No articles found for this topic</p>
          </div>
        ) : (
          <div className="h-96">
            {chartView === "bar" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis
                    label={{
                      value: "Confidence (%)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 12, fill: "#6b7280" },
                    }}
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="confidence"
                    name="Confidence Score"
                    radius={[8, 8, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getConfidenceColor(entry.confidence / 100)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartView === "line" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis
                    label={{
                      value: "Confidence (%)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 12, fill: "#6b7280" },
                    }}
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    name="Confidence Score"
                    stroke={currentTopic.chartColor}
                    strokeWidth={3}
                    dot={{ fill: currentTopic.chartColor, r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {chartView === "scatter" && (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    dataKey="index"
                    name="Article"
                    label={{
                      value: "Article Index",
                      position: "insideBottom",
                      offset: -5,
                      style: { fontSize: 12, fill: "#6b7280" },
                    }}
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis
                    type="number"
                    dataKey="confidence"
                    name="Confidence"
                    label={{
                      value: "Confidence (%)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 12, fill: "#6b7280" },
                    }}
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                  <Legend />
                  <Scatter
                    name="Articles"
                    data={chartData}
                    fill={currentTopic.chartColor}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getConfidenceColor(entry.confidence / 100)}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          All Articles
        </h2>
        <div className="space-y-3">
          {articlesData.items.map((article, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3 flex-1">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 mb-1 hover:text-indigo-600 transition-colors">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 group"
                    >
                      <span className="truncate">{article.title}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </a>
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formatDateLong(article.published_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {(article.confidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">confidence</p>
                </div>
                <div
                  className="w-2 h-12 rounded-full"
                  style={{
                    backgroundColor: getConfidenceColor(article.confidence),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw JSON (for debugging) */}
      <div className="mt-6 bg-gray-900 rounded-lg p-4">
        <p className="text-xs text-gray-400 mb-2">Raw Response</p>
        <pre className="text-xs text-green-400 overflow-x-auto">
          {JSON.stringify(articlesData, null, 2)}
        </pre>
      </div>
    </div>
  );
}