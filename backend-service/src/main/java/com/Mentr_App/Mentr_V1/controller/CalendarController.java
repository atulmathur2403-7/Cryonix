package com.Mentr_App.Mentr_V1.controller;

import com.Mentr_App.Mentr_V1.repository.AvailabilityRepository;
import com.Mentr_App.Mentr_V1.repository.BookingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
public class CalendarController {
    private final AvailabilityRepository availabilityRepository;
    private final BookingRepository bookingRepository;

    public CalendarController(AvailabilityRepository availabilityRepository,
                              BookingRepository bookingRepository) {
        this.availabilityRepository = availabilityRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/api/mentors/{mentorId}/calendar")
    public ResponseEntity<Map<String, Object>> getMentorCalendar(
            @PathVariable Long mentorId,
            @RequestParam Instant from,
            @RequestParam Instant to,
            @RequestParam(defaultValue = "15") int durationMinutes
    ) {
        var availability = availabilityRepository
                .findByMentor_MentorIdAndEndTimeAfterAndStartTimeBefore(mentorId, from, to)
                .stream()
                .filter(s -> !s.isBlocked())
                .map(s -> Map.of(
                        "start", s.getStartTime(),
                        "end", s.getEndTime()
                ))
                .toList();

        var occupied = bookingRepository.findConfirmedInRange(mentorId, from, to)
                .stream()
                .map(b -> Map.of(
                        "start", b.getStartTime(),
                        "end", b.getEndTime(),
                        "bookingId", b.getId()
                ))
                .toList();

        List<Map<String, Object>> windows = new ArrayList<>();

        for (var a : availability) {
            Instant aStart = (Instant) a.get("start");
            Instant aEnd = (Instant) a.get("end");

            List<Instant[]> overlaps = bookingRepository.findConfirmedInRange(mentorId, aStart, aEnd)
                    .stream()
                    .map(b -> new Instant[]{b.getStartTime(), b.getEndTime()})
                    .sorted(Comparator.comparing(arr -> arr[0]))
                    .toList();

            Instant nextBookableStart = findNextBookableStart(aStart, aEnd, overlaps, durationMinutes);

            windows.add(Map.of(
                    "availabilityStart", aStart,
                    "availabilityEnd", aEnd,
                    "nextFreeStart", nextBookableStart
            ));
        }

        return ResponseEntity.ok(Map.of(
                "mentorId", mentorId,
                "availability", availability,
                "occupied", occupied,
                "windows", windows
        ));
    }

    private Instant findNextBookableStart(
            Instant availabilityStart,
            Instant availabilityEnd,
            List<Instant[]> overlaps,
            int durationMinutes
    ) {
        Instant cursor = availabilityStart;

        for (Instant[] oc : overlaps) {
            Instant busyStart = oc[0];
            Instant busyEnd = oc[1];

            // optional: snap before checking
            // Instant candidate = snapTo15(cursor);
            Instant candidate = cursor;

            // gap before this occupied block
            if (candidate.isBefore(busyStart)) {
                long freeMinutes = Duration.between(candidate, busyStart).toMinutes();
                if (freeMinutes >= durationMinutes) {
                    return candidate;
                }
            }

            // move cursor past occupied block
            if (busyEnd.isAfter(cursor)) {
                cursor = busyEnd;
            }
        }

        // check remaining free time after last occupied block
        // Instant candidate = snapTo15(cursor);
        Instant candidate = cursor;

        long remainingMinutes = Duration.between(candidate, availabilityEnd).toMinutes();
        if (remainingMinutes >= durationMinutes) {
            return candidate;
        }

        // no usable slot in this window
        return availabilityEnd;
    }

    private Instant snapTo15(Instant t) {
        long epoch = t.getEpochSecond();
        long mod = epoch % 900;
        long snapped = mod == 0 ? epoch : (epoch + (900 - mod));
        return Instant.ofEpochSecond(snapped);
    }
}