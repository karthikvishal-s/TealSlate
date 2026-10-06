import { useEffect } from 'react';

const ORIGIN = 'https://tealslate.studio';

// Head tags a page can override, keyed by selector → attribute.
const TAGS = {
  description: ['meta[name="description"]', 'content'],
  canonical: ['link[rel="canonical"]', 'href'],
  ogUrl: ['meta[property="og:url"]', 'content'],
  ogTitle: ['meta[property="og:title"]', 'content'],
  ogDescription: ['meta[property="og:description"]', 'content'],
  twitterTitle: ['meta[name="twitter:title"]', 'content'],
  twitterDescription: ['meta[name="twitter:description"]', 'content'],
};

/**
 * Per-route title, description, canonical URL and social tags (the defaults live in
 * index.html). Everything is restored when the page unmounts.
 */
export function usePageMeta({ title, description, path }) {
  useEffect(() => {
    const url = `${ORIGIN}${path}`;
    const next = {
      description,
      canonical: url,
      ogUrl: url,
      ogTitle: title,
      ogDescription: description,
      twitterTitle: title,
      twitterDescription: description,
    };
    const previous = { title: document.title };
    document.title = title;
    Object.entries(TAGS).forEach(([key, [selector, attr]]) => {
      const el = document.head.querySelector(selector);
      if (!el || next[key] == null) return;
      previous[key] = el.getAttribute(attr);
      el.setAttribute(attr, next[key]);
    });
    return () => {
      document.title = previous.title;
      Object.entries(TAGS).forEach(([key, [selector, attr]]) => {
        const el = document.head.querySelector(selector);
        if (el && previous[key] != null) el.setAttribute(attr, previous[key]);
      });
    };
  }, [title, description, path]);
}
