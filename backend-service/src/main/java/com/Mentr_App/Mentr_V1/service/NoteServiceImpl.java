package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.note.NoteRequest;
import com.Mentr_App.Mentr_V1.dto.note.NoteResponse;
import com.Mentr_App.Mentr_V1.exception.BookingException;
import com.Mentr_App.Mentr_V1.model.Mentor;
import com.Mentr_App.Mentr_V1.model.Note;
import com.Mentr_App.Mentr_V1.model.Session;
import com.Mentr_App.Mentr_V1.repository.MentorRepository;
import com.Mentr_App.Mentr_V1.repository.NoteRepository;
import com.Mentr_App.Mentr_V1.repository.SessionRepository;
import com.Mentr_App.Mentr_V1.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final SessionRepository sessionRepository;
    private final MentorRepository mentorRepository;

    @Override
    public NoteResponse addNote(Long sessionId, Long mentorUserId, NoteRequest request) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BookingException("Session not found"));

        Mentor mentor = mentorRepository.findByUser_UserId(mentorUserId)
                .orElseThrow(() -> new BookingException("Mentor profile not found"));

        if (!session.getMentor().getMentorId().equals(mentor.getMentorId())) {
            throw new BookingException("You cannot add notes for another mentor’s session");
        }

        Note note = Note.builder()
                .session(session)
                .mentor(mentor)
                .content(request.getContent())
                .resourceLinks(request.getResourceLinks())
                .build();

        Note saved = noteRepository.save(note);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NoteResponse> getNotesForSession(Long sessionId, Long userId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BookingException("Session not found"));

        // Mentor can view notes
        if (session.getMentor().getUser().getUserId().equals(userId)) {
            return noteRepository.findBySession_Id(sessionId).stream()
                    .map(this::toResponse)
                    .toList();
        }

        // Learner can view notes (adjust if session.learner is User vs Learner entity)
        if (session.getLearner().getUserId().equals(userId)) {
            return noteRepository.findBySession_Id(sessionId).stream()
                    .map(this::toResponse)
                    .toList();
        }

        throw new BookingException("You are not allowed to view notes for this session");
    }



    private NoteResponse toResponse(Note n) {
        NoteResponse dto = new NoteResponse();
        dto.setId(n.getId());
        dto.setContent(n.getContent());
        dto.setResourceLinks(n.getResourceLinks());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}

