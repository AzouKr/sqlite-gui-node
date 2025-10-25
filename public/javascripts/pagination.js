class Pagination {
    constructor(options) {
        const defaults = {
            element: null,
            perPageOptions: [10, 20, 50, 100],
            defaultPerPage: 20,
            currentPage: 1,
            onChange: null
        };

        this.config = { ...defaults, ...options };

        if (!this.config.element) {
            throw new Error('Необходимо указать элемент для монтирования (element)');
        }

        this.currentPage = this.config.currentPage || 1;
        this.itemsPerPage = this.config.defaultPerPage;
        this.totalItems = 0;

        this.render();
        this.attachEvents();
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'pagination-wrapper';
        wrapper.innerHTML = `
                    <div class="pagination" data-pagination></div>
                    <div class="per-page-selector">
                        <label for="perPage-${Date.now()}">per page:</label>
                        <select id="perPage-${Date.now()}" class="per-page-select">
                            ${this.config.perPageOptions.map(value =>
            `<option value="${value}" ${value === this.itemsPerPage ? 'selected' : ''}>${value}</option>`
        ).join('')}
                        </select>
                    </div>
                `;

        this.config.element.innerHTML = '';
        this.config.element.appendChild(wrapper);

        this.paginationContainer = wrapper.querySelector('[data-pagination]');
        this.perPageSelect = wrapper.querySelector('.per-page-select');
    }

    // Привязка событий
    attachEvents() {
        this.perPageSelect.addEventListener('change', () => {
            this.setItemsPerPage(parseInt(this.perPageSelect.value));
        });

        this.paginationContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && !e.target.disabled) {
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page)) {
                    this.goToPage(page);
                }
            }
        });
    }

    setTotalItems(total) {
        this.totalItems = total;
        this.renderPagination();
    }

    getCurrentPage() {
        return this.currentPage;
    }

    getItemsPerPage() {
        return this.itemsPerPage;
    }

    getTotalPages() {
        return Math.ceil(this.totalItems / this.itemsPerPage);
    }

    getPageInfo() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = Math.min(start + this.itemsPerPage, this.totalItems);

        return {
            currentPage: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            totalPages: this.getTotalPages(),
            totalItems: this.totalItems,
            startIndex: start,
            endIndex: end
        };
    }

    goToPage(page) {
        const totalPages = this.getTotalPages();

        if (page < 1 || page > totalPages || page === this.currentPage) {
            return;
        }

        this.currentPage = page;
        this.renderPagination();
        this.triggerChange();
    }

    setItemsPerPage(count) {
        if (this.itemsPerPage === count) return;

        this.itemsPerPage = count;
        this.currentPage = 1;
        this.renderPagination();
        this.triggerChange();
    }

    triggerChange() {
        if (typeof this.config.onChange === 'function') {
            this.config.onChange(this.getPageInfo());
        }
    }

    renderPagination() {
        const totalPages = this.getTotalPages();
        let pages = [];

        // Previous
        pages.push(`
                    <button ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">
                        ←
                    </button>
                `);

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(`
                            <button class="${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                                ${i}
                            </button>
                        `);
            }
        } else {
            // First page
            pages.push(`
                        <button class="${1 === this.currentPage ? 'active' : ''}" data-page="1">
                            1
                        </button>
                    `);

            if (this.currentPage > 3) {
                pages.push('<span class="dots">...</span>');
            }
            // Nearest pages
            let startPage = Math.max(2, this.currentPage - 1);
            let endPage = Math.min(totalPages - 1, this.currentPage + 1);

            for (let i = startPage; i <= endPage; i++) {
                pages.push(`
                            <button class="${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                                ${i}
                            </button>
                        `);
            }

            if (this.currentPage < totalPages - 2) {
                pages.push('<span class="dots">...</span>');
            }

            // Last page
            pages.push(`
                        <button class="${totalPages === this.currentPage ? 'active' : ''}" data-page="${totalPages}">
                            ${totalPages}
                        </button>
                    `);
        }

        // Next Page
        pages.push(`
                    <button ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">
                        →
                    </button>
                `);

        this.paginationContainer.innerHTML = pages.join('');
    }

    destroy() {
        this.config.element.innerHTML = '';
    }
}