package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Product;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class ProductRepositoryCustomImpl implements ProductRepositoryCustom {
    private static final char LIKE_ESCAPE_CHAR = '\\';

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Product> searchInStockByKeywords(List<String> keywords, Pageable pageable) {
        List<String> normalizedKeywords = keywords == null
                ? List.of()
                : keywords.stream()
                        .filter(keyword -> keyword != null && !keyword.isBlank())
                        .map(keyword -> keyword.trim().toLowerCase(Locale.ROOT))
                        .distinct()
                        .toList();

        if (normalizedKeywords.isEmpty()) {
            return List.of();
        }

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Product> query = cb.createQuery(Product.class);
        Root<Product> product = query.from(Product.class);

        Expression<String> searchableText = cb.lower(cb.concat(
                cb.concat(
                        cb.concat(cb.coalesce(product.get("name"), ""), " "),
                        cb.concat(cb.coalesce(product.get("description"), ""), " ")
                ),
                cb.concat(
                        cb.concat(cb.coalesce(product.get("category"), ""), " "),
                        cb.concat(cb.coalesce(product.get("brand"), ""), cb.concat(" ", cb.coalesce(product.get("specifications"), "")))
                )
        ));

        List<Predicate> keywordPredicates = new ArrayList<>();
        for (String keyword : normalizedKeywords) {
            keywordPredicates.add(cb.like(
                    searchableText,
                    "%" + escapeLike(keyword) + "%",
                    LIKE_ESCAPE_CHAR
            ));
        }

        Predicate inStock = cb.greaterThan(product.get("stockQuantity"), 0);
        query.select(product)
                .where(cb.and(inStock, cb.or(keywordPredicates.toArray(Predicate[]::new))))
                .orderBy(cb.asc(product.get("id")));

        int maxResults = pageable == null || pageable.getPageSize() <= 0 ? 5 : pageable.getPageSize();
        int firstResult = pageable == null ? 0 : (int) pageable.getOffset();
        return entityManager.createQuery(query)
                .setFirstResult(firstResult)
                .setMaxResults(maxResults)
                .getResultList();
    }

    static String escapeLike(String value) {
        StringBuilder escaped = new StringBuilder(value.length() * 2);
        for (int i = 0; i < value.length(); i++) {
            char current = value.charAt(i);
            if (current == LIKE_ESCAPE_CHAR || current == '%' || current == '_') {
                escaped.append(LIKE_ESCAPE_CHAR);
            }
            escaped.append(current);
        }
        return escaped.toString();
    }
}
