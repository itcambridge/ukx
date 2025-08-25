# UKX Website Documentation

## Overview

The UKX (Union Jack Coin) website is a simple, static website that serves as the landing page for the UKX cryptocurrency token. The site is built with a focus on simplicity and performance, using vanilla HTML, CSS, and JavaScript without any frameworks or build tools.

- **Technology Stack**: HTML5, CSS3, Vanilla JavaScript
- **Hosting**: Linode server (accessible at unionjackcoins.co.uk)
- **Repository**: GitHub (https://github.com/itcambridge/ukx)

## Build & Deployment Process

We follow a straightforward, manual deployment process that avoids unnecessary complexity:

1. **Local Development**
   - Make changes to the site files on your local machine
   - Test changes by opening the HTML files directly in your browser
   - No build step or compilation required

2. **Version Control**
   - Commit changes to the local Git repository
   - Push changes to the main branch on GitHub:
     ```
     git add .
     git commit -m "Description of changes"
     git push origin main
     ```

3. **Deployment**
   - SSH into the Linode server:
     ```
     ssh root@unionjackcoins.co.uk
     ```
   - Navigate to the website directory
   - Pull the latest changes from GitHub:
     ```
     git pull origin main
     ```
   - No restart or build commands needed - changes are live immediately

### Why We Avoid Deployment Scripts

We intentionally keep our deployment process manual and simple:
- Reduces dependencies and potential points of failure
- Provides direct control over when and how changes go live
- Eliminates the need to maintain and update deployment configurations
- Makes the process accessible to team members with varying technical backgrounds

## Site Structure

The website is organized as a single-page application with anchor links to different sections:

- **index.html**: The main (and only) HTML file containing all content
- **assets/**: Directory containing all media files:
  - Images of British landmarks for the carousel
  - Union Jack Coin video
  - Whitepaper PDF
  - Tokenomics pie chart (pie_chart.png)

### Key Components

- **Hero Section**: Features an autoplay video background with an image carousel fallback
- **Navigation**: Sticky navigation with anchor links to page sections
- **Content Sections**: Mission, How to Buy, Tokenomics, Whitepaper, Roadmap, and FAQ
- **Footer**: Copyright information and social media links

### CSS Approach

All styling is contained within a single `<style>` block in the HTML head, using:
- CSS variables for consistent theming
- Responsive design with media queries
- Modern CSS features (flexbox, grid, etc.)

### JavaScript Functionality

The site includes minimal JavaScript for essential functionality:
- Image carousel rotation in the hero section
- Video playback fallback detection
- Dynamic contract button display (when mainnet address is set)
- Whitepaper PDF embedding
- Current year display in the footer

## Maintenance Guidelines

### Making Common Updates

1. **Content Updates**:
   - Edit text directly in the HTML file
   - For section changes, locate the corresponding section by its ID (e.g., `<section id="mission">`)

2. **Adding/Replacing Images**:
   - Add new images to the `assets/` directory
   - To update carousel images, modify the `imagePaths` array in the JavaScript section

3. **Updating the Contract Address**:
   - When the token launches on mainnet, update the `UKX_MAINNET` variable in the JavaScript section

4. **Whitepaper Updates**:
   - Replace the PDF file in the assets directory (keep the same filename)
   - No code changes needed if the filename remains the same

### Testing Recommendations

- Test all changes locally before pushing to GitHub
- Verify responsive behavior at different screen sizes
- Check that all links work correctly
- Ensure media (images, video) loads properly
- Validate that the PDF whitepaper displays correctly

## Conclusion

This intentionally simple approach to website development and deployment allows us to maintain a reliable, performant website without the overhead of complex build systems or deployment pipelines. By documenting this process once, we avoid the need to create new documentation frequently, as the fundamental workflow remains consistent over time.
