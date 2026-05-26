package security

import "testing"

func TestHashPasswordAndCompare(t *testing.T) {
	password := "StudyMate123!"
	hashed, err := HashPassword(password)
	if err != nil {
		t.Fatalf("hash password failed: %v", err)
	}

	if hashed == password {
		t.Fatalf("hashed password should not equal source password")
	}

	if err := ComparePassword(hashed, password); err != nil {
		t.Fatalf("compare password failed: %v", err)
	}
}
