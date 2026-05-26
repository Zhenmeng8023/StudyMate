package apperrors

import "net/http"

type Error struct {
	Status  int
	Code    string
	Message string
}

func (e *Error) Error() string {
	return e.Message
}

func New(status int, code string, message string) *Error {
	return &Error{
		Status:  status,
		Code:    code,
		Message: message,
	}
}

func Internal(message string) *Error {
	return New(http.StatusInternalServerError, "internal_error", message)
}

func As(err error) *Error {
	if err == nil {
		return nil
	}

	appErr, ok := err.(*Error)
	if ok {
		return appErr
	}

	return Internal(err.Error())
}
