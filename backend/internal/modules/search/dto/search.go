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
	NextOffset    *int     `json:"nextOffset"`
	Results       []Result `json:"results"`
}

type Response struct {
	Query     string  `json:"query"`
	Limit     int     `json:"limit"`
	ElapsedMs int64   `json:"elapsedMs"`
	Total     int     `json:"total"`
	Groups    []Group `json:"groups"`
}
