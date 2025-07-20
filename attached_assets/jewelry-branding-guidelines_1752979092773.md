# Casper's Treasure Chest - Brand Guidelines

## Brand Identity

**Brand Name:** Casper's Treasure Chest  
**Tagline:** Premium Jewelry Collection  
**Mission:** Discover exquisite jewelry pieces with AI-powered product discovery

### Brand Personality

- **Premium:** High-quality, luxury aesthetic without being pretentious
- **Elegant:** Sophisticated design choices that reflect jewelry craftsmanship
- **Trustworthy:** Reliable, secure, and authentic experience
- **Innovative:** Modern technology integrated seamlessly with classic jewelry appreciation
- **Timeless:** Enduring appeal that transcends trends

## Visual Identity

### Logo Usage

The primary logo consists of a gem icon within an amber gradient circle paired with the brand name and tagline.

**Logo Elements:**

- Icon: Gem symbol (Lucide React Gem icon)
- Background: Amber gradient (`from-amber-500 to-amber-600`)
- Typography: Geist font family
- Layout: Horizontal lockup with icon left, text right

**Logo Variations:**

- Primary: Full logo with tagline
- Secondary: Logo without tagline
- Icon only: For social media and small applications

### Color Palette

#### Primary Colors

- **Amber 500:** `#f59e0b` - Primary brand color, buttons, highlights
- **Amber 600:** `#d97706` - Hover states, deeper brand applications
- **Slate 800:** `#1e293b` - Primary text color
- **White:** `#ffffff` - Background, card backgrounds

#### Secondary Colors

- **Slate 50-900:** Complete gray scale for text hierarchy and backgrounds
- **Purple 600:** `#7c3aed` - Secondary accent (legacy from static site)
- **Red 500:** `#ef4444` - Error states, out of stock indicators
- **Green 500:** `#10b981` - Success states, in stock indicators

#### Gradient Applications

- **Primary Gradient:** `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`
- **Background Gradient:** `linear-gradient(to bottom right, #f8fafc 0%, #f1f5f9 100%)`
- **Text Gradient:** `linear-gradient(to right, #d97706 0%, #b45309 100%)`

### Typography

#### Font Stack

- **Primary:** Geist (Google Fonts)
- **Monospace:** Geist Mono
- **Fallback:** Arial, Helvetica, sans-serif

#### Type Scale

- **Display (5rem):** Hero headlines, main page titles
- **H1 (3rem):** Page titles, major section headers
- **H2 (2rem):** Section titles, card headers
- **H3 (1.5rem):** Subsection titles, product names
- **H4 (1.25rem):** Component titles, form labels
- **Body (1rem):** Body text, descriptions
- **Small (0.875rem):** Supporting text, captions
- **XS (0.75rem):** Labels, tags, metadata

#### Typography Best Practices

- Use font weights 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Maintain line height ratios: 1.1-1.2 for headlines, 1.4-1.6 for body text
- Apply text gradients sparingly for primary headings only
- Ensure sufficient contrast (minimum 4.5:1) for all text

## Component Guidelines

### Buttons

#### Primary Buttons

- Use amber gradient background
- White text with semibold weight
- Include shadow and hover effects
- Standard padding: `px-4 py-2` (medium), `px-6 py-3` (large)
- Border radius: `rounded-lg`

#### Secondary Buttons

- Light gray background (`bg-slate-100`)
- Dark gray text (`text-slate-600`)
- Hover to darker gray
- Same sizing as primary buttons

#### Icon Buttons

- Square aspect ratio with padding
- Consistent with text button border radius
- Use Lucide React icons at appropriate sizes

### Cards

#### Product Cards

- White background with `rounded-2xl`
- Large shadow with hover elevation increase
- Aspect ratio square for product images
- Group hover effects for image scaling and action button visibility
- Consistent padding: `p-4` for content area

#### Category Filter Cards

- White background with `rounded-xl`
- Medium shadow
- Larger padding: `p-6`
- Full width on mobile, constrained on desktop

### Forms and Inputs

#### Text Inputs

- Light gray border that changes to amber on focus
- Consistent padding: `px-3 py-2`
- Border radius: `rounded-lg`
- Focus ring in amber color

#### Upload Areas

- Dashed border in light gray
- Hover state changes to amber border with light amber background
- Generous padding for comfortable drop targets
- Clear visual hierarchy for instructions

### Navigation

#### Header

- Semi-transparent white background with backdrop blur
- Sticky positioning
- Horizontal layout with logo left, actions right
- Responsive navigation hidden on mobile

#### Links

- Default slate gray color
- Hover to amber color
- Medium font weight
- Smooth color transitions

## Design Principles

### Spacing

- Use consistent spacing scale based on 0.25rem increments
- Component padding: 1.5rem standard
- Section margins: 3rem vertical
- Grid gaps: 1.5rem for product grids

### Shadows

- Use elevated shadows to create depth hierarchy
- Light shadows for subtle elevation
- Large shadows for modals and important elements
- Hover states increase shadow intensity

### Animations

- Use subtle, purposeful animations
- Standard duration: 200-300ms
- Easing: ease-in-out for most transitions
- Hover effects: scale(1.05) for product cards
- Loading states: consistent spinner design

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Product grid: 1 column (mobile) → 2 (tablet) → 3 (desktop) → 4 (wide)
- Typography scales appropriately across devices

## Content Guidelines

### Product Descriptions

- Concise, descriptive titles
- Focus on materials, style, and unique features
- Price prominently displayed
- Category and material tags for filtering

### User Interface Text

- Use clear, actionable language
- "Upload Products" instead of generic "Upload"
- Error messages should be helpful and specific
- Loading states should inform users of progress

### Imagery

- High-quality product photography
- Consistent lighting and backgrounds when possible
- Multiple angles for products when available
- Jewelry should be the clear focus of images

## Accessibility Standards

### Color Contrast

- Minimum 4.5:1 ratio for normal text
- 7:1 ratio for enhanced accessibility
- Test all color combinations

### Focus States

- Visible focus rings on all interactive elements
- Amber color focus rings consistent with brand
- Sufficient size for touch targets (minimum 44px)

### Alt Text

- Descriptive alt text for all product images
- Include relevant details about jewelry pieces
- Avoid redundant phrases like "image of"

## Usage Examples

### Do's

✅ Use amber gradients for primary actions  
✅ Maintain consistent spacing and typography  
✅ Apply hover effects consistently across components  
✅ Use white backgrounds for content cards  
✅ Implement proper focus states for accessibility

### Don'ts

❌ Don't use amber for error states (use red)  
❌ Don't mix gradient styles arbitrarily  
❌ Don't ignore responsive breakpoints  
❌ Don't forget hover and focus states  
❌ Don't use insufficient color contrast

## Implementation Notes

### CSS Framework

- Built with Tailwind CSS v4
- Custom CSS in `globals.css` for animations and gradients
- Consistent class naming follows Tailwind conventions

### Component Architecture

- React components with TypeScript
- Consistent prop interfaces
- Reusable design tokens
- Modular, maintainable structure

### Performance Considerations

- Optimized images with Next.js Image component
- Efficient CSS with Tailwind's utility-first approach
- Minimal custom CSS for better performance
- Proper loading states for better UX

---

_This brand guide ensures consistent visual identity across all touchpoints of Casper's Treasure Chest, maintaining the premium jewelry aesthetic while providing excellent user experience through modern web technologies._
