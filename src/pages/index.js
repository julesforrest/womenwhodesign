import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import { stringify as qsStringify } from "query-string";
import useSWR from "swr";
import categories from "../categories";
import Profile from "../components/profile";
import Layout from "../components/layout";
import FilterPill from "../components/filterPill";
import Nav from "../components/nav";
import paginate from "../paginate";
import styles from "./index.module.scss";

const useFetch = (url, options) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(url, options);
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e);
      }
    };
    fetchData();
  }, [url, options]);

  return { data, error };
};

const App = () => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isFilterListVisible, setIsFilterListVisible] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const profileContainerRef = useRef();

  const numDesignersPerPage = 52;
  const numPagesToShowInPagination = 5;

  const hash = useRef(Math.random());

  const { data } = useSWR(
    // eslint-disable-next-line prefer-template
    "https://womenwhodesign-e87dc.firebaseapp.com/api?" +
      qsStringify({
        hash: hash.current,
        limit: numDesignersPerPage,
        offset: numDesignersPerPage * (currentPage - 1),
        tags: selectedFilters
      }),
    async url => {
      const r = await fetch(url);
      return r.json();
    }
  );

  const pagination = data
    ? paginate(
        data.info.numFilteredDesigners,
        currentPage,
        numDesignersPerPage,
        numPagesToShowInPagination
      )
    : null;

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <Nav
            filter
            theme="dark"
            toggleFilterList={() => {
              setIsFilterListVisible(!isFilterListVisible);
            }}
            isLoading={!data}
          />

          <div
            className={classnames({
              [styles.filterContainer]: true,
              [styles.filterListVisible]: isFilterListVisible
            })}
          >
            <h2 className={styles.filterHeadline}>Filter by</h2>
            <ul className={styles.filterUl}>
              {categories
                .filter(category => {
                  if (isFiltersExpanded) {
                    return true;
                  }

                  return category.primaryFilter;
                })
                .map(category => {
                  return (
                    <li className={styles.filterItem} key={category.id}>
                      <input
                        id={category.id}
                        type="checkbox"
                        value={category.id}
                        onChange={e => {
                          const categoryId = e.target.value;
                          const isChecked = e.target.checked;

                          const newSelectedFilters = [...selectedFilters];

                          if (isChecked) {
                            newSelectedFilters.push(categoryId);
                          } else {
                            const i = newSelectedFilters.indexOf(categoryId);
                            newSelectedFilters.splice(i, 1);
                          }

                          setSelectedFilters(newSelectedFilters);
                          setCurrentPage(1);
                        }}
                        checked={selectedFilters.includes(category.id)}
                        className={styles.filterItemInput}
                      />
                      <label
                        htmlFor={category.id}
                        className={styles.filterItemLabel}
                      >
                        <span className={styles.filterItemLabelSpan}>
                          {category.title}
                        </span>
                      </label>
                      <span className={styles.filterItemCounter}>100</span>
                    </li>
                  );
                })}
            </ul>
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className={styles.showMoreFilters}
              type="button"
            >
              <span className={styles.arrow}>
                {isFiltersExpanded ? "↑" : "↓"}
              </span>

              <span className={styles.showMoreFiltersText}>
                Show {isFiltersExpanded ? "fewer" : "more"} filters
              </span>
            </button>
          </div>
        </div>
        <div
          className={classnames({
            [styles.main]: true,
            [styles.slide]: isFilterListVisible
          })}
          ref={profileContainerRef}
        >
          {selectedFilters.length > 0 && (
            <div className={styles.filterBanner}>
              <h2 className={styles.filterHeadline}>→ </h2>
              <div className={styles.filterPillContainer}>
                {selectedFilters.map(filterId => (
                  <FilterPill
                    title={categories.find(c => c.id === filterId).title}
                    key={filterId}
                    onCloseClick={() => {
                      const newSelectedFilters = [...selectedFilters];
                      const i = newSelectedFilters.indexOf(filterId);
                      newSelectedFilters.splice(i, 1);

                      setSelectedFilters(newSelectedFilters);
                      setCurrentPage(1);
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  setSelectedFilters([]);
                  setCurrentPage(1);
                }}
                className={styles.filterClear}
                type="button"
              >
                Clear
              </button>
            </div>
          )}
          {data && (
            <>
              <div
                className={classnames({
                  [styles.profiles]: true,
                  [styles.filterBannerBump]: selectedFilters.length > 0
                })}
              >
                {data.designers.map(designer => (
                  <Profile
                    image={designer.image}
                    name={designer.name}
                    description={designer.description}
                    location={designer.location}
                    hex={designer.color}
                    handle={designer.username}
                    key={designer.username}
                    displayUrl={designer.display_url}
                    expandedUrl={designer.expanded_url}
                  />
                ))}
              </div>
              <div className={styles.paginationContainer}>
                <button
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    profileContainerRef.current.scrollTo(0, 0);
                  }}
                  disabled={pagination.currentPage === pagination.startPage}
                  type="button"
                  className={styles.paginationArrow}
                >
                  ←
                </button>
                <button
                  className={styles.pageNumberButton}
                  onClick={() => {
                    setCurrentPage(1);
                    profileContainerRef.current.scrollTo(0, 0);
                  }}
                  type="button"
                  disabled={pagination.currentPage === 1}
                >
                  1
                </button>
                {currentPage >= numPagesToShowInPagination && <>&hellip;</>}
                {pagination.pages.map(pageNumber => {
                  // Skip over these page numbers because they'll always appear
                  // in the pagination.
                  if (
                    pageNumber === 1 ||
                    pageNumber === pagination.totalPages
                  ) {
                    return null;
                  }

                  return (
                    <button
                      key={pageNumber}
                      className={styles.pageNumberButton}
                      onClick={() => {
                        setCurrentPage(pageNumber);
                        profileContainerRef.current.scrollTo(0, 0);
                      }}
                      disabled={pagination.currentPage === pageNumber}
                      type="button"
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                {currentPage <=
                  pagination.totalPages - (numPagesToShowInPagination + 1) && (
                  <>&hellip;</>
                )}
                <button
                  className={styles.pageNumberButton}
                  onClick={() => {
                    setCurrentPage(pagination.totalPages);
                    profileContainerRef.current.scrollTo(0, 0);
                  }}
                  type="button"
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  {pagination.totalPages}
                </button>
                <button
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    profileContainerRef.current.scrollTo(0, 0);
                  }}
                  disabled={pagination.currentPage === pagination.endPage}
                  type="button"
                  className={styles.paginationArrow}
                >
                  →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;
