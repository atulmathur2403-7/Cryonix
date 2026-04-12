package com.Mentr_App.Mentr_V1.repository;




import com.Mentr_App.Mentr_V1.model.Mentor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorRepository extends JpaRepository<Mentor, Long>, JpaSpecificationExecutor<Mentor> {

    Optional<Mentor> findByUser_UserId(Long userUserId);

    List<Mentor> findTop5ByOrderByBookingsCountDesc();

    List<Mentor> findAllByOrderByBookingsCountDesc();

    // ✅ Existing tags-only cache filtering (kept for backward compatibility)
    @Query(
            value = """
                select m.*
                from mentors m
                join users u on u.user_id = m.user_id
                left join mentor_profile mp on mp.user_id = u.user_id
                where
                    (:q is null or trim(:q) = ''
                        or lower(u.name) like concat('%', lower(:q), '%')
                        or lower(coalesce(m.expertise, '')) like concat('%', lower(:q), '%')
                    )
                  and (
                    :skillsEmpty = true
                    or (mp.tags_cache && cast(:skills as text[]))
                  )
                order by m.bookings_count desc
            """,
            countQuery = """
                select count(*)
                from mentors m
                join users u on u.user_id = m.user_id
                left join mentor_profile mp on mp.user_id = u.user_id
                where
                    (:q is null or trim(:q) = ''
                        or lower(u.name) like concat('%', lower(:q), '%')
                        or lower(coalesce(m.expertise, '')) like concat('%', lower(:q), '%')
                    )
                  and (
                    :skillsEmpty = true
                    or (mp.tags_cache && cast(:skills as text[]))
                  )
            """,
            nativeQuery = true
    )
    Page<Mentor> searchWithTagsCache(
            @Param("q") String q,
            @Param("skillsEmpty") boolean skillsEmpty,
            @Param("skills") String[] skills,
            Pageable pageable
    );

    // ✅ NEW: tags_cache + languages_cache + optional pronouns
    @Query(
            value = """
                select m.*
                from mentors m
                join users u on u.user_id = m.user_id
                left join mentor_profile mp on mp.user_id = u.user_id
                where
                    (:q is null or trim(:q) = ''
                        or lower(u.name) like concat('%', lower(:q), '%')
                        or lower(coalesce(m.expertise, '')) like concat('%', lower(:q), '%')
                    )
                  and (
                    :skillsEmpty = true
                    or (mp.tags_cache && cast(:skills as text[]))
                  )
                  and (
                    :languagesEmpty = true
                    or (mp.languages_cache && cast(:languages as text[]))
                  )
                  and (
                    :pronouns is null
                    or u.pronouns = :pronouns
                  )
                order by m.bookings_count desc
            """,
            countQuery = """
                select count(*)
                from mentors m
                join users u on u.user_id = m.user_id
                left join mentor_profile mp on mp.user_id = u.user_id
                where
                    (:q is null or trim(:q) = ''
                        or lower(u.name) like concat('%', lower(:q), '%')
                        or lower(coalesce(m.expertise, '')) like concat('%', lower(:q), '%')
                    )
                  and (
                    :skillsEmpty = true
                    or (mp.tags_cache && cast(:skills as text[]))
                  )
                  and (
                    :languagesEmpty = true
                    or (mp.languages_cache && cast(:languages as text[]))
                  )
                  and (
                    :pronouns is null
                    or u.pronouns = :pronouns
                  )
            """,
            nativeQuery = true
    )
    Page<Mentor> searchWithCaches(
            @Param("q") String q,
            @Param("skillsEmpty") boolean skillsEmpty,
            @Param("skills") String[] skills,
            @Param("languagesEmpty") boolean languagesEmpty,
            @Param("languages") String[] languages,
            @Param("pronouns") String pronouns,
            Pageable pageable
    );
}
