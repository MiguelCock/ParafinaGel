package handlers

import (
	"net/http"

	"github.com/MiguelCock/ParafinaGel/internal/templates"
)

type HomeHandler struct {
	Template *templates.TemplateCache
}

func (a *HomeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	data := struct {
		Title   string
		Message string
	}{
		Title:   "About Page",
		Message: "Welcome to the home page!",
	}

	templates.RenderPage(w, *a.Template, "home", data)
}
