# Deploying to Cloudflare Pages

This guide outlines the steps to deploy this Astro project to Cloudflare Pages.

## Setup Instructions

1. **Create a Cloudflare Account**
   - Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) if you don't already have an account.

2. **Connect Your Repository**
   - In the Cloudflare dashboard, go to "Pages".
   - Click "Create a project".
   - Connect to your Git provider (GitHub, GitLab, etc.) and select this repository.

3. **Configure Build Settings**
   - Set the following build configuration:
     - **Production branch**: `main` (or your default branch)
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
     - **Node.js version**: 18 (or later)

4. **Environment Variables (Optional)**
   - If your project uses environment variables, add them in the Cloudflare Pages settings.

5. **Advanced Settings**
   - The project already includes:
     - `_headers` file for proper caching and security headers
     - `_redirects` file for URL handling
     - `cloudflare.toml` for configuration

## Post-Deployment

After deployment:

1. **Custom Domain (Optional)**
   - In the project settings, go to "Custom domains".
   - Add your domain and follow the instructions to set up DNS.

2. **Check Headers and Caching**
   - Verify that your security headers and caching policies are working correctly.

3. **Analytics**
   - Enable Cloudflare Analytics to monitor site performance and traffic.

## Troubleshooting

- If you encounter build errors, check the build logs in the Cloudflare Pages dashboard.
- For routing issues, verify the `_redirects` file is correctly set up.
- For caching issues, check the `_headers` file configuration.

## Local Development

Continue using `npm run dev` for local development. The Cloudflare-specific files won't affect local development. 