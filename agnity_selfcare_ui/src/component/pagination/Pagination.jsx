import React, { Component, Fragment } from "react";

const LEFT_PAGE = "LEFT";
const RIGHT_PAGE = "RIGHT";

/**
* Helper method for creating a range of numbers
* range(1, 5) => [1, 2, 3, 4, 5]
*/
const range = (from, to, step = 1) => {
    let i = from;
    const range = [];

    while (i <= to) {
        range.push(i);
        i += step;
    }

    return range;
};

class Pagination extends Component {
    constructor(props) {
        super(props);
        this.totalPages = Math.ceil(this.props.totalRecords / this.props.pageLimit);
        let currentPage = this.props.current_page;
        this.state = { currentPage };
    }

    componentDidMount() {
        this.gotoPage(1);
    }

    gotoPage = (page) => {
        // alert(page)
        const { onPageChanged = (f) => f } = this.props;
        let t = Math.ceil(this.props.totalRecords / this.props.pageLimit);
        const currentPage = Math.max(0, Math.min(page, t));

        const paginationData = {
            currentPage,
            totalPages: t,
            pageLimit: this.props.pageLimit,
            totalRecords: this.props.totalRecords,
        };

        this.setState({ currentPage }, () => onPageChanged(paginationData));
    };

    handleClick = (page) => (evt) => {
        evt.preventDefault();
        this.gotoPage(page);
    };

    handleMoveLeft = (evt) => {
        evt.preventDefault();
        this.gotoPage(this.state.currentPage - this.props.pageNeighbours * 2 - 1);
    };

    handleMoveRight = (evt) => {
        evt.preventDefault();
        this.gotoPage(this.state.currentPage + this.props.pageNeighbours * 2 + 1);
    };

    /**
    * Let's say we have 10 pages and we set pageNeighbours to 2
    * Given that the current page is 6
    * The pagination control will look like the following:
    *
    * (1) < {4 5} [6] {7 8} > (10)
    *
    * (x) => terminal pages: first and last page(always visible)
    * [x] => represents current page
    * {...x} => represents page neighbours
    */
    fetchPageNumbers = (totalPages, currentPage, pageNeighbours) => {
        // const totalPages = this.totalPages;
        // const currentPage = this.state.currentPage;
        // const pageNeighbours = this.props.pageNeighbours;

        /**
        * totalNumbers: the total page numbers to show on the control
        * totalBlocks: totalNumbers + 2 to cover for the left(<) and right(>) controls
        */
        const totalNumbers = this.props.pageNeighbours * 2 + 3;
        const totalBlocks = totalNumbers + 2;
        if (totalPages > totalBlocks) {
            const startPage = Math.max(2, currentPage - pageNeighbours);
            const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);

            let pages = range(startPage, endPage);

            /**
            * hasLeftSpill: has hidden pages to the left
            * hasRightSpill: has hidden pages to the right
            * spillOffset: number of hidden pages either to the left or to the right
            */
            const hasLeftSpill = startPage > 2;
            const hasRightSpill = totalPages - endPage > 1;
            const spillOffset = totalNumbers - (pages.length + 1);

            switch (true) {
                // handle: (1) < {5 6} [7] {8 9} (10)
                case hasLeftSpill && !hasRightSpill: {
                    const extraPages = range(startPage - spillOffset, startPage - 1);
                    pages = ["goto_first", LEFT_PAGE, 1, "dot_left", ...extraPages, ...pages, totalPages];
                    break;
                }

                // handle: (1) {2 3} [4] {5 6} > (10)
                case !hasLeftSpill && hasRightSpill: {
                    const extraPages = range(endPage + 1, endPage + spillOffset);
                    pages = [1, ...pages, ...extraPages, "dot_right", totalPages, RIGHT_PAGE, "goto_last"];
                    break;
                }

                // handle: (1) < {4 5} [6] {7 8} > (10)
                case hasLeftSpill && hasRightSpill:
                default: {
                    pages = ["goto_first", LEFT_PAGE, 1, "dot_left", ...pages, "dot_right", totalPages, RIGHT_PAGE, "goto_last"];
                    break;
                }
            }
            return pages
            // return [1, ...pages, totalPages];
        }

        return range(1, totalPages);
    };
    handle_neighbour = (direction) => (e) => {
        // alert(direction)
        e.preventDefault()
        let current_page = this.props.current_page;
       
        switch (direction) {
            case "right":
                this.gotoPage(current_page + 1);
                break;
            case "left":
                this.gotoPage(current_page - 1)
                break;
            case "last":
                let last_page = Math.ceil(this.props.totalRecords / this.props.pageLimit)
                this.gotoPage(last_page)
                break
            case "first":
                this.gotoPage(1)
                break
        }



    }
    render() {
        if (!this.props.totalRecords || this.totalPages === 1) return null;
        const pages = this.fetchPageNumbers(
            Math.ceil(this.props.totalRecords / this.props.pageLimit),
            this.props.current_page,
            this.props.pageNeighbours
        );
        // alert(pages)
        return (
            <Fragment>
                <nav aria-label>
                    <ul className="pagination">
                        {pages.map((page, index) => {
                            if (page === "dot_left")
                                return (


                                    <li key={index} className="page-item">
                                        <a
                                            className="page-link"
                                            href="#"
                                            aria-label="Previous"
                                            onClick={this.handleMoveLeft}
                                        >
                                            <span aria-hidden="true">...</span>
                                            <span className="sr-only">Previous</span>
                                        </a>
                                    </li>


                                );
                            if (page === "goto_first") {
                                return (
                                    <li key={index} className="page-item">
                                        <a
                                            className="page-link"
                                            href="#"
                                            aria-label="Previous"
                                            onClick={this.handle_neighbour("first")}
                                        >
                                            <span aria-hidden="true">&lt; &lt;</span>
                                            <span className="sr-only">Previous</span>
                                        </a>
                                    </li>
                                )
                            }
                            if (page === "goto_last") {
                                return (
                                    <li key={index} className="page-item">
                                        <a
                                            className="page-link"
                                            href="#"
                                            aria-label="Next"
                                            onClick={this.handle_neighbour("last")}
                                        >
                                            <span aria-hidden="true">&gt; &gt;</span>
                                            <span className="sr-only">Next</span>
                                        </a>
                                    </li>
                                )
                            }
                            if (page === "dot_right") {
                                return (
                                    <li key={index} className="page-item">
                                        <a
                                            className="page-link"
                                            href="#"
                                            aria-label="Next"
                                            onClick={this.handleMoveRight}
                                        >
                                            <span aria-hidden="true">...</span>
                                            <span className="sr-only">Next</span>
                                        </a>
                                    </li>
                                )
                            }
                            if (page === RIGHT_PAGE)
                                return (

                                    <li key={index} className="page-item">
                                        <a
                                            className="page-link"
                                            href="#"
                                            aria-label="Next"
                                            onClick={this.handle_neighbour("right")}
                                        >
                                            <span aria-hidden="true">&gt;</span>
                                            <span className="sr-only">Next</span>
                                        </a>
                                    </li>

                                );
                            if (page === LEFT_PAGE)
                                return (

                                    <li key={index} className="page-item">
                                        <a
                                            className="page-link"
                                            href="#"
                                            aria-label="Next"
                                            onClick={this.handle_neighbour("left")}
                                        >
                                            <span aria-hidden="true">&lt;</span>
                                            <span className="sr-only">Next</span>
                                        </a>
                                    </li>

                                );

                            return (
                                <li
                                    key={index}
                                    className="page-item"
                                >
                                    <a
                                        className={`page-link ${
                                            this.props.current_page === page ? " activePagination" : ""
                                            }`}
                                        href="#"
                                        onClick={this.handleClick(page)}
                                    >
                                        {page}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </Fragment>
        );
    }
}

export default Pagination;