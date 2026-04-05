package com.Mentr_App.Mentr_V1.repository;


import com.Mentr_App.Mentr_V1.model.Language;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface LanguageRepository extends JpaRepository<Language, Long> {

    // For PUT validation (case-insensitive)
    @Query("""
        select l from Language l
        where lower(l.name) in :lowerNames
    """)
    List<Language> findByLowerNames(@Param("lowerNames") Collection<String> lowerNames);

    @Query("""
        select l from Language l
        where l.active = true
          and lower(l.name) in :lowerNames
    """)
    List<Language> findActiveByLowerNames(@Param("lowerNames") Collection<String> lowerNames);

    // Search-as-you-type (relevance ordering + limit)
    @Query(value = """
        select *
        from languages l
        where l.is_active = true
          and (:q is null or trim(:q) = '' or lower(l.name) like concat('%', lower(:q), '%'))
        order by
          case
            when :q is null or trim(:q) = '' then 0
            when lower(l.name) like concat(lower(:q), '%') then 0
            else 1
          end,
          lower(l.name)
        limit :limit
    """, nativeQuery = true)
    List<Language> searchActiveLanguages(@Param("q") String q, @Param("limit") int limit);
}
