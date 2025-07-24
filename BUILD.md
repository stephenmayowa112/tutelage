
# Tutelage Services

## Build Instructions for Vercel

If you encounter build issues, try these steps:

1. **Check Dependencies**: Make sure all dependencies are in the correct section of package.json
2. **Clear Cache**: Delete node_modules and package-lock.json, then npm install
3. **Use Framework Preset**: Try using "Static" framework preset in Vercel dashboard

## Build Commands

- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `.` (root directory)

## Performance Optimizations Applied

- ✅ CSS minification with TailwindCSS CLI
- ✅ Unused CSS purging
- ✅ Image optimization with lazy loading
- ✅ JavaScript deferring
- ✅ Resource preloading
- ✅ Cache headers for static assets
- ✅ DNS prefetching

## Manual Deployment Fallback

If automated build fails, you can build locally and deploy the output:

```bash
npm install
npm run build
# Then drag and drop the folder to Vercel dashboard
```
