from typing import TypedDict, Optional, Literal
from urllib.parse import urlparse


class URLAnalysis(TypedDict, total=False):
    valid: bool
    platform: str
    type: Literal["repo", "article", "user", "organization"]
    owner: str
    repo: str
    url: str
    path: str
    error: str


def UTJ(url: str) -> URLAnalysis:
    # Validate URL format
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            raise ValueError
    except Exception:
        return {
            "valid": False,
            "error": "Invalid URL format",
        }

    hostname = parsed.hostname.lower() if parsed.hostname else ""
    pathname = parsed.path or ""

    # GitHub
    if hostname in ("github.com", "www.github.com"):
        path_parts = [p for p in pathname.split("/") if p]

        if len(path_parts) == 0:
            return {
                "valid": True,
                "platform": "github",
                "type": "article",
                "url": url,
            }

        if len(path_parts) == 1:
            return {
                "valid": True,
                "platform": "github",
                "type": "user",
                "url": url,
                "owner": path_parts[0],
            }

        if len(path_parts) >= 2:
            return {
                "valid": True,
                "platform": "github",
                "type": "repo",
                "url": url,
                "owner": path_parts[0],
                "repo": path_parts[1],
                "path": "/".join(path_parts[2:]),
            }

    # techcrunch
    if hostname in ("techcrunch.com", "www.techcrunch.com") or hostname.endswith(".techcrunch.com"):
        return {
            "valid": True,
            "platform": "techcrunch",
            "type": "article",
            "url": url,
            "path": pathname,
        }

    # Dev.to
    if hostname in ("dev.to", "www.dev.to"):
        return {
            "valid": True,
            "platform": "dev.to",
            "type": "article",
            "url": url,
            "path": pathname,
        }

    # Hashnode
    if hostname.endswith(".hashnode.dev") or hostname == "hashnode.com":
        return {
            "valid": True,
            "platform": "hashnode",
            "type": "article",
            "path": pathname,
        }

    # Stack Overflow
    if hostname in ("stackoverflow.com", "www.stackoverflow.com"):
        return {
            "valid": True,
            "platform": "stackoverflow",
            "type": "article",
            "path": pathname,
        }

    # Substack
    if hostname.endswith(".substack.com"):
        return {
            "valid": True,
            "platform": "substack",
            "type": "article",
            "path": pathname,
        }

    # GitLab
    if hostname in ("gitlab.com", "www.gitlab.com"):
        path_parts = [p for p in pathname.split("/") if p]

        if len(path_parts) >= 2:
            return {
                "valid": True,
                "platform": "gitlab",
                "type": "repo",
                "url": url,
                "owner": path_parts[0],
                "repo": path_parts[1],
                "path": "/".join(path_parts[2:]),
            }

        return {
            "valid": True,
            "platform": "gitlab",
            "type": "article",
        }

    # Generic article platforms
    article_platforms = [
        "towards-data-science.com",
        "towardsdatascience.com",
        "hackernoon.com",
        "freecodecamp.org",
        "css-tricks.com",
        "smashingmagazine.com",
        "a-list-apart.com",
        "auth0.com",
    ]

    for platform in article_platforms:
        if platform in hostname:
            return {
                "valid": True,
                "platform": platform.replace(".com", "").replace(".org", ""),
                "type": "article",
                "url": url,
                "path": pathname,
            }

    # Unknown platform
    return {
        "valid": True,
        "platform": "unknown",
        "type": "article",
        "url": url,
        "path": pathname,
    }
