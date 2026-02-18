package com.medapp.citasmedicas.service;

import com.medapp.citasmedicas.model.Notification;
import com.medapp.citasmedicas.model.User;
import com.medapp.citasmedicas.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private EmailService emailService;

    public Notification createNotification(String title, String message, String type, User user) {
        Notification notification = new Notification(title, message, type, user);
        Notification saved = notificationRepository.save(notification);
        // Enviar email al usuario
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            emailService.sendSimpleEmail(user.getEmail(), title, message);
        }
        return saved;
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndReadFalse(user);
    }
}
