package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.dashboard.*;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.repository.ReviewRepository;
import com.Mentr_App.Mentr_V1.repository.SessionRepository;
import com.Mentr_App.Mentr_V1.service.MentorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.LongStream;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class MentorDashboardServiceImpl implements MentorDashboardService {

    private final MentorRepository mentorRepository;
    private final SessionRepository sessionRepository;
    private final ReviewRepository reviewRepository;

    // Helper to convert '30d' -> days
    private int parseRangeDays(String range) {
        if (range == null || range.isBlank()) return 30;
        if (range.endsWith("d")) {
            try { return Integer.parseInt(range.substring(0, range.length() - 1)); }
            catch (NumberFormatException e) { return 30; }
        }
        return 30;
    }

    private String toRangeInterval(String range) {
        // Postgres interval string
        return parseRangeDays(range) + " days";
    }

    /** Summary endpoint (cached short-term) */
    @Override
    @Cacheable(value = "mentorSummary", key = "#userId + ':' + #range", unless = "#result == null")
    public SummaryResponse getMentorSummaryByUserId(Long userId, String range) {
        Mentor mentor = mentorRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        String rangeInterval = toRangeInterval(range);

        // sessions summary
        var summary = sessionRepository.summarySessions(mentor.getMentorId(), rangeInterval);
        long totalSessions = summary != null && summary.getTotalSessions() != null ? summary.getTotalSessions() : 0L;
        long totalMinutes = summary != null && summary.getTotalMinutes() != null ? summary.getTotalMinutes() : 0L;

        // reviews summary
        Long totalReviews = reviewRepository.summaryReviews(mentor.getMentorId(), rangeInterval);
        totalReviews = totalReviews == null ? 0L : totalReviews;

        return new SummaryResponse(
                mentor.getMentorId(),
                range,
                totalSessions,
                totalReviews,
                totalMinutes
        );
    }

    /** Timeseries endpoint (cached short-term) */
    @Override
    @Cacheable(value = "mentorTimeseries", key = "#userId + ':' + #metric + ':' + #range + ':' + #interval", unless = "#result == null")
    public TimeseriesResponse getMentorTimeseriesByUserId(Long userId, String metric, String range, String interval) {
        Mentor mentor = mentorRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        int days = parseRangeDays(range);
        LocalDate end = LocalDate.now(ZoneOffset.UTC);
        LocalDate start = end.minusDays(days - 1);

        String rangeInterval = toRangeInterval(range);

        Map<LocalDate, Long> map = new HashMap<>();

        if ("sessions".equalsIgnoreCase(metric)) {
            var rows = sessionRepository.aggregateSessionsByDay(mentor.getMentorId(), rangeInterval);
            for (var r : rows) {
                map.put(r.getDay(), r.getCount() == null ? 0L : r.getCount());
            }
        } else if ("reviews".equalsIgnoreCase(metric)) {
            var rows = reviewRepository.aggregateReviewsByDay(mentor.getMentorId(), rangeInterval);
            for (var r : rows) {
                map.put(r.getDay(), r.getCount() == null ? 0L : r.getCount());
            }
        } else if ("minutes".equalsIgnoreCase(metric)) {
            var rows = sessionRepository.aggregateSessionsByDay(mentor.getMentorId(), rangeInterval);
            for (var r : rows) map.put(r.getDay(), r.getMinutes() == null ? 0L : r.getMinutes());
        } else {
            throw new BookingException("Unsupported metric: " + metric);
        }

        List<String> labels = new ArrayList<>(days);
        List<Long> values = new ArrayList<>(days);

        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            labels.add(d.toString());
            values.add(map.getOrDefault(d, 0L));
        }

        return new TimeseriesResponse(mentor.getMentorId(), metric, interval, labels, values);
    }
}

