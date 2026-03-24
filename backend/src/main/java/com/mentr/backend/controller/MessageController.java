package com.mentr.backend.controller;

import com.mentr.backend.model.Message;
import com.mentr.backend.repository.MessageRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageRepository messageRepository;

    public MessageController(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @GetMapping("/conversation/{conversationId}")
    public List<Message> getMessagesByConversation(@PathVariable String conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    @PostMapping
    public Message sendMessage(@RequestBody Message message) {
        message.setCreatedAt(java.time.Instant.now().toString());
        message.setRead(false);
        return messageRepository.save(message);
    }

    @PatchMapping("/{id}/read")
    public Message markAsRead(@PathVariable String id) {
        Message msg = messageRepository.findById(id).orElseThrow();
        msg.setRead(true);
        return messageRepository.save(msg);
    }
}
