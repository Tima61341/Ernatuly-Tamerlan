package com.quizmaster.controller;

import com.quizmaster.dto.response.ApiResponse;
import com.quizmaster.dto.response.StatisticsResponse;
import com.quizmaster.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StatisticsResponse.AdminDashboard>> getAdminDashboard() {
        StatisticsResponse.AdminDashboard dashboard = statisticsService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/creator/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'CREATOR')")
    public ResponseEntity<ApiResponse<StatisticsResponse.CreatorDashboard>> getCreatorDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        StatisticsResponse.CreatorDashboard dashboard = statisticsService.getCreatorDashboard(
                userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }
}
