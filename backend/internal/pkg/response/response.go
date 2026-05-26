package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/pkg/apperrors"
)

func Success(ctx *gin.Context, status int, data any) {
	ctx.JSON(status, gin.H{
		"success": true,
		"data":    data,
	})
}

func Error(ctx *gin.Context, err error) {
	appErr := apperrors.As(err)
	ctx.JSON(appErr.Status, gin.H{
		"success": false,
		"error": gin.H{
			"code":    appErr.Code,
			"message": appErr.Message,
		},
	})
}

func Unauthorized(ctx *gin.Context, message string) {
	Error(ctx, apperrors.New(http.StatusUnauthorized, "unauthorized", message))
}
