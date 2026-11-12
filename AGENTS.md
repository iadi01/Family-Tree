# Project Guidelines

- Keep the illustrated tree scene in presentation components with browser-local demonstration edits; persistent storage and private access require a separately requested Cloud implementation.
- Use the shared Button variants for interactive controls, and define illustrated scene colors and shadows as global semantic CSS tokens.
- Render expanded family branches in a separate wrapping row so multiple open branches cannot overlap; use Radix Dialog for focus-managed overlays.
- Prebundle React and shared Radix controls together so introducing dialogs during preview hot updates does not split the React runtime.
- Keep demonstration photo overrides in page state and resize decoded uploads in the browser; this supports portraits and gallery previews without implying persistent storage.
