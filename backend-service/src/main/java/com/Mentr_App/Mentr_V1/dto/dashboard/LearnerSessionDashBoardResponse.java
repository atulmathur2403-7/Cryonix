package com.Mentr_App.Mentr_V1.dto.dashboard;

import com.Mentr_App.Mentr_V1.dto.session.SessionResponse;
import lombok.Data;

import java.util.List;

//DTO for learner Session dashboard view.


@Data
public class LearnerSessionDashBoardResponse {
    private List<SessionResponse> sessions;
}
