package com.Mentr_App.Mentr_V1.service;


import com.Mentr_App.Mentr_V1.dto.note.NoteRequest;
import com.Mentr_App.Mentr_V1.dto.note.NoteResponse;

import java.util.List;

public interface NoteService {
    NoteResponse addNote(Long sessionId, Long mentorId, NoteRequest request);
    List<NoteResponse> getNotesForSession(Long sessionId, Long userId);

}

