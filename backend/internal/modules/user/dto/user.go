package dto

type ProfileResponse struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	DisplayName string `json:"displayName"`
	Role        string `json:"role"`
}

type UpdateProfileRequest struct {
	DisplayName string `json:"displayName" binding:"required,min=2,max=64"`
	Email       string `json:"email" binding:"required,email"`
}
