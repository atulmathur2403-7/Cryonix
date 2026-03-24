# Mentr - Mentorship Platform

A full-stack mentorship platform where learners can connect with mentors through video calls, messaging, and subscriptions.

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Material UI v7** for components
- **React Router v7** for routing
- **Axios** for HTTP requests
- Dark/Light theme toggle (Royal Blue & White)

### Backend
- **Java 17** with Spring Boot 3.4
- **Spring Data JPA** with H2 in-memory database
- **Lombok** for reducing boilerplate
- RESTful API endpoints

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm start
```

Opens at [http://localhost:3000](http://localhost:3000)

### Backend

Requires **Java 17+** and **Maven**.

```bash
cd backend
./mvnw spring-boot:run
```

Runs at [http://localhost:8080](http://localhost:8080)

H2 Console: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- JDBC URL: `jdbc:h2:mem:mentrdb`
- Username: `sa`
- Password: (empty)

## API Endpoints

| Resource | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| Mentors | GET | `/api/mentors` | List all mentors |
| Mentors | GET | `/api/mentors/{id}` | Get mentor by ID |
| Mentors | GET | `/api/mentors/search?query=` | Search mentors |
| Mentors | GET | `/api/mentors/online` | Online mentors |
| Mentors | GET | `/api/mentors/live` | Live mentors |
| Mentors | GET | `/api/mentors/trending` | Trending mentors |
| Mentors | POST | `/api/mentors` | Create mentor |
| Sessions | GET | `/api/sessions` | List all sessions |
| Sessions | GET | `/api/sessions/{id}` | Get session |
| Sessions | GET | `/api/sessions/learner/{id}` | Sessions by learner |
| Sessions | POST | `/api/sessions` | Create session |
| Sessions | PATCH | `/api/sessions/{id}/complete` | Complete session |
| Sessions | PATCH | `/api/sessions/{id}/cancel` | Cancel session |
| Payments | GET | `/api/payments` | List payments |
| Payments | POST | `/api/payments` | Create payment |
| Auth | POST | `/api/auth/signup` | Sign up |
| Auth | POST | `/api/auth/signin` | Sign in |
| Users | GET | `/api/users/{id}` | Get user |
| Users | PUT | `/api/users/{id}` | Update user |
| Reviews | GET | `/api/reviews/mentor/{id}` | Reviews for mentor |
| Reviews | POST | `/api/reviews` | Submit review |
| Messages | GET | `/api/messages/conversation/{id}` | Get messages |
| Messages | POST | `/api/messages` | Send message |
| Videos | GET | `/api/videos` | List videos |
| Videos | GET | `/api/videos/{id}` | Get video |
| Videos | GET | `/api/videos/live` | Live videos |
| Support | GET | `/api/support/faqs` | Get FAQs |
| Support | POST | `/api/support/report` | Submit report |

## Pages

- **Home** - Landing page with search, categories, trending mentors
- **Explore** - Browse mentors with filters
- **Search Results** - Experts, Videos, Live tabs
- **Mentor Profile** - Full profile with reviews and videos
- **Call Booking** - Book or start instant call
- **Payment** - Multi-method payment checkout
- **Order Success/Failed** - Payment result pages
- **Dashboard** - Upcoming and past sessions
- **Messages** - Real-time chat interface
- **Video Call** - Live video call with controls
- **Session Complete** - Post-session review and notes
- **Call History** - Full call history table
- **Profile** - User profile management
- **Support** - FAQs and issue reporting
- **Write Review** - Submit mentor review
- **Video Detail** - Watch and comment on videos

## Theme

The app supports dark and light themes with:
- **Primary**: Royal Blue (`#1a3fc4` light / `#4e6bdb` dark)
- **Secondary**: Purple (`#7C5CFC`)
- Toggle via the theme button in the header
