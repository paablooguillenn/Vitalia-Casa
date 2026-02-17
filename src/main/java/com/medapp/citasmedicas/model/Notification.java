package com.medapp.citasmedicas.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String message;
    private LocalDateTime createdAt;
    private boolean read;
    private String type; // e.g. APPOINTMENT_REMINDER, NEW_APPOINTMENT, CANCELLATION, ADMIN, ATTACHMENT, MESSAGE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public Notification() {}

    public Notification(String title, String message, String type, User user) {
        this.title = title;
        this.message = message;
        this.type = type;
        this.user = user;
        this.createdAt = LocalDateTime.now();
        this.read = false;
    }

    // Getters and setters
    // ...
}
