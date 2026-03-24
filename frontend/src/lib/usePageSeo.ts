import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

type PageSeoOptions = {
  title: string;
  description: string;
  image?: string;
  type?: string;
  robots?: string;
  canonicalPath?: string;
  structuredData?: StructuredData;
};

const SITE_NAME =
  (import.meta.env.VITE_APP_NAME as string | undefined)?.trim() ||
  "Sunu Cagnotte";
const DEFAULT_IMAGE = "/banner/banniere.png";
const DEFAULT_ROBOTS = "index,follow";
const DEFAULT_TYPE = "website";
const STRUCTURED_DATA_ID = "page-seo-structured-data";

function getBaseUrl() {
  const configuredUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();

  if (configuredUrl && /^https?:\/\//.test(configuredUrl)) {
    return configuredUrl.replace(/\/+$/, "");
  }

  return window.location.origin;
}

function toAbsoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return new URL(path, `${getBaseUrl()}/`).toString();
}

function upsertNamedMeta(name: string, content: string) {
  let tag = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.append(tag);
  }

  tag.setAttribute("content", content);
}

function upsertPropertyMeta(property: string, content: string) {
  let tag = document.head.querySelector(
    `meta[property="${property}"]`,
  ) as HTMLMetaElement | null;

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.append(tag);
  }

  tag.setAttribute("content", content);
}

function upsertCanonicalLink(href: string) {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.append(link);
  }

  link.setAttribute("href", href);
}

export function usePageSeo({
  title,
  description,
  image = DEFAULT_IMAGE,
  type = DEFAULT_TYPE,
  robots = DEFAULT_ROBOTS,
  canonicalPath,
  structuredData,
}: PageSeoOptions) {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;
    const canonicalUrl = toAbsoluteUrl(canonicalPath ?? location.pathname);
    const imageUrl = toAbsoluteUrl(image);
    const twitterCard = imageUrl ? "summary_large_image" : "summary";

    document.title = pageTitle;
    upsertNamedMeta("description", description);
    upsertNamedMeta("robots", robots);
    upsertNamedMeta("twitter:card", twitterCard);
    upsertNamedMeta("twitter:title", pageTitle);
    upsertNamedMeta("twitter:description", description);
    upsertNamedMeta("twitter:image", imageUrl);
    upsertPropertyMeta("og:type", type);
    upsertPropertyMeta("og:site_name", SITE_NAME);
    upsertPropertyMeta("og:title", pageTitle);
    upsertPropertyMeta("og:description", description);
    upsertPropertyMeta("og:url", canonicalUrl);
    upsertPropertyMeta("og:image", imageUrl);
    upsertPropertyMeta("og:image:alt", title);
    upsertPropertyMeta("og:locale", "fr_SN");
    upsertCanonicalLink(canonicalUrl);

    const existingStructuredData = document.getElementById(STRUCTURED_DATA_ID);

    if (structuredData) {
      const script =
        existingStructuredData instanceof HTMLScriptElement
          ? existingStructuredData
          : document.createElement("script");

      script.id = STRUCTURED_DATA_ID;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);

      if (!existingStructuredData) {
        document.head.append(script);
      }
    } else if (existingStructuredData) {
      existingStructuredData.remove();
    }
  }, [canonicalPath, description, image, location.pathname, robots, structuredData, title, type]);
}
