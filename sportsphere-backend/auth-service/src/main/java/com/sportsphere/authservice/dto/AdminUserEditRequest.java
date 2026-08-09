package com.sportsphere.authservice.dto;

import com.sportsphere.authservice.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserEditRequest {

    private String firstName;
    private String lastName;
    private String profileImage;
    private String bio;
    private List<String> sports;
    private String city;
    private String gender;
    private String experienceLevel;
    private Role role;
}
