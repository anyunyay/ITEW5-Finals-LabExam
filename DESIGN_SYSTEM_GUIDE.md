# Design System Guide - Modern Minimalist Purple Theme

## Quick Reference

### 🎨 Color Palette

#### Primary Purple
```
#9333EA  ████  Primary Purple (Main brand color)
#7E22CE  ████  Primary Purple Dark (Hover, emphasis)
#A855F7  ████  Primary Purple Light (Highlights)
#C084FC  ████  Accent Purple (Secondary)
#E9D5FF  ████  Accent Purple Light (Backgrounds)
```

#### Functional Colors
```
#10B981  ████  Success Green
#F59E0B  ████  Warning Amber
#EF4444  ████  Error Red
#6B7280  ████  Neutral Gray
```

#### Neutrals
```
#FFFFFF  ████  White
#FAFAFA  ████  Off White
#F5F5F7  ████  Light Gray
#374151  ████  Dark Gray
#1F2937  ████  Darker Gray
```

---

## 📐 Spacing Scale

```
8px   ▌     Extra Small
12px  ▌▌    Small
16px  ▌▌▌   Medium
24px  ▌▌▌▌  Large
36px  ▌▌▌▌▌ Extra Large
48px  ▌▌▌▌▌▌ XXL
```

---

## 🔤 Typography

### Font Sizes
```
2.5rem  ██████  Page Titles (Dashboard)
2.25rem █████   Section Titles
2rem    ████    Modal Titles
1.1rem  ██      Card Titles
1rem    █       Body Text
0.95rem █       Buttons, Inputs
0.9rem  █       Labels
0.85rem ▌       Small Text
0.75rem ▌       Badges
```

### Font Weights
```
700  Bold       Headings, Titles
600  Semi-Bold  Buttons, Labels, Links
500  Medium     Form Labels
400  Regular    Body Text
```

---

## 🔘 Button Styles

### Primary Button
```css
background: linear-gradient(135deg, #9333EA 0%, #7E22CE 100%);
color: #FFFFFF;
padding: 14px 20px;
border-radius: 12px;
font-weight: 600;
box-shadow: 0 1px 2px rgba(147, 51, 234, 0.15);

/* Hover */
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(147, 51, 234, 0.25);
```

### Secondary Button (Google)
```css
background: #FFFFFF;
color: #374151;
border: 1.5px solid #E5E7EB;
padding: 14px 20px;
border-radius: 12px;

/* Hover */
background: #FAFAFA;
border-color: #9333EA;
transform: translateY(-1px);
```

### Filter Button
```css
background: #FFFFFF;
border: 1.5px solid #E5E7EB;
padding: 10px 20px;
border-radius: 24px;

/* Active */
background: linear-gradient(135deg, #9333EA 0%, #7E22CE 100%);
color: #FFFFFF;
```

---

## 📝 Form Elements

### Input Fields
```css
padding: 12px 16px;
border: 1.5px solid #E5E7EB;
border-radius: 12px;
font-size: 0.95rem;

/* Focus */
border-color: #9333EA;
box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.08);
```

### Labels
```css
font-size: 0.9rem;
font-weight: 500;
color: #374151;
margin-bottom: 8px;
```

---

## 🎴 Card Styles

### Task Card
```css
background: #FFFFFF;
border-radius: 16px;
padding: 24px;
border: 1px solid rgba(0, 0, 0, 0.06);
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

/* Hover */
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
border-color: rgba(147, 51, 234, 0.2);
```

### Stat Card
```css
background: #FFFFFF;
border-radius: 16px;
padding: 24px;
border: 1px solid rgba(0, 0, 0, 0.06);
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

/* Left Border Accent */
border-left: 3px solid #9333EA;
```

---

## 🏷️ Badge Styles

### Status Badges
```css
/* Todo */
background: #F3E8FF;
color: #7E22CE;
border: 1px solid rgba(147, 51, 234, 0.2);

/* In Progress */
background: #FFFBEB;
color: #D97706;
border: 1px solid rgba(245, 158, 11, 0.2);

/* Completed */
background: #ECFDF5;
color: #059669;
border: 1px solid rgba(16, 185, 129, 0.2);
```

### Priority Badges
```css
/* High */
background: #FEF2F2;
color: #DC2626;
border: 1px solid rgba(239, 68, 68, 0.2);

/* Medium */
background: #FFFBEB;
color: #D97706;
border: 1px solid rgba(245, 158, 11, 0.2);

/* Low */
background: #F9FAFB;
color: #6B7280;
border: 1px solid rgba(0, 0, 0, 0.08);
```

---

## 🎭 Shadows

### Elevation System
```css
/* Level 1 - Cards at rest */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

/* Level 2 - Cards on hover */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

/* Level 3 - Modals, dropdowns */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

/* Button shadows */
box-shadow: 0 1px 2px rgba(147, 51, 234, 0.15);

/* Button hover */
box-shadow: 0 4px 12px rgba(147, 51, 234, 0.25);
```

---

## 🔄 Animations

### Transitions
```css
/* Standard */
transition: all 0.2s ease;

/* Slow */
transition: all 0.3s ease-out;
```

### Transforms
```css
/* Button hover */
transform: translateY(-1px);

/* Card hover */
transform: translateY(-2px);

/* Active state */
transform: translateY(0);
```

### Keyframes
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide in */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  /* Reduced padding, stacked layouts */
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Optimized for tablet */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Full desktop experience */
}
```

---

## ✨ Usage Examples

### Page Container
```css
.page-container {
  background: #FFFFFF;
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);
}
```

### Section Header
```css
h2 {
  color: #1F2937;
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}

p {
  color: #6B7280;
  font-size: 1.05rem;
  font-weight: 400;
  line-height: 1.6;
}
```

### Action Button
```css
.btn-primary {
  background: linear-gradient(135deg, #9333EA 0%, #7E22CE 100%);
  color: #FFFFFF;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(147, 51, 234, 0.15);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.25);
}
```

---

## 🎯 Design Principles

### 1. Minimalism
- Use white space generously
- Remove unnecessary elements
- Focus on content

### 2. Consistency
- Use design tokens
- Follow spacing scale
- Maintain color palette

### 3. Clarity
- High contrast text
- Clear visual hierarchy
- Obvious interactive elements

### 4. Performance
- Minimal shadows
- CSS-only animations
- Efficient selectors

### 5. Accessibility
- WCAG AA contrast
- Visible focus states
- Adequate touch targets

---

## 🔍 Component Checklist

When creating new components:

- [ ] Uses color variables from palette
- [ ] Follows spacing scale
- [ ] Has proper hover states
- [ ] Includes focus indicators
- [ ] Uses consistent border radius
- [ ] Has subtle shadows
- [ ] Smooth transitions (0.2s)
- [ ] Responsive on mobile
- [ ] Accessible (ARIA, contrast)
- [ ] Performant (no heavy effects)

---

## 📚 Resources

### CSS Variables
All design tokens are available as CSS variables:
```css
var(--primary-purple)
var(--gradient-primary)
var(--neutral-gray)
/* etc. */
```

### Files
- `client/src/index.css` - Global styles, variables
- `client/src/App.css` - Layout, containers
- Component CSS files - Individual components

---

**Quick Start**: Copy code snippets above and adjust as needed
**Consistency**: Always use design tokens (CSS variables)
**Testing**: Verify on mobile, tablet, and desktop

---

**Last Updated**: December 5, 2024
