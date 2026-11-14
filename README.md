# LankaMithuru

**Your friend for everything Sri Lanka.**

A unified Sri Lankan discovery platform with three connected divisions:

- **Explore** — destinations, experiences, food and places to stay.
- **Hub** — local businesses, services, jobs, events and opportunities.
- **Edu** — learning resources, A/L and O/L study support, past papers and skills.

## Current build

The responsive website now has a homepage plus dedicated Explore (`explore.html`), Hub (`hub.html`) and Edu (`edu.html`) pages. It uses HTML, CSS and vanilla JavaScript, shared navigation and search, a custom embrace-inspired SVG brand mark, responsive layouts and SEO metadata.

The directory and education catalogues are not yet backed by live data. Category links are entry points, not verified business or education records.

## Planned architecture

- Frontend hosting: Cloudflare Pages
- Source control: GitHub
- Database and authentication: Supabase free tier, subject to account limits and configuration
- Content management: Admin-managed records with moderation
- Security: Row Level Security for exposed user and content tables

## Preview

Open `index.html` in a browser or serve this folder with a static file server.

## Roadmap

1. Responsive public website foundation
2. Explore destination and category directories
3. Hub business, service, job and event listings
4. Edu resources and structured subject catalogues
5. Supabase schema, authentication and role-aware access
6. Submission workflows and moderation dashboard
7. Accessibility, search improvements and production testing

## Security

Never put Supabase service-role keys or other secrets in frontend files. Only publishable client configuration belongs in browser code. Enable Row Level Security and create access policies before exposing tables.
