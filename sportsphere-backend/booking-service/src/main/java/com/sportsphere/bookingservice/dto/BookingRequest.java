package com.sportsphere.bookingservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull(message = "Ground ID is required")
    private Long groundId;

    @NotNull(message = "Slot ID is required")
    private Long slotId;

    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;

    private String notes;
}
