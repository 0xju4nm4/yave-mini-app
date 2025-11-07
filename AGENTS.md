# Agent Guidelines

## Project Context

This is a **prediction market application** where users can bet on yes/no outcomes of different events. The app is built with Next.js and follows a modular, component-based architecture.

### Key Design Patterns

- **Reusable Components**: Follow the existing pattern of creating modular, reusable components like `PredictionButton`
- **Modular Architecture**: Components are organized in the `components/` directory with their own CSS modules
- **Type Safety**: Use TypeScript types defined in `types/index.ts`
- **Consistent Styling**: Use CSS modules for component-specific styles (`.module.css` files)

### Component Structure

- `components/ui/` - Reusable UI components (e.g., `PredictionButton`)
- `components/` - Feature-specific components (e.g., `EventCard`, `EventSlider`)
- Each component has its own `.module.css` file for scoped styling
- Follow the existing naming conventions and file organization

### Development Guidelines

- Create reusable, modular components when adding new features
- Use existing patterns like `PredictionButton` for consistent UI elements
- Maintain the established file structure and naming conventions
- Ensure components are self-contained with their own styles

### Component Extraction Guidelines

When extracting components from existing files (like layout files), follow this pattern:

1. **Create Component Folder**: Create a dedicated folder under `components/` with the component name (e.g., `components/AppSider/`)
2. **Extract Component Logic**: Move the component JSX and any related imports to a new `.tsx` file
3. **Extract Component Styles**: Move component-specific CSS classes to a `.module.css` file within the same folder
4. **Update Imports**: Update the original file to import and use the new component
5. **Clean Up**: Remove extracted styles from the original CSS file to avoid duplication

**Example Structure**:

```
components/
├── AppSider/
│   ├── AppSider.tsx
│   └── AppSider.module.css
```

**Key Principles**:

- Each component should be self-contained with its own styles
- Use CSS modules for component-specific styling
- Keep related functionality together in the same folder
- Follow existing naming conventions (PascalCase for components, kebab-case for CSS classes)

### CSS Modules Usage

**IMPORTANT**: Always use CSS modules for component-specific styling. Follow these rules:

- **Use CSS Modules**: All component-specific styles must use CSS modules (`.module.css` files)
- **Import Styles**: Import CSS modules as `import styles from "./ComponentName.module.css"`
- **Class Names**: Use `styles.className` syntax instead of string literals
- **Global Styles Only When Necessary**: Only use `globals.css` for:
  - CSS custom properties (CSS variables)
  - Global resets and base styles
  - Third-party library overrides (e.g., Ant Design)
  - Utility classes that are truly global
- **No Global Class Selectors**: Avoid adding new global class selectors to `globals.css` for component-specific styling
- **Consistent Naming**: Use kebab-case for CSS class names and follow existing naming patterns

**Example**:

```tsx
// ✅ Correct - Using CSS modules
import styles from "./MyComponent.module.css";
<div className={styles.container}>

// ❌ Incorrect - Using global classes
<div className="my-container">
```

## Development Server Rules

**IMPORTANT**: Agents should NOT start the development server under any circumstances. Do not run commands like:

- `npm run dev`
- `yarn dev`
- `bun dev`
- `next dev`

The development server should only be started manually by the user when needed.
