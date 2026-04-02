package handlers

import (
	"net/http"

	"github.com/MiguelCock/ParafinaGel/internal/templates"
)

type AboutHandler struct {
	Template *templates.TemplateCache
}

func (a *AboutHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	data := struct {
		Title   string
		Message string
	}{
		Title:   "About Page",
		Message: "Welcome to the about page!",
	}

	templates.RenderPage(w, *a.Template, "about", data)
}
