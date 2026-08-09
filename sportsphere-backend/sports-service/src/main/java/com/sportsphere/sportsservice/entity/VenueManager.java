package com.sportsphere.sportsservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Join table between a Venue and a user (from auth-service).
 *
 * One user can manage/own MULTIPLE venues — each row is one (venue, user)
 * assignment.
 * The unique constraint on (venue_id, user_id) only prevents duplicate
 * assignments for the same pair; a single user_id can appear across many rows
 * with different venues.
 *
 * <p>
 * Role is stored as a plain String to keep this service decoupled from
 * auth-service's Role enum. The auth-service owns the canonical role
 * definition.
 * Valid values mirror auth-service Role: "OWNER", "MANAGER".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "venue_managers", uniqueConstraints = @UniqueConstraint(columnNames = { "venue_id", "user_id" }))
public class VenueManager {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    /**
     * References the user ID in auth-service's users table.
     * Stored as a plain Long (no DB-level FK across services).
     * A single userId may appear in multiple rows (managing/owning multiple
     * venues).
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Per-venue assignment role for this user.
     * Valid values (owned by auth-service): "OWNER", "MANAGER".
     * Defaults to "MANAGER"; set to "OWNER" when the venue is first registered.
     */
    @Builder.Default
    @Column(name = "role", nullable = false, length = 20)
    private String role = "MANAGER";
}
