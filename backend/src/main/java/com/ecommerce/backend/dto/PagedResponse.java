package com.ecommerce.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@AllArgsConstructor
public class PagedResponse<T> {
    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;

    public static <T> PagedResponse<T> from(Page<T> springPage, int requestedPage) {
        int totalPages = Math.max(1, springPage.getTotalPages());
        int safePage;
        if (springPage.getTotalElements() == 0) {
            safePage = 1;
        } else if (requestedPage > totalPages) {
            safePage = totalPages;
        } else {
            safePage = Math.max(1, requestedPage);
        }

        return new PagedResponse<>(
                springPage.getContent(),
                springPage.getTotalElements(),
                totalPages,
                safePage,
                springPage.getSize()
        );
    }
}
