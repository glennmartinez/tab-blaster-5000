# Components Structure

This folder has been organized into logical groups to improve maintainability and code organization.

## Folder Structure

### 📁 `common/`

Reusable UI components that can be used across the application:

- `Button.tsx` - Generic button component with variants
- `ExtensionPopup.tsx` - Main popup component for the extension
- `FallbackIcon.tsx` - Fallback icon when favicons fail to load
- `FavoriteButton.tsx` - Button for favoriting tabs
- `ParticleBackground.tsx` - Animated particle background
- `StatusItem.tsx` - Status indicator component

### 📁 `navigation/`

Navigation and layout components:

- `Header.tsx` - Application header with theme toggle and search
- `NavItem.tsx` - Individual navigation item component
- `Sidebar.tsx` - Main sidebar navigation

### 📁 `tabs/`

Tab management related components:

- `TabItem.tsx` - Individual tab item display
- `TabList.tsx` - List of tabs
- `TabGroup.tsx` - Grouped tabs display

### 📁 `sessions/`

Session management components:

- `SessionPanel.tsx` - Panel showing session details
- `SessionsSidebar.tsx` - Sidebar for session navigation
- `SessionsView.tsx` - Main sessions view

### 📁 `bookmarks/`

Bookmark related components:

- `BookmarksPanel.tsx` - Main bookmarks management panel

### 📁 `tags/`

Tag management components:

- `ExpandableTags.tsx` - Expandable tags display
- `InlineTagInput.tsx` - Inline tag input component
- `TagButton.tsx` - Tag button component
- `TagDialog.tsx` - Tag management dialog
- `TagInput.tsx` - Tag input component
- `TagSlider.tsx` - Tag slider component

### 📁 `metrics/`

System metrics and monitoring components:

- `MetricCard.tsx` - Individual metric display card
- `SystemMetricsWidget.tsx` - System metrics widget

### 📁 `settings/`

Settings and configuration components:

- `StorageSettings.tsx` - Storage configuration settings

### 📁 `windows/`

Window management components:

- `WindowGroup.tsx` - Grouped windows display
- `WindowsPanel.tsx` - Main windows management panel

### 📁 `examples/`

Example components and demos (unchanged)

## Usage

### Import from Category Folders

```tsx
// Import specific components from their categories
import { Button, FallbackIcon } from "../components/common";
import { Header, Sidebar } from "../components/navigation";
import { TabItem, TabList } from "../components/tabs";
```

### Import from Main Index

```tsx
// Import any component from the main components index
import {
  Button,
  Header,
  TabItem,
  SessionPanel,
  BookmarksPanel,
} from "../components";
```

## Benefits

1. **Better Organization**: Components are logically grouped by functionality
2. **Easier Navigation**: Developers can quickly find related components
3. **Scalability**: Easy to add new components to appropriate categories
4. **Reduced Cognitive Load**: Smaller, focused folders instead of one large list
5. **Clean Imports**: Use category-based imports or the main index for convenience
6. **Maintainability**: Related components are co-located for easier maintenance

## Migration Notes

All import paths have been updated throughout the codebase. The main component index (`src/components/index.ts`) re-exports all components, so existing imports using the main index will continue to work.
