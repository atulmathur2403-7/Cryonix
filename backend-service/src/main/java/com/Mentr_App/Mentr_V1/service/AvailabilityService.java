package com.Mentr_App.Mentr_V1.service;

import com.Mentr_App.Mentr_V1.dto.availability.AvailabilityRequest;
import com.Mentr_App.Mentr_V1.dto.availability.AvailabilityResponse;
import com.Mentr_App.Mentr_V1.dto.availability.PublicAvailabilityResponse;

import java.util.List;

public interface AvailabilityService {
    AvailabilityResponse createAvailability(Long mentorId, AvailabilityRequest request);
    List<AvailabilityResponse> listAvailabilityForMentor(Long mentorId);
    void deleteAvailability(Long mentorId, Long slotId);
    List<PublicAvailabilityResponse> getPublicAvailability(Long mentorId);
}
