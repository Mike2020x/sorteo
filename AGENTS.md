# AGENTS.md - Sorteo App

## Project Overview

- **Type**: Vanilla HTML/CSS/JS web application
- **Purpose**: Raffle/draw management with ticket generation and sharing
- **Storage**: LocalStorage (primary) + JSON export/import (backup)
- **Language**: Spanish (all UI, comments, and variable names)
- **Design**: Modern UI with gradient colors, smooth animations, and responsive design

## Commands

### Development

```bash
npm run dev        # Start local dev server (npx serve)
npm start          # Alias for dev
```

### Testing (Playwright)

```bash
npm test                    # Run all tests
npm run test:single <name>  # Run single test (e.g., npm run test:single storage)
npm test:ui                 # Open Playwright UI mode
npx playwright test         # Direct Playwright runner
```

### Linting & Formatting

```bash
npm run lint        # Run ESLint
npm run format     # Format with Prettier
npm run lint:fix   # Auto-fix ESLint issues
```

## Code Style Guidelines

### Naming Conventions

- **Variables/Functions**: camelCase (e.g., `generarTicket`, `obtenerParticipantes`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`, `MAX_NUMERO`)
- **Classes**: PascalCase (e.g., `TicketGenerator`, `StorageManager`, `UIManager`)
- **Files**: kebab-case (e.g., `storage.js`, `ticket.js`, `ui.js`)
- **CSS Classes**: BEM with modern patterns (e.g., `.btn--primario`, `.seccion__titulo`, `.participante__numero`)

### HTML/CSS

- 2-space indentation
- Semantic HTML5 elements with SVG icons
- CSS custom properties (variables) for theming
- Modern gradient backgrounds and shadows
- BEM naming convention for component styling
- Mobile-first responsive design (375px, 480px, 768px breakpoints)
- Spanish text for all labels, placeholders, and messages
- Inter font family (loaded from Google Fonts)

### JavaScript

- ES6+ features (const/let, arrow functions, template literals, destructuring, async/await)
- Strict mode enabled ('use strict')
- Modular architecture with separate managers (Storage, UI, Ticket)
- Document all functions with JSDoc comments
- Use toast notifications for user feedback instead of console.log
- Event delegation where appropriate

### Imports/Dependencies

- No external JS dependencies (vanilla JS only)
- ES6 module imports
- Modular file structure (one export/class per file)
- Manager pattern for different concerns

### Error Handling

- Wrap LocalStorage operations in try/catch
- Display user-friendly toast messages in Spanish
- Validate input data before saving
- Provide fallback values for missing/corrupted data
- Async operations with proper error handling and user feedback

### Formatting (Prettier)

- Single quotes for strings
- Semicolons required
- Trailing commas in multiline
- Print width: 100
- Tab width: 2 spaces

## Data Schema

### LocalStorage Structure

```json
{
  "sorteo": {
    "configuracion": {
      "descripcion": "string",
      "fecha": "ISO string",
      "precio": "number"
    },
    "participantes": [
      {
        "numero": "0-99",
        "nombre": "string",
        "telefono": "string",
        "pago": "pagado | pendiente",
        "fechaRegistro": "ISO string"
      }
    ]
  }
}
```

### Export Format (JSON)

```json
{
  "configuracion": {
    "descripcion": "string",
    "fecha": "ISO string",
    "precio": "number"
  },
  "participantes": [],
  "version": "1.0",
  "fechaExportacion": "ISO string"
}
```

## Project Structure

```
sorteo/
├── index.html                # Main HTML with SVG icons
├── css/
│   └── styles.css          # Modern CSS with custom properties
├── js/
│   ├── app.js              # Main application controller
│   ├── storage.js          # LocalStorage + export/import
│   ├── ticket.js           # Canvas ticket generation + sharing
│   ├── ui.js               # DOM manipulation + toast notifications
│   └── constants.js        # App constants and messages
├── tests/
│   ├── app.spec.js
│   ├── storage.spec.js
│   └── ticket.spec.js
├── package.json
├── playwright.config.js
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── AGENTS.md
```

## Features & Implementation

### 1. Configuration Management

- Collapsible configuration section (hidden by default)
- Fields: raffle description, ticket price
- Auto-collapse after saving

### 2. Participant Registration

- Name, phone, number (0-99), payment status
- Visual number grid showing available/occupied numbers
- Real-time counters (participants, available numbers)

### 3. Ticket Generation

- Canvas-based image generation (600x800px)
- Modern design with gradient header
- Download as PNG image
- Share via Web Share API (with clipboard fallback)
- WhatsApp/messenger compatible sharing

### 4. Data Backup

- Export all data to JSON file with timestamp
- Import from JSON file
- Validation of imported data structure
- User feedback for success/error states

### 5. UI/UX Improvements

- Modern gradient colors (#6366f1 primary)
- Smooth animations and transitions
- Toast notification system
- Modal with backdrop blur
- Responsive design (mobile-first)
- Sticky header
- SVG icons throughout

### 6. Responsive Breakpoints

- Mobile: max-width 480px
- Tablet: max-width 768px
- Desktop: > 768px (default)

## Testing Guidelines

- Use Playwright for end-to-end tests
- Test names in Spanish (e.g., 'debe generar ticket con datos correctos')
- One assertion per test when possible
- Clean up LocalStorage before each test
- Mock external dependencies (none expected for vanilla JS)
- Test export/import functionality
- Test ticket sharing (when possible)

## Implementation Notes

- Mobile-responsive design (test on 375px and up)
- Ticket: Canvas-generated PNG image (600x800px)
- Support numbers 0-99 (100 total slots)
- Payment status: 'pagado' or 'pendiente'
- Spanish error messages: 'Error al guardar', 'Datos inválidos', etc.
- Use Web Share API when available, fallback to clipboard
- Toast notifications auto-dismiss after 4 seconds
- Configuration section auto-collapses after saving
