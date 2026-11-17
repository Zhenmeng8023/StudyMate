package service

import (
	"testing"

	carddto "studymate/backend/internal/modules/card/dto"
)

func TestGenerateCardsForNoteTypeSupportsBasic(t *testing.T) {
	generated, err := GenerateCardsForNoteType(carddto.CreateCardNoteRequest{
		NoteTypeCode: "basic",
		Fields: map[string]string{
			"front": "Question",
			"back":  "Answer",
		},
	})
	if err != nil {
		t.Fatalf("generate basic cards: %v", err)
	}
	if len(generated) != 1 {
		t.Fatalf("expected 1 generated card, got %d", len(generated))
	}
	if generated[0].Front != "Question" || generated[0].Back != "Answer" {
		t.Fatalf("unexpected basic card: %#v", generated[0])
	}
}

func TestGenerateCardsForNoteTypeSupportsBasicReverse(t *testing.T) {
	generated, err := GenerateCardsForNoteType(carddto.CreateCardNoteRequest{
		NoteTypeCode: "basic_reverse",
		Fields: map[string]string{
			"front": "Question",
			"back":  "Answer",
		},
	})
	if err != nil {
		t.Fatalf("generate basic reverse cards: %v", err)
	}
	if len(generated) != 2 {
		t.Fatalf("expected 2 generated cards, got %d", len(generated))
	}
	if generated[1].Front != "Answer" || generated[1].Back != "Question" {
		t.Fatalf("unexpected reverse card: %#v", generated[1])
	}
}

func TestGenerateCardsForNoteTypeSupportsCloze(t *testing.T) {
	generated, err := GenerateCardsForNoteType(carddto.CreateCardNoteRequest{
		NoteTypeCode: "cloze",
		Fields: map[string]string{
			"text":  "二分查找依赖 {{c1::有序数组}} 才能正确工作。",
			"extra": "算法前提",
		},
	})
	if err != nil {
		t.Fatalf("generate cloze cards: %v", err)
	}
	if len(generated) != 1 {
		t.Fatalf("expected 1 cloze card, got %d", len(generated))
	}
	if generated[0].Front == "" || generated[0].Back == "" {
		t.Fatalf("expected rendered cloze front/back, got %#v", generated[0])
	}
}

func TestGenerateCardsForNoteTypeRejectsMissingRequiredFields(t *testing.T) {
	_, err := GenerateCardsForNoteType(carddto.CreateCardNoteRequest{
		NoteTypeCode: "basic",
		Fields: map[string]string{
			"front": "Question only",
		},
	})
	if err == nil {
		t.Fatal("expected missing required field error")
	}
}

func TestGenerateCardsForNoteTypeRejectsClozeWithoutMarkers(t *testing.T) {
	_, err := GenerateCardsForNoteType(carddto.CreateCardNoteRequest{
		NoteTypeCode: "cloze",
		Fields: map[string]string{
			"text": "没有填空标记",
		},
	})
	if err == nil {
		t.Fatal("expected cloze validation error")
	}
}
