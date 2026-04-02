package main

import (
	"net/http"

	"github.com/MiguelCock/ParafinaGel/internal/handlers"
	"github.com/MiguelCock/ParafinaGel/internal/templates"
)

func main() {
	cache, err := templates.NewTemplateCache()
	if err != nil {
		panic(err)
	}

	// Initialize handlers with the template cache
	homeHandler := &handlers.HomeHandler{Template: &cache}
	aboutHandler := &handlers.AboutHandler{Template: &cache}

	// Serve static files
	fs := http.FileServer(http.Dir("internal/web/static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Register routes
	http.HandleFunc("/", homeHandler.ServeHTTP)
	http.HandleFunc("/about", aboutHandler.ServeHTTP)

	// Start server
	println("Server starting on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
