package com.ecommerce.backend.util;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.function.Function;

public final class PageFetch {
    private PageFetch() {
    }

    public static <T> Page<T> clampRequestedPage(Page<T> page, int requestedPage, Function<Pageable, Page<T>> refetch) {
        if (page.getTotalElements() == 0 || !page.getContent().isEmpty()) {
            return page;
        }

        int totalPages = page.getTotalPages();
        if (totalPages <= 0 || requestedPage <= totalPages) {
            return page;
        }

        Pageable lastPageable = PageRequest.of(
                totalPages - 1,
                page.getSize(),
                page.getPageable().getSort()
        );
        return refetch.apply(lastPageable);
    }
}
