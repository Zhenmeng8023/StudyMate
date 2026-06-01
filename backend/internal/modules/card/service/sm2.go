package service

import (
	"math"
	"strings"
	"time"

	cardmodel "studymate/backend/internal/modules/card/model"
)

const (
	reviewRatingAgain = "again"
	reviewRatingHard  = "hard"
	reviewRatingGood  = "good"
	reviewRatingEasy  = "easy"
)

type Scheduler interface {
	Apply(current cardmodel.CardSchedule, rating string, reviewedAt time.Time) (cardmodel.CardSchedule, bool)
}

type SM2Scheduler struct{}

func (SM2Scheduler) Apply(current cardmodel.CardSchedule, rating string, reviewedAt time.Time) (cardmodel.CardSchedule, bool) {
	return ApplySM2Schedule(current, rating, reviewedAt)
}

func NormalizeReviewRating(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case reviewRatingAgain:
		return reviewRatingAgain
	case reviewRatingHard:
		return reviewRatingHard
	case reviewRatingGood:
		return reviewRatingGood
	case reviewRatingEasy:
		return reviewRatingEasy
	default:
		return ""
	}
}

func ApplySM2Schedule(current cardmodel.CardSchedule, rating string, reviewedAt time.Time) (cardmodel.CardSchedule, bool) {
	normalized := NormalizeReviewRating(rating)
	if normalized == "" {
		return current, false
	}

	easeFactor := current.EaseFactor
	if easeFactor == 0 {
		easeFactor = 2.5
	}

	next := current
	next.UpdatedAt = reviewedAt

	if normalized == reviewRatingAgain {
		next.RepetitionCount = 0
		next.IntervalDays = 0
		next.LapseCount = current.LapseCount + 1
		next.EaseFactor = math.Max(1.3, easeFactor-0.2)
		next.State = "learning"
		next.DueAt = reviewedAt.Add(4 * time.Hour)
		return next, true
	}

	next.RepetitionCount = current.RepetitionCount + 1
	next.EaseFactor = nextEaseFactor(easeFactor, normalized)
	next.IntervalDays = nextIntervalDays(current.IntervalDays, current.RepetitionCount, next.EaseFactor, normalized)
	if next.RepetitionCount >= 2 {
		next.State = "review"
	} else {
		next.State = "learning"
	}
	next.DueAt = reviewedAt.AddDate(0, 0, next.IntervalDays)

	return next, true
}

func nextEaseFactor(current float64, rating string) float64 {
	quality := 4.0
	switch rating {
	case reviewRatingHard:
		quality = 3
	case reviewRatingGood:
		quality = 4
	case reviewRatingEasy:
		quality = 5
	}

	next := current + (0.1 - (5-quality)*(0.08+(5-quality)*0.02))
	return math.Max(1.3, next)
}

func nextIntervalDays(previousInterval int, previousRepetition int, easeFactor float64, rating string) int {
	switch rating {
	case reviewRatingHard:
		if previousRepetition <= 0 {
			return 1
		}
		if previousRepetition == 1 {
			return 3
		}
		return maxInt(2, int(math.Round(float64(previousInterval)*1.2)))
	case reviewRatingEasy:
		if previousRepetition <= 0 {
			return 3
		}
		if previousRepetition == 1 {
			return 8
		}
		return maxInt(3, int(math.Round(float64(previousInterval)*easeFactor*1.3)))
	default:
		if previousRepetition <= 0 {
			return 1
		}
		if previousRepetition == 1 {
			return 6
		}
		return maxInt(2, int(math.Round(float64(previousInterval)*easeFactor)))
	}
}

func maxInt(left int, right int) int {
	if left > right {
		return left
	}

	return right
}
