package com.Mentr_App.Mentr_V1.repository;


import com.Mentr_App.Mentr_V1.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findBySession_Id(Long sessionId);
}

