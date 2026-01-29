import { useSearchParams } from "react-router";
import { Search, TrendingUp, Target, Tag } from "lucide-react";
import UTJ from "~/constants/urlToJson";
import { useEffect, useState } from "react";
import axios from "axios";

// Type definitions
interface TopicDistribution {
  topic_0: number;
  topic_1: number;
  topic_2: number;
  topic_3: number;
  topic_4: number;
  topic_5: number;
  topic_6: number;
}

interface Prediction {
  primary_topic: number;
  primary_confidence: number;
  secondary_topic: number | null;
  secondary_confidence: number;
  keywords: string[];
  topic_distribution: TopicDistribution;
}

interface ApiResponse {
  prediction: Prediction;
  note?: string;
}

interface Topic {
  id: number;
  name: string;
  keywords: string;
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [topicData, setTopicData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const query = searchParams.get("q") || "";

  const result = UTJ(query);
  console.log(query);

  if (!result.valid) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid URL</h1>
        <p className="text-gray-700">Please enter a valid URL to analyze.</p>
      </div>
    );
  }

  useEffect(() => {
    async function fetchTopicAnalysis() {
      try {
        setLoading(true);
        const res = await axios.post<ApiResponse>(
          "http://localhost:8000/predict",
          {
            url: query,
          }
        );
        setTopicData(res.data);
      } catch (error) {
        console.error("Error fetching topic analysis:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopicAnalysis();
  }, [query]);

  // Topic definitions with keywords
  const topics: Topic[] = [
    {
      id: 0,
      name: "Security & Vulnerabilities",
      keywords: "security, data, vulnerabilities, application, tools, testing",
    },
    {
      id: 1,
      name: "CI/CD & Testing",
      keywords: "testing, test, ci, tests, deployment, cd, devops",
    },
    {
      id: 2,
      name: "API & Backend",
      keywords: "server, request, api, proxy, http, response, client",
    },
    {
      id: 3,
      name: "Web Development",
      keywords: "code, github, claude, js, typescript, react, project",
    },
    {
      id: 4,
      name: "AI & Data Engineering",
      keywords: "data, ai, real, time, api, building, work",
    },
    {
      id: 5,
      name: "Machine Learning",
      keywords: "data, model, ai, systems, neural, networks, vector",
    },
    {
      id: 6,
      name: "Software Development & AI Tools",
      keywords: "code, software, ai, tools, development, developers, teams",
    },
  ];

  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.7) return "bg-green-100 text-green-800 border-green-300";
    if (confidence > 0.4)
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence > 0.7) return "High Confidence";
    if (confidence > 0.4) return "Medium Confidence";
    return "Low Confidence";
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show error if no data
  if (!topicData || !topicData.prediction) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error Loading Data
        </h1>
        <p className="text-gray-700">
          Unable to fetch topic analysis. Please try again.
        </p>
      </div>
    );
  }

  const { prediction } = topicData;

  // Convert topic_distribution object to array for rendering
  const topicDistributionArray: number[] = Object.entries(
    prediction.topic_distribution
  )
    .map(([key, value]) => ({
      index: parseInt(key.split("_")[1]),
      score: value as number,
    }))
    .sort((a, b) => a.index - b.index)
    .map((item) => item.score);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Search Query Display */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <Search className="w-5 h-5" />
          <span className="text-sm font-medium">Search Query</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{query}</h1>
      </div>

      {/* Topic Analysis Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Topic Analysis
          </h2>
        </div>

        {/* Dominant Topic */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Primary Topic</p>
              <h3 className="text-lg font-semibold text-gray-900">
                {topics[prediction.primary_topic].name}
              </h3>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getConfidenceColor(
                prediction.primary_confidence
              )}`}
            >
              {getConfidenceLabel(prediction.primary_confidence)}
            </div>
          </div>

          {/* Confidence Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Confidence Score</span>
              <span className="text-sm font-semibold text-gray-900">
                {(prediction.primary_confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${prediction.primary_confidence * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Secondary Topic */}
          {prediction.secondary_topic !== null && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Secondary Topic</p>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-medium text-gray-800">
                  {topics[prediction.secondary_topic].name}
                </h4>
                <span className="text-sm font-semibold text-gray-600">
                  {(prediction.secondary_confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Keywords */}
          <div className="flex items-start gap-2">
            <Tag className="w-4 h-4 text-gray-500 mt-1" />
            <div>
              <p className="text-sm text-gray-600 mb-1">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {prediction.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Topic Distribution
          </h2>
        </div>

        <div className="space-y-4">
          {topicDistributionArray.map((score, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                      index === prediction.primary_topic
                        ? "bg-indigo-600 text-white"
                        : index === prediction.secondary_topic
                        ? "bg-indigo-400 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {index}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {topics[index].name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {topics[index].keywords}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {(score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === prediction.primary_topic
                      ? "bg-indigo-600"
                      : index === prediction.secondary_topic
                      ? "bg-indigo-400"
                      : "bg-gray-400"
                  }`}
                  style={{ width: `${score * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw JSON (for debugging - can be removed in production) */}
      <div className="mt-6 bg-gray-900 rounded-lg p-4">
        <p className="text-xs text-gray-400 mb-2">Raw Response</p>
        <pre className="text-xs text-green-400 overflow-x-auto">
          {JSON.stringify(topicData, null, 2)}
        </pre>
      </div>
    </div>
  );
}