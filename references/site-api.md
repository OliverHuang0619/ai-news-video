# aixiaoerke.com/news — API Reference

## Base URL

`https://aixiaoerke.com/api/news`

## Endpoints

### GET /api/news

Fetch paginated AI news articles.

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number (1-based) |
| `size` | int | 10 | Articles per page (1-100) |

**Response:**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 806,
    "page": 1,
    "size": 10,
    "list": [
      {
        "id": 826,
        "title": "NBA中国携手阿里巴巴上线首个官方大模型\"NBA Chat\"",
        "publish_time": "2026-06-06T09:00:24.804377",
        "summary": "正值NBA总决赛正式开赛之际，NBA中国宣布…",
        "category": "industry",
        "source": "https://news.aibase.com/zh/news/28684",
        "cover_image": null,
        "status": "published",
        "view_count": 0,
        "created_at": "2026-06-06T01:00:24.818739",
        "updated_at": "2026-06-06T01:00:24.818739"
      }
    ]
  }
}
```

### GET /api/news/:id

Fetch a single article by its ID.

**Path parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | int | Article ID (returned in list response) |

**Response:** Same object structure as individual list items. The `summary` field contains the full article body (usually 300-800+ Chinese characters).

**Notes:**
- The `summary` field in the detail response IS the full article text — not a shortened excerpt. Use this for deep-dive content extraction (see `fetch-detail.mjs`).
- There is no separate "full body" endpoint; `/api/news/:id` returns the complete source text in the `summary` field.

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Unique article ID |
| `title` | string | Chinese news headline |
| `publish_time` | ISO 8601 | Publication timestamp |
| `summary` | string | Full article body (300-800+ Chinese chars) |
| `category` | string | Category slug (e.g. `"industry"`, `"product"`) |
| `source` | string | Original article URL |
| `cover_image` | string\|null | Optional cover image URL |
| `view_count` | int | View count |
| `total` | int | Total articles across all pages |

## Notes

- Summary is in Chinese, typically 300-800+ characters (not just an excerpt).
- Articles are ordered by `publish_time` descending (newest first).
- `cover_image` may be null — many articles have no image.
- The frontend is a client-rendered SPA; the API is the cleanest way to get article data.

## Related Scripts

- `scripts/fetch-news.mjs` — fetch and format news list as markdown
- `scripts/fetch-detail.mjs` — fetch full detail for individual articles by ID
- `scripts/extract-key-points.mjs` — structure article content for 3-key-point extraction
- `scripts/srt-to-captions.mjs` — generate caption overlay from edge-tts SRT
