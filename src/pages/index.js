import React, { useState, useEffect, useRef } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import { navigate } from "@reach/router";
import { castArray } from "lodash";
import classnames from "classnames";
import qs from "query-string";
import useSWR from "swr";
import categories from "../categories";
import Profile from "../components/profile";
import Layout from "../components/layout";
import FilterPill from "../components/filterPill";
import Nav from "../components/nav";
import paginate from "../paginate";
import styles from "./index.module.scss";

const fetcher = async url => {
  const r = await fetch(url);
  return r.json();
};

const App = d => {
  const params = qs.parse(d.location.search);

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isFilterListVisible, setIsFilterListVisible] = useState(false);

  const selectedFilters = params.tags ? castArray(params.tags) : [];
  const currentPage = parseInt(params.page, 10) || 1;

  const [pagination, setPagination] = useState(null);

  const profileContainerRef = useRef();

  const numDesignersPerPage = 52;
  const numPagesToShowInPagination = 5;

  const hash = useRef(params.hash || Math.round(Math.random() * 1000000));

  const { data: apiData } = useSWR(
    // eslint-disable-next-line prefer-template
    "https://womenwhodesign-e87dc.firebaseapp.com/api?" +
      qs.stringify({
        hash: hash.current,
        limit: numDesignersPerPage,
        offset: numDesignersPerPage * (currentPage - 1),
        tags: selectedFilters && selectedFilters.sort()
      }),
    fetcher
  );

  const { data: metaData } = useSWR(
    "https://womenwhodesign-e87dc.firebaseapp.com/meta",
    fetcher
  );

  useEffect(() => {
    if (apiData) {
      setPagination(
        paginate(
          apiData.info.numFilteredDesigners,
          currentPage,
          numDesignersPerPage,
          numPagesToShowInPagination
        )
      );
    }
  }, [apiData, currentPage]);

  useEffect(() => {
    profileContainerRef.current.scrollTo(0, 0);
  }, [currentPage]);

  const getUrl = ({ page = params.page, tags = params.tags }) => {
    return `/?${qs.stringify({
      page,
      tags,
      hash: hash.current
    })}`;
  };

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
            isLoading={!apiData}
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

                          navigate(
                            getUrl({ page: 1, tags: newSelectedFilters })
                          );
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
                      <span className={styles.filterItemCounter}>
                        {metaData && metaData.numDesignersPerTag[category.id]}
                      </span>
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

                      navigate(getUrl({ page: 1, tags: newSelectedFilters }));
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  navigate(getUrl({ page: 1, tags: [] }));
                }}
                className={styles.filterClear}
                type="button"
              >
                Clear
              </button>
            </div>
          )}
          {apiData && (
            <>
              <div
                className={classnames({
                  [styles.profiles]: true,
                  [styles.filterBannerBump]: selectedFilters.length > 0
                })}
              >
                {apiData.designers.map(designer => (
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
              {pagination && (
                <div className={styles.paginationContainer}>
                  <a
                    onClick={e => {
                      e.preventDefault();
                      navigate(getUrl({ page: currentPage - 1 }));
                    }}
                    className={styles.paginationArrow}
                    href={
                      pagination.currentPage === pagination.startPage
                        ? undefined
                        : getUrl({ page: currentPage - 1 })
                    }
                  >
                    ←
                  </a>
                  <a
                    className={styles.pageNumberButton}
                    onClick={e => {
                      e.preventDefault();
                      navigate(getUrl({ page: 1 }));
                    }}
                    href={
                      pagination.currentPage === 1
                        ? undefined
                        : getUrl({ page: 1 })
                    }
                  >
                    1
                  </a>
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
                      <a
                        key={pageNumber}
                        className={styles.pageNumberButton}
                        onClick={e => {
                          e.preventDefault();
                          navigate(getUrl({ page: pageNumber }));
                        }}
                        href={
                          pagination.currentPage === pageNumber
                            ? undefined
                            : getUrl({ page: pageNumber })
                        }
                      >
                        {pageNumber}
                      </a>
                    );
                  })}

                  {currentPage <=
                    pagination.totalPages -
                      (numPagesToShowInPagination + 1) && <>&hellip;</>}

                  <a
                    className={styles.pageNumberButton}
                    onClick={e => {
                      e.preventDefault();
                      navigate(getUrl({ page: pagination.totalPages }));
                    }}
                    href={
                      pagination.currentPage === pagination.totalPages
                        ? undefined
                        : getUrl({ page: pagination.totalPages })
                    }
                  >
                    {pagination.totalPages}
                  </a>
                  <a
                    onClick={e => {
                      e.preventDefault();
                      navigate(getUrl({ page: pagination.currentPage + 1 }));
                    }}
                    className={styles.paginationArrow}
                    href={
                      pagination.currentPage === pagination.endPage
                        ? undefined
                        : getUrl({ page: pagination.currentPage + 1 })
                    }
                  >
                    →
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;
