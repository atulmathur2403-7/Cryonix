package com.Mentr_App.Mentr_V1.repository;



import com.Mentr_App.Mentr_V1.model.MentorSkillsTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface TagRepository extends JpaRepository<MentorSkillsTag, Long> {

    // For PUT validation (active + case-insensitive)
    @Query("""
        select t from MentorSkillsTag t
        where t.active = true
          and lower(t.name) in :lowerNames
    """)
    List<MentorSkillsTag> findActiveByLowerNames(@Param("lowerNames") Collection<String> lowerNames);

    // Search-as-you-type (relevance ordering + limit)
    @Query(value = """
        select *
        from tags t
        where t.is_active = true
          and (:q is null or trim(:q) = '' or lower(t.name) like concat('%', lower(:q), '%'))
        order by
          case
            when :q is null or trim(:q) = '' then 0
            when lower(t.name) like concat(lower(:q), '%') then 0
            else 1
          end,
          lower(t.name)
        limit :limit
    """, nativeQuery = true)
    List<MentorSkillsTag> searchActiveTags(@Param("q") String q, @Param("limit") int limit);
}

