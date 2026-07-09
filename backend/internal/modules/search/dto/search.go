package dto

type Result struct {
	Type    string `json:"type"`
	ID      string `json:"id"`
	Title   string `json:"title"`
	Summary string `json:"summary"`
	URL     string `json:"url"`
	Source  string `json:"source"`
}

type Group struct {
	Type          string   `json:"type"`
	Count         int      `json:"count"`
	ReturnedCount int      `json:"returnedCount"`
	Results       []Result `json:"results"`
}

type Response struct {
	Query  string  `json:"query"`
	Total  int     `json:"total"`
	Groups []Group `json:"groups"`
}
