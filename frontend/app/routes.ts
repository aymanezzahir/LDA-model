import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("trends", "routes/trends.tsx"),
    route("search", "routes/search.tsx"),
    route("stats", "routes/stats.tsx"),
    route("stats/:topicId", "routes/stats-topic.tsx"),
] satisfies RouteConfig;