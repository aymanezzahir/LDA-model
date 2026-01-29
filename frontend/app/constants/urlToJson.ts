interface URLAnalysis {
  valid: boolean;
  platform?: string;
  type?: "repo" | "article" | "user" | "organization";
  owner?: string;
  repo?: string;
  url?: string;
  path?: string;
  error?: string;
}

export default function UTJ(url: string): URLAnalysis {
  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    return {
      valid: false,
      error: "Invalid URL format",
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname;

  // GitHub
  if (hostname === "github.com" || hostname === "www.github.com") {
    const pathParts = pathname.split("/").filter(Boolean);

    if (pathParts.length === 0) {
      return {
        valid: true,
        platform: "github",
        type: "article",
        url: url,
      };
    }

    if (pathParts.length === 1) {
      return {
        valid: true,
        platform: "github",
        type: "user",
        url: url,
        owner: pathParts[0],
      };
    }

    if (pathParts.length >= 2) {
      const owner = pathParts[0];
      const repo = pathParts[1];

      return {
        valid: true,
        platform: "github",
        url: url,
        type: "repo",
        owner,
        repo,
        path: pathParts.slice(2).join("/"),
      };
    }
  }

  // Medium
  if (
    hostname === "medium.com" ||
    hostname === "www.medium.com" ||
    hostname.endsWith(".medium.com")
  ) {
    return {
      valid: true,
      platform: "medium",
      url: url,
      type: "article",
      path: pathname,
    };
  }

  // Dev.to
  if (hostname === "dev.to" || hostname === "www.dev.to") {
    return {
      valid: true,
      platform: "dev.to",
      type: "article",
      url: url,
      path: pathname,
    };
  }

  // Hashnode
  if (hostname.endsWith(".hashnode.dev") || hostname === "hashnode.com") {
    return {
      valid: true,
      platform: "hashnode",
      type: "article",
      path: pathname,
    };
  }

  // Stack Overflow
  if (
    hostname === "stackoverflow.com" ||
    hostname === "www.stackoverflow.com"
  ) {
    return {
      valid: true,
      platform: "stackoverflow",
      type: "article",
      path: pathname,
    };
  }

  // Substack
  if (hostname.endsWith(".substack.com")) {
    return {
      valid: true,
      platform: "substack",
      type: "article",
      path: pathname,
    };
  }

  // GitLab
  if (hostname === "gitlab.com" || hostname === "www.gitlab.com") {
    const pathParts = pathname.split("/").filter(Boolean);

    if (pathParts.length >= 2) {
      return {
        valid: true,
        platform: "gitlab",
        type: "repo",
        url: url,
        owner: pathParts[0],
        repo: pathParts[1],
        path: pathParts.slice(2).join("/"),
      };
    }

    return {
      valid: true,
      platform: "gitlab",
      type: "article",
    };
  }

  // Generic article platforms (blogs, news sites, etc.)
  const articlePlatforms = [
    "towards-data-science.com",
    "towardsdatascience.com",
    "hackernoon.com",
    "freecodecamp.org",
    "css-tricks.com",
    "smashingmagazine.com",
    "a-list-apart.com",
    "auth0.com",
  ];

  for (const platform of articlePlatforms) {
    if (hostname.includes(platform)) {
      return {
        valid: true,
        platform: platform.replace(".com", "").replace(".org", ""),
        type: "article",
        url: url,
        path: pathname,
      };
    }
  }

  // Unknown platform
  return {
    valid: true,
    platform: "unknown",
    type: "article",
    url: url,
    path: pathname,
  };
}
