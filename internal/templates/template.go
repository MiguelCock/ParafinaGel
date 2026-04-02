package templates

import (
	"html/template"
	"net/http"
	"path/filepath"
	"strings"
)

// TemplateCache holds a map of page name -> template set
type TemplateCache map[string]*template.Template

// NewTemplateCache scans the templates directory and builds a cache.
// It expects:
//   - layouts/    : one or more layout files (base.html, etc.)
//   - pages/      : one file per page, each defining a block named "content"
//   - components/ : files defining named templates (e.g., "button", "carousel")
func NewTemplateCache() (TemplateCache, error) {
	cache := make(TemplateCache)

	// 1. Parse all component files into a separate template set (shared)
	//    This will serve as a base for all pages.
	componentFiles, err := filepath.Glob("internal/templates/components/*.html")
	if err != nil {
		return nil, err
	}
	components := template.New("components")
	for _, file := range componentFiles {
		// Parse each component file; they define named templates (e.g., {{define "button"}})
		_, err = components.ParseFiles(file)
		if err != nil {
			return nil, err
		}
	}

	// 2. Find all page files
	pageFiles, err := filepath.Glob("internal/templates/pages/*.html")
	if err != nil {
		return nil, err
	}

	// 3. For each page, create a new template that includes:
	//    - the base layout(s)
	//    - the page's own file
	//    - the shared components
	layoutFiles, err := filepath.Glob("internal/templates/layouts/*.html")
	if err != nil {
		return nil, err
	}

	for _, pageFile := range pageFiles {
		// Extract page name from filename (e.g., "home.html" -> "home")
		baseName := filepath.Base(pageFile)
		pageName := strings.TrimSuffix(baseName, filepath.Ext(baseName))

		// Start with the components set (so all partials are available)
		tmpl := template.Must(components.Clone())

		// Add layouts
		for _, layout := range layoutFiles {
			tmpl, err = tmpl.ParseFiles(layout)
			if err != nil {
				return nil, err
			}
		}

		// Add the page file (which should define "content")
		tmpl, err = tmpl.ParseFiles(pageFile)
		if err != nil {
			return nil, err
		}

		cache[pageName] = tmpl
	}

	return cache, nil
}

func RenderPage(w http.ResponseWriter, cache TemplateCache, pageName string, data interface{}) {
	tmpl, ok := cache[pageName]
	if !ok {
		http.NotFound(w, nil)
		return
	}
	// Execute the layout (e.g., "base") – the layout will include {{template "content" .}}
	err := tmpl.ExecuteTemplate(w, "base", data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
