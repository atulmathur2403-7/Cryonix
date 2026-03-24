package com.mentr.backend.config;

import com.mentr.backend.model.*;
import com.mentr.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
            UserRepository userRepo,
            MentorRepository mentorRepo,
            SessionRepository sessionRepo,
            ReviewRepository reviewRepo,
            VideoRepository videoRepo,
            FAQRepository faqRepo,
            MessageRepository messageRepo
    ) {
        return args -> {
            // Users
            User user1 = userRepo.save(User.builder()
                    .fullName("Ajay Thakur").username("ajaythakur").email("ajay@mentr.com")
                    .phone("+91 9876543210").bio("Passionate learner exploring tech and design")
                    .interests("Design,Technology,Business").avatar("").sessionsBooked(5)
                    .sessionsCompleted(4).avgRating(4.8).isMentor(false).build());

            // Mentors
            Mentor m1 = mentorRepo.save(Mentor.builder()
                    .name("Andrew Smith").username("andrewsmith").specialty("UX Design")
                    .about("Senior UX Designer with 10+ years of experience at top tech companies. Passionate about creating intuitive user experiences.")
                    .avatar("").isVerified(true).isOnline(true).isLive(false)
                    .followers(24500).following(180).likes(45200).rating(4.9)
                    .totalMentees(156).reviewCount(89).messagePrice(15.0).callPrice(50.0)
                    .subscriptionPrice(199.0).youtubeLink("").location("San Francisco, USA").build());

            Mentor m2 = mentorRepo.save(Mentor.builder()
                    .name("Clayton J").username("claytonj").specialty("Product Management")
                    .about("VP of Product at a Fortune 500 company. Helping aspiring PMs break into the field.")
                    .avatar("").isVerified(true).isOnline(true).isLive(true)
                    .followers(18900).following(95).likes(32100).rating(4.8)
                    .totalMentees(203).reviewCount(145).messagePrice(20.0).callPrice(75.0)
                    .subscriptionPrice(249.0).youtubeLink("").location("New York, USA").build());

            Mentor m3 = mentorRepo.save(Mentor.builder()
                    .name("Mia Chen").username("miachen").specialty("Data Science")
                    .about("Lead Data Scientist at Google. Stanford PhD. Love teaching ML concepts.")
                    .avatar("").isVerified(true).isOnline(false).isLive(false)
                    .followers(31200).following(220).likes(52800).rating(4.95)
                    .totalMentees(87).reviewCount(62).messagePrice(25.0).callPrice(100.0)
                    .subscriptionPrice(299.0).youtubeLink("").location("Mountain View, USA").build());

            Mentor m4 = mentorRepo.save(Mentor.builder()
                    .name("Priya Patel").username("priyapatel").specialty("Frontend Development")
                    .about("Staff Engineer at Netflix. React & TypeScript expert. Open-source contributor.")
                    .avatar("").isVerified(true).isOnline(true).isLive(false)
                    .followers(21800).following(310).likes(38900).rating(4.85)
                    .totalMentees(134).reviewCount(98).messagePrice(12.0).callPrice(60.0)
                    .subscriptionPrice(179.0).youtubeLink("").location("London, UK").build());

            Mentor m5 = mentorRepo.save(Mentor.builder()
                    .name("James Wilson").username("jameswilson").specialty("Startup Strategy")
                    .about("3x founder, 2 successful exits. Angel investor. Helping founders build and scale.")
                    .avatar("").isVerified(true).isOnline(false).isLive(false)
                    .followers(45600).following(890).likes(67200).rating(4.7)
                    .totalMentees(312).reviewCount(201).messagePrice(30.0).callPrice(150.0)
                    .subscriptionPrice(399.0).youtubeLink("").location("Austin, USA").build());

            Mentor m6 = mentorRepo.save(Mentor.builder()
                    .name("Sarah Kim").username("sarahkim").specialty("Mobile Development")
                    .about("iOS Lead at Uber. Swift & Kotlin expert. Building great mobile experiences.")
                    .avatar("").isVerified(false).isOnline(true).isLive(false)
                    .followers(12400).following(156).likes(19800).rating(4.6)
                    .totalMentees(67).reviewCount(42).messagePrice(10.0).callPrice(45.0)
                    .subscriptionPrice(149.0).youtubeLink("").location("Seoul, Korea").build());

            // Sessions
            sessionRepo.save(Session.builder()
                    .learnerId(user1.getId()).mentorId(m1.getId()).mentorName("Andrew Smith").mentorAvatar("")
                    .date("2025-03-15").time("10:00 AM").sessionType("Video Call").subject("UX Portfolio Review")
                    .duration(30).status("upcoming").paymentAmount(50.0).currency("USD")
                    .ratingGiven(null).notes("").build());

            sessionRepo.save(Session.builder()
                    .learnerId(user1.getId()).mentorId(m2.getId()).mentorName("Clayton J").mentorAvatar("")
                    .date("2025-03-20").time("2:00 PM").sessionType("Video Call").subject("PM Interview Prep")
                    .duration(45).status("upcoming").paymentAmount(75.0).currency("USD")
                    .ratingGiven(null).notes("").build());

            sessionRepo.save(Session.builder()
                    .learnerId(user1.getId()).mentorId(m4.getId()).mentorName("Priya Patel").mentorAvatar("")
                    .date("2025-02-28").time("11:00 AM").sessionType("Video Call").subject("React Best Practices")
                    .duration(30).status("completed").paymentAmount(60.0).currency("USD")
                    .ratingGiven(5.0).notes("Great session on hooks and performance optimization").build());

            sessionRepo.save(Session.builder()
                    .learnerId(user1.getId()).mentorId(m3.getId()).mentorName("Mia Chen").mentorAvatar("")
                    .date("2025-02-20").time("3:00 PM").sessionType("Booked VC").subject("ML Career Guidance")
                    .duration(60).status("completed").paymentAmount(100.0).currency("USD")
                    .ratingGiven(4.5).notes("Discussed ML roadmap and project ideas").build());

            // Reviews
            reviewRepo.save(Review.builder()
                    .learnerId(user1.getId()).learnerName("Ajay Thakur").learnerAvatar("")
                    .mentorId(m1.getId()).sessionId("").rating(5.0)
                    .text("Andrew is an incredible mentor! His UX insights transformed my portfolio.")
                    .attachments("").createdAt("2025-02-15T10:00:00Z").build());

            reviewRepo.save(Review.builder()
                    .learnerId(user1.getId()).learnerName("Ajay Thakur").learnerAvatar("")
                    .mentorId(m4.getId()).sessionId("").rating(5.0)
                    .text("Priya's React knowledge is outstanding. The session was very practical and helpful.")
                    .attachments("").createdAt("2025-03-01T14:00:00Z").build());

            reviewRepo.save(Review.builder()
                    .learnerId("user2").learnerName("Rohan K").learnerAvatar("")
                    .mentorId(m1.getId()).sessionId("").rating(4.5)
                    .text("Very insightful session. Andrew gave actionable feedback on my designs.")
                    .attachments("").createdAt("2025-02-20T09:00:00Z").build());

            reviewRepo.save(Review.builder()
                    .learnerId("user3").learnerName("Lisa M").learnerAvatar("")
                    .mentorId(m2.getId()).sessionId("").rating(4.8)
                    .text("Clayton helped me understand the PM landscape. Highly recommend!")
                    .attachments("").createdAt("2025-02-25T16:00:00Z").build());

            reviewRepo.save(Review.builder()
                    .learnerId("user4").learnerName("David R").learnerAvatar("")
                    .mentorId(m3.getId()).sessionId("").rating(5.0)
                    .text("Mia is the best ML mentor I've ever had. Clear explanations and patient teaching style.")
                    .attachments("").createdAt("2025-01-15T11:00:00Z").build());

            reviewRepo.save(Review.builder()
                    .learnerId("user5").learnerName("Emma W").learnerAvatar("")
                    .mentorId(m5.getId()).sessionId("").rating(4.5)
                    .text("James gave amazing startup advice. His experience really shows.")
                    .attachments("").createdAt("2025-03-05T08:00:00Z").build());

            // Videos
            videoRepo.save(Video.builder()
                    .mentorId(m1.getId()).mentorName("Andrew Smith").mentorAvatar("")
                    .title("UX Design Principles for Beginners").description("Learn the fundamental principles of UX design.")
                    .thumbnailUrl("").videoUrl("").likes(1250).viewCount(45600)
                    .isLive(false).liveViewerCount(0).createdAt("2025-01-10T10:00:00Z").build());

            videoRepo.save(Video.builder()
                    .mentorId(m2.getId()).mentorName("Clayton J").mentorAvatar("")
                    .title("How to Ace PM Interviews at FAANG").description("Comprehensive guide to product management interviews.")
                    .thumbnailUrl("").videoUrl("").likes(2340).viewCount(78900)
                    .isLive(false).liveViewerCount(0).createdAt("2025-01-20T14:00:00Z").build());

            videoRepo.save(Video.builder()
                    .mentorId(m3.getId()).mentorName("Mia Chen").mentorAvatar("")
                    .title("Introduction to Machine Learning with Python").description("Get started with ML using Python and scikit-learn.")
                    .thumbnailUrl("").videoUrl("").likes(3450).viewCount(120000)
                    .isLive(false).liveViewerCount(0).createdAt("2025-02-01T09:00:00Z").build());

            videoRepo.save(Video.builder()
                    .mentorId(m4.getId()).mentorName("Priya Patel").mentorAvatar("")
                    .title("Advanced React Patterns & Performance").description("Deep dive into React patterns for scalable apps.")
                    .thumbnailUrl("").videoUrl("").likes(1890).viewCount(56700)
                    .isLive(false).liveViewerCount(0).createdAt("2025-02-15T11:00:00Z").build());

            videoRepo.save(Video.builder()
                    .mentorId(m2.getId()).mentorName("Clayton J").mentorAvatar("")
                    .title("Live: Product Strategy Workshop").description("Live interactive session on product strategy.")
                    .thumbnailUrl("").videoUrl("").likes(890).viewCount(12400)
                    .isLive(true).liveViewerCount(342).createdAt("2025-03-10T15:00:00Z").build());

            videoRepo.save(Video.builder()
                    .mentorId(m5.getId()).mentorName("James Wilson").mentorAvatar("")
                    .title("From Idea to IPO: Startup Journey").description("Complete guide to building a startup from scratch.")
                    .thumbnailUrl("").videoUrl("").likes(4560).viewCount(189000)
                    .isLive(false).liveViewerCount(0).createdAt("2025-01-05T10:00:00Z").build());

            // FAQs
            faqRepo.save(FAQ.builder().question("How do I book a session with a mentor?")
                    .answer("Navigate to the mentor's profile, click 'Book a Call', select a date and time, and proceed to payment.")
                    .category("Booking").build());

            faqRepo.save(FAQ.builder().question("What payment methods are accepted?")
                    .answer("We accept credit cards, debit cards, Google Pay, PayPal, and internet banking.")
                    .category("Payments").build());

            faqRepo.save(FAQ.builder().question("Can I cancel a session?")
                    .answer("Yes, you can cancel up to 24 hours before the session for a full refund. Cancellations within 24 hours may incur a 50% fee.")
                    .category("Booking").build());

            faqRepo.save(FAQ.builder().question("How do I become a mentor?")
                    .answer("Click 'Become a Mentor' in the sidebar, fill out the application form with your expertise and experience, and our team will review your application within 48 hours.")
                    .category("Mentors").build());

            faqRepo.save(FAQ.builder().question("Is there a free trial?")
                    .answer("New users get one free 15-minute session with any mentor. After that, sessions are charged based on the mentor's rates.")
                    .category("General").build());

            faqRepo.save(FAQ.builder().question("How does the messaging system work?")
                    .answer("You can message any mentor directly. Free messages are limited to 3 per mentor per day. For unlimited messaging, subscribe to the mentor's plan.")
                    .category("Messaging").build());

            faqRepo.save(FAQ.builder().question("What if I face technical issues during a call?")
                    .answer("If you face technical issues, try refreshing your browser. If the problem persists, contact our support team and we'll reschedule your session for free.")
                    .category("Technical").build());

            // Messages
            messageRepo.save(Message.builder()
                    .senderId(user1.getId()).receiverId(m1.getId()).conversationId("conv1")
                    .text("Hi Andrew! I'd love to discuss my UX portfolio with you.").type("text")
                    .createdAt("2025-03-10T09:00:00Z").isRead(true).build());

            messageRepo.save(Message.builder()
                    .senderId(m1.getId()).receiverId(user1.getId()).conversationId("conv1")
                    .text("Hey Ajay! Sure, I'd be happy to help. Let's schedule a call.").type("text")
                    .createdAt("2025-03-10T09:05:00Z").isRead(true).build());

            messageRepo.save(Message.builder()
                    .senderId(user1.getId()).receiverId(m2.getId()).conversationId("conv2")
                    .text("Hi Clayton, I'm preparing for PM interviews. Can you help?").type("text")
                    .createdAt("2025-03-11T14:00:00Z").isRead(false).build());

            System.out.println("=== Sample data seeded successfully! ===");
        };
    }
}
