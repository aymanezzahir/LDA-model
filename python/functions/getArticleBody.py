from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from bs4 import BeautifulSoup
import time
from .UTJ import UTJ

def getArticleBody(analysis: dict) -> str | None:
    options = Options()
    options.add_argument("--headless")
    driver = webdriver.Firefox(options=options)

    content = ""  

    try:
        driver.get(analysis["url"])
        time.sleep(2)
        soup = BeautifulSoup(driver.page_source, "html.parser")

        platform = analysis.get("platform", "").lower()

        # ---------------- DEV.TO ----------------
        if platform == "dev.to":
            body = soup.select_one("div.crayons-article__body")
            if not body:
                raise ValueError("Dev.to body not found")

            parts = []
            for el in body.find_all(["h1", "h2", "h3", "p", "li"], recursive=True):
                text = el.get_text(" ", strip=True)
                if not text:
                    continue
                if el.name in ("h1", "h2", "h3"):
                    parts.append(f"\n## {text}\n")
                elif el.name == "li":
                    parts.append(f"- {text}")
                else:
                    parts.append(text)

            content = "\n".join(parts).strip()

        # ---------------- GITHUB RESOURCES ----------------
        elif platform in ("github", "github.com"):
            container = (
                soup.select_one("main div[class*='Prose']")
                or soup.select_one("article div[class*='Prose']")
            )
            if not container:
                raise ValueError("GitHub Prose content container not found")

            parts = []
            for el in container.find_all(["h1", "h2", "h3", "p", "li"], recursive=True):
                text = el.get_text(" ", strip=True)
                if not text:
                    continue
                if el.name in ("h1", "h2", "h3"):
                    parts.append(f"\n## {text}\n")
                elif el.name == "li":
                    parts.append(f"- {text}")
                else:
                    parts.append(text)

            content = "\n".join(parts).strip()
          # ---------------- techcrunch ----------------
        elif platform in ("techcrunch", "techcrunch.com"):
            container = soup.select_one(".wp-block-post-content")
            if not container:
                raise ValueError("TechCrunch content container not found")

            parts = []
            for el in container.find_all(["h1", "h2", "h3", "p", "li"], recursive=True):
                text = el.get_text(" ", strip=True)
                if not text:
                    continue
                if el.name in ("h1", "h2", "h3"):
                    parts.append(f"\n## {text}\n")
                elif el.name == "li":
                    parts.append(f"- {text}")
                else:
                    parts.append(text)

            content = "\n".join(parts).strip()
        else:
            raise ValueError(f"Unsupported platform: {platform}")

        if len(content) < 200:
            raise ValueError("Content too short (blocked or invalid page)")

        return content

    except Exception as e:
        print(f"Error fetching article body: {e}")
        return None

    finally:
        driver.quit()


print(getArticleBody(UTJ("https://github.com/resources/articles/software-development-with-retrieval-augmentation-generation-rag")))
