package com.Mentr_App.Mentr_V1.repository;


import com.Mentr_App.Mentr_V1.model.Mentor;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Dynamic specifications for Mentor search.
 * - filters by q (mentor name or expertise) and skills (comma-separated tokens).
 */
public final class MentorSpecifications {

    private MentorSpecifications() {}

    public static Specification<Mentor> searchByQueryAndSkills(String q, List<String> skills) {
        return (Root<Mentor> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            // join to User for name search
            Join<Object,Object> userJoin = root.join("user", JoinType.LEFT);

            List<Predicate> predicates = new ArrayList<>();

            if (q != null && !q.trim().isEmpty()) {
                String like = "%" + q.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(userJoin.get("name")), like),
                        cb.like(cb.lower(root.get("expertise")), like)
                ));
            }

            if (skills != null && !skills.isEmpty()) {
                List<Predicate> skillPreds = new ArrayList<>();
                for (String s : skills) {
                    String token = "%" + s.trim().toLowerCase() + "%";
                    skillPreds.add(cb.like(cb.lower(root.get("expertise")), token));
                }
                predicates.add(cb.or(skillPreds.toArray(new Predicate[0])));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

