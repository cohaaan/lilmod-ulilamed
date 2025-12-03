# Sefaria Simplified - Jewish Text Reader

A simplified React TypeScript application that demonstrates core Sefaria functionality for reading Jewish texts with bilingual support.

## Features

### Working Features
- **Bilingual Text Display**: Hebrew and English text with proper RTL/LTR support
- **Text Navigation**: Next/Previous navigation and chapter-based browsing
- **Sefaria API Integration**: Real-time text fetching from Sefaria's public API
- **Caching System**: Local caching to minimize API calls and improve performance
- **Responsive Design**: Mobile-friendly layout with adaptive breakpoints
- **Language Toggle**: Switch between English, Hebrew, and Bilingual modes

### Search Functionality
**Note**: Due to CORS restrictions on Sefaria's search API, this demo uses a **mock search** with hardcoded popular texts. The search functionality filters through a predefined list of common Jewish texts and allows navigation to them.

**Available search texts include:**
- Torah: Genesis, Exodus, Leviticus, Numbers, Deuteronomy
- Neviim: Isaiah, Jeremiah, Ezekiel
- Ketuvim: Psalms, Proverbs, Song of Songs, Ruth, Esther, Daniel

## Technical Architecture

### Core Components
- **TextDisplay**: Handles bilingual text rendering with proper Hebrew RTL support
- **Navigation**: Provides text navigation and popular text access
- **Search**: Mock search functionality with debounced input
- **API Service**: Manages Sefaria API calls with caching and error handling

### API Integration
- **Text Endpoint**: `/api/v3/texts/{tref}` - Fetches actual text content
- **Index Endpoint**: `/api/v2/index/{title}` - Retrieves book metadata
- **Library Endpoint**: `/api/index` - Gets available texts overview
- **Search Endpoint**: Mock implementation due to CORS limitations

### Technology Stack
- **React 18** with TypeScript
- **Axios** for HTTP requests
- **CSS Grid** for responsive layout
- **Modern React Hooks** (useState, useRef, useEffect)

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd sefaria-simplified
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Reading Texts
1. The app loads with Genesis 1:1 by default
2. Use the **Language** toggle to switch between English, Hebrew, or Bilingual display
3. Navigate using **Previous/Next** buttons or click on specific chapters
4. Browse popular texts from the sidebar

### Searching Texts
1. Type in the search box (e.g., "Genesis", "Psalms", "Exodus 20")
2. Results appear with a 300ms debounce delay
3. Click on any result to navigate to that text
4. Search filters through reference, title, and categories

### Navigation
- **Previous/Next**: Move between consecutive text segments
- **Chapter Navigation**: Jump to specific chapters (when available)
- **Popular Texts**: Quick access to commonly read texts

## Known Limitations

### CORS Issues
The Sefaria search API (`/api/search`) has CORS restrictions that prevent direct browser access from localhost. This demo uses a mock search implementation with hardcoded results.

### Chapter Navigation
Currently shows 50 chapters by default. In a production app, this would dynamically fetch the actual chapter count from the Index API.

## API Endpoints Used

### Working Endpoints
```
GET https://www.sefaria.org/api/v3/texts/{tref}?lang={en|he|bi}
GET https://www.sefaria.org/api/v2/index/{title}
GET https://www.sefaria.org/api/index
```

### Mock Implementation
```
GET /api/search (mock - due to CORS)
```

## Development

### Project Structure
```
src/
├── components/
│   ├── TextDisplay.tsx      # Main text rendering component
│   ├── Navigation.tsx       # Navigation controls
│   └── Search.tsx           # Mock search functionality
├── services/
│   └── sefariaApi.ts        # API service with caching
├── types/
│   └── sefaria.ts           # TypeScript interfaces
├── App.tsx                  # Main application component
└── App.css                  # Global styles
```

### Type Safety
Full TypeScript support with interfaces for:
- Sefaria API responses
- Component props
- Internal state management

### Error Handling
- Graceful API error handling with user-friendly messages
- Network timeout handling (10 seconds)
- Fallback language support for text fetching

## Future Enhancements

### Production Considerations
- **Backend Proxy**: Implement a server-side proxy to handle CORS for search
- **Dynamic Chapter Counts**: Fetch actual chapter structures from Index API
- **User Preferences**: Store language preferences in localStorage
- **Text History**: Implement browsing history
- **Offline Support**: Cache frequently accessed texts

### Advanced Features
- **Text Commentary**: Add connections/links between texts
- **Multiple Translations**: Allow selection of different text versions
- **Reading Plans**: Add structured learning schedules
- **Social Features**: Share text references with others

## Contributing

This is a demonstration project showcasing simplified Sefaria integration. For production use, refer to the official [Sefaria API documentation](https://www.sefaria.org/api).

## License

This project is for educational purposes. Sefaria's API and content are subject to their respective licenses and terms of service.

## Acknowledgments

- **Sefaria**: For providing the open API and Jewish text database
- **React Team**: For the excellent React framework
- **TypeScript Team**: For the type-safe JavaScript superset
