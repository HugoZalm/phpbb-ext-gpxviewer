# GPX Viewer

A phpBB extension that embeds an interactive GPX route — a Leaflet map plus an elevation profile — directly inside a forum post. Authors upload or pick a `.gpx` attachment and insert a `[gpx=N]` tag; readers see the route inline without downloading anything.

- phpBB: 3.3.x (`>=3.3,<3.4`)
- PHP: 7.2 or newer (8.x supported)
- Languages: English and Dutch

No new permissions are introduced: everything flows through the board's existing post and attachment permissions.

## Installing and enabling

1. Place this directory at `ext/hugozalm/gpxviewer/` in your phpBB installation.
2. Go to **ACP → Customise → Manage extensions**.
3. Find **GPX Viewer** under *Disabled extensions* and click **Enable**.

Enabling installs, in one step:

- the `[gpx=N]` custom BBCode,
- a dedicated **GPX** attachment extension group that allows the `.gpx` file type,
- the five default settings and the **GPX Viewer settings** ACP module.

Nothing about your existing attachment groups, forums or permissions is changed.

To remove everything, click **Disable** and then **Delete data** (purge): the BBCode, the GPX attachment group and the settings are all removed. (Post text keeps its `[gpx=N]` tags, but they no longer render.)

## Admin settings

Find them at **ACP → Extensions → GPX Viewer → GPX Viewer settings**.

| Setting | Default | What it does |
| --- | --- | --- |
| **Tile URL** | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | The tile server the map fetches tiles from. Keep `{s}`, `{z}`, `{x}` and `{y}` as placeholders. |
| **Attribution** | `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>` | The credit shown in the map corner. Basic HTML links are allowed. |
| **Map height** | `450` | Height of the map, in pixels. |
| **Profile height** | `180` | Height of the elevation profile, in pixels. |
| **Maximum zoom** | `19` | The deepest zoom level readers can reach. |

Changes apply the next time a post with a viewer is displayed. Every save is recorded in the admin log.

> **Map tiles are fetched from the configured tile source** — OpenStreetMap by default. Serving map tiles is a third-party service: check the provider's usage terms (and, if you need to, switch the Tile URL to a provider that suits your board's privacy or rate-limit needs). The map/profile libraries themselves are bundled with the extension; only the tiles are external.

## Embedding a route (author flow)

1. Write your post as usual and click the **GPX** button in the editor toolbar.
   The button only appears when both BBCode and attachments are allowed for the post.
2. In the **Insert GPX route** panel you can either:
   - **Upload a GPX file** from your computer (it is attached to this post through phpBB's normal uploader), or
   - pick a `.gpx` file you have already attached to this post.
3. Optionally fill in **Map height (px)** and/or **Profile height (px)** to size this one viewer differently from the board default. Leave a field blank to use the board default; the placeholder shows what that is.
4. Choosing a file inserts a tag like `[gpx=N]` (or `[gpx=N map-height=500 profile-height=250]` when you filled the fields) at the cursor, where `N` is the attachment's id. Move the tag wherever you want the viewer to appear in the post text. You can add several viewers to one post.
5. Use **Preview** to check the map and profile, then submit. The viewer draws inline exactly where you placed the tag.

Readers see the route rendered using their download permission for the attachment, so content in private forums stays private. If a file cannot be loaded, the viewer shows an error instead of a blank box.

### Per-viewer sizes

A viewer always uses the board's **Map height** and **Profile height** unless the tag overrides them:

- `[gpx=N]` — both heights from the ACP settings.
- `[gpx=N map-height=500]` — taller map, default profile height.
- `[gpx=N map-height=500 profile-height=250]` — both overridden.

Each height is a plain number of pixels between `1` and `2000`. The keys are optional and independent, and may be written in any order. A value that is not a whole number in that range is ignored (the board default is used for that height), so a typo never breaks the viewer. The editor panel inserts these keys for you.

## Notes

- Only `.gpx` files are offered by the panel and accepted by the uploader.
- A GPX row counts as a normal attachment for quota and lifecycle purposes.
- The viewer's scripts and styles are loaded only on pages that actually contain a route (including the posting preview); other pages are unaffected.
