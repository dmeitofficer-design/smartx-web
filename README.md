# SmartX CMS — SmartX Technology Limited

Full-stack CMS website for **SmartX Technology Limited (SmartX)**, exclusive DRGEM distributor in Bangladesh.

**Stack:** Next.js 16 · MongoDB · Framer Motion · Plain CSS Variables

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure (edit MONGODB_URI and JWT_SECRET)
# .env.local is already included

# 3. Seed database (creates admin + 6 DRGEM products + all defaults)
node scripts/seed.js

# 4. Run
npm run dev
```

- **Website:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login
- **Default credentials:** admin / admin ← change immediately!

---

## What's in the Admin Panel

| Section | Editable Fields |
|---------|----------------|
| Hero | Headline, subheadline, badge, CTA buttons, stats bar, background image |
| About | Body text, mission/vision, image, highlight cards |
| Products | Full CRUD — image, category, features, specs, badge, draft/publish |
| Team | Photos, roles, bios, social links |
| Messages | Inbox with read/replied status, reply via email |
| Settings | Colors, fonts, contact info, social links, navigation, SEO |

## Replacing Placeholder Images

Go to **Admin → [Section] → Edit** and use the image upload area.
Images stored as base64 in MongoDB — no file server needed.

## Changing Colors Globally

**Admin → Settings → Branding & Colors** → pick a preset or enter hex values → Save.
Changes inject into `:root` CSS variables — entire site updates instantly.

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/smartx_web
JWT_SECRET=your-long-random-secret-here
```
