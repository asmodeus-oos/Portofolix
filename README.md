# Mohamed Elsayed Hegazy | Premium Interdisciplinary Portfolio

A world-class, premium personal portfolio website designed for **Mohamed Elsayed Hegazy**, bridging clinical dental medicine, UI/UX product designs, and front-end engineering. Inspired by the visual systems of Apple VisionOS, Linear, Arc Browser, and Tesla.

Live Site Preview: Serves locally on [http://localhost:8080](http://localhost:8080)

---

## 🎨 Design Philosophy & Features

*   **Liquid Glassmorphism**: Frosted glass panel overlays using `backdrop-filter: blur(32px) saturate(190%)` and specular translucent edge highlights.
*   **Grid Spotlight Glows**: Specular glowing lighting that tracks cursor movements inside every glass card.
*   **Custom Elastic Cursor**: A custom glass cursor tracker driving an outer ring utilizing spring-delayed interpolation (`lerp`) to drag behind the mouse. Snaps and expands when hovering over interactive targets.
*   **Magnetic Snapping**: Interactive buttons pull towards the cursor, snapping back to neutral on leave to increase conversion.
*   **Dynamic Ambient Background**: An HTML5 Canvas rendering fluid, interactive gradient blobs and vertical glass dust particles that float and react to cursor gravity.
*   **GitHub Integration**: Fetches real-time profile metrics and repository lists (filtering out forks), with an offline fallback cache.

---

## 🛠️ Project Structure

```
├── assets/
│   └── profile.jpg      # Optimized volumetric portrait photo
├── index.html           # Accessible semantic markup & SVGs
├── style.css            # CSS variables, grids, and visual animations
├── script.js            # Canvas math, cursor lerp, and API integration
├── vercel.json          # Vercel deployment, CDN routing, and cache rules
└── README.md            # Project and deployment documentation
```

---

## 🚀 Local Development

To run the project locally, launch any static HTTP server in the root folder:

### Using Node (npx)
```bash
npx http-server . -p 8080
```

### Using Python
```bash
python3 -m http-server 8080
```

---

## 📦 Vercel Deployment

This project is configured with a `vercel.json` file for production deployment. Vercel automatically detects the static repository structure.

### Deploying via Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Link and deploy: `vercel`
3. Push to production: `vercel --prod`

### Edge Optimizations in `vercel.json`
*   **Clean URLs**: Rewrites path extensions for cleaner user navigation.
*   **CDN Cache-Control**: Configures long-term immutable caching headers for static assets (`/assets/*`), scripts, and stylesheets, ensuring fast global loads.
*   **Security Headers**: Configures security headers to prevent clickjacking and verify resource requests.
