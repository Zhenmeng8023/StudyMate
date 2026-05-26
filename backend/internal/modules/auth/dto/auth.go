package dto

type RegisterRequest struct {
	Username    string `json:"username" binding:"required,min=3,max=32"`
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=8,max=72"`
	DisplayName string `json:"displayName" binding:"max=64"`
}

type LoginRequest struct {
	Login    string `json:"login" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

type LogoutRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

type AuthUserResponse struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	DisplayName string `json:"displayName"`
	Role        string `json:"role"`
}

type AuthResponse struct {
	AccessToken          string           `json:"accessToken"`
	RefreshToken         string           `json:"refreshToken"`
	AccessTokenExpiresAt string           `json:"accessTokenExpiresAt"`
	User                 AuthUserResponse `json:"user"`
}
