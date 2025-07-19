# StreamHub - Ultimate Video Streaming Platform

A modern, responsive video streaming platform built with React and Vite, featuring a beautiful UI and seamless user experience across all devices.

## 🚀 Features

### ✨ Responsive Design

- **Mobile-First Approach**: Optimized for mobile devices with progressive enhancement
- **Cross-Device Compatibility**: Perfect experience on phones, tablets, and desktops
- **Adaptive Layout**: Dynamic grid system that adapts to screen sizes
- **Touch-Friendly Interface**: Optimized for touch interactions on mobile devices

### 🎥 Video Experience

- **Custom Video Player**: Full-featured video player with controls
- **Responsive Video Grid**: Adaptive video cards that look great on any screen
- **Category Filtering**: Easy navigation through video categories
- **Premium Content Support**: Special badges for premium videos
- **Loading States**: Smooth loading animations and error handling

### 🎨 Modern UI/UX

- **Design System**: Consistent spacing, colors, and typography
- **Dark Mode Support**: Automatic dark mode detection
- **Accessibility**: WCAG compliant with keyboard navigation
- **Smooth Animations**: Subtle animations and transitions
- **Modern Typography**: Inter font for better readability

### 📱 Mobile Features

- **Mobile Menu**: Collapsible sidebar for mobile devices
- **Touch Gestures**: Swipe-friendly interface
- **Optimized Performance**: Fast loading on mobile networks
- **PWA Ready**: Progressive Web App capabilities

## 🛠️ Technical Stack

- **Frontend**: React 19, Vite
- **Styling**: CSS3 with CSS Custom Properties
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: SVG icons for crisp display
- **Fonts**: Inter (Google Fonts)

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px - 1279px
- **Large Desktop**: ≥ 1280px

## 🎯 Key Components

### UserLayout

- Responsive header with search functionality
- Collapsible sidebar with navigation
- Mobile menu with smooth animations
- Premium subscription promotion

### Home Component

- Category filtering with horizontal scroll
- Responsive video grid
- Loading states and error handling
- Video player integration

### VideoPlayer

- Full-screen video player
- Custom controls with keyboard shortcuts
- Volume control and fullscreen support
- Mobile-optimized interface

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Stream_Hub/Frontend/Stream_Hub_Interface
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 🎨 Design System

### Colors

- **Primary**: `#ff5e62` (Orange-Red)
- **Secondary**: `#ff9966` (Orange)
- **Accent**: `#646cff` (Purple)
- **Text Primary**: `#2d3143` (Dark Gray)
- **Background**: `#fafbfc` (Light Gray)

### Typography

- **Font Family**: Inter, system fonts
- **Font Sizes**: Responsive scale from 0.75rem to 2.25rem
- **Line Heights**: Optimized for readability

### Spacing

- **Base Unit**: 0.25rem (4px)
- **Scale**: xs, sm, md, lg, xl, 2xl
- **Responsive**: Adapts to screen size

## 📱 Mobile Optimizations

### Performance

- Lazy loading for images
- Optimized bundle size
- Efficient CSS with utility classes
- Minimal JavaScript for better performance

### User Experience

- Touch-friendly button sizes (minimum 44px)
- Adequate spacing between interactive elements
- Smooth scrolling and animations
- Clear visual hierarchy

### Accessibility

- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences

## 🔧 Customization

### CSS Custom Properties

All design tokens are defined as CSS custom properties in `src/index.css`:

```css
:root {
  --primary-color: #ff5e62;
  --spacing-md: 1rem;
  --font-size-base: 1rem;
  /* ... more variables */
}
```

### Responsive Utilities

Utility classes for responsive design:

```css
.hidden {
  display: none;
}
.sm:hidden {
  display: none;
} /* Hidden on small screens */
.md:flex {
  display: flex;
} /* Flex on medium screens */
```

## 🎯 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple devices
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ for the best video streaming experience**
