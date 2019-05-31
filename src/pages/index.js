import React from "react";
import _ from "lodash";
import categories from "../categories";
import Profile from "../components/profile";
import Layout from "../components/layout";
import FilterPill from "../components/filterPill";
import FilterItem from "../components/filterItem";
import Nav from "../components/nav";
import Loader from "../components/loader";
import styles from "./index.module.scss";
import { graphql } from "gatsby";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.designerArray = props.data.allTwitterProfile.edges;
    this.toggleFilterList = this.toggleFilterList.bind(this);
    let tagCount = {};
    categories.forEach(function(category) {
      tagCount[category.id] = 0;
    });
    this.designerArray.forEach(function(profile) {
      _.forOwn(profile.node.profile.tags, function(value, key) {
        if (value === true) {
          tagCount[key] = tagCount[key] + 1;
        }
      });
    });
    this.state = {
      designers: this.designerArray,
      filtersArray: [],
      tagCount: tagCount,
      filterListVisible: false,
      secondaryFiltersVisible: false,
      isLoading: true
    };
    this.onFilterClick = this.onFilterClick.bind(this);
    this.addFilter = this.addFilter.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
    this.filterDesigners = this.filterDesigners.bind(this);
    this.toggleHiddenFilters = this.toggleHiddenFilters.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleFilterListClick, false);
    setTimeout(() => {
      this.setState((prevState, props) => {
        return {
          designers: _.shuffle(prevState.designers),
          isLoading: false
        };
      });
    }, 200);
  }

  componentWillUnmount() {
    document.removeEventListener(
      "mousedown",
      this.handleFilterListClick,
      false
    );
  }

  hasOneSelectedFilter() {
    let hasOneSelectedFilter = false;
    if (this.state.filtersArray.length > 0) {
      hasOneSelectedFilter = true;
    }
    return hasOneSelectedFilter;
  }

  toggleFilterList() {
    const newValue = this.state.filterListVisible;
    this.setState({
      filterListVisible: !newValue
    });
  }

  filterDesigners(filtersArray) {}

  addFilter(categoryId) {
    const filtersArray = this.state.filtersArray;
    filtersArray.push(categoryId);
    this.setState({
      filtersArray: filtersArray
    });
    this.filterDesigners(filtersArray);
  }

  removeFilter(categoryId) {
    const filtersArray = this.state.filtersArray;
    const index = filtersArray.indexOf(categoryId);
    if (index !== -1) {
      filtersArray.splice(index, 1);
    }
    this.setState({
      filtersArray: filtersArray
    });
    this.filterDesigners(filtersArray);
  }

  toggleHiddenFilters() {
    this.setState(prevState => ({
      secondaryFiltersVisible: !prevState.secondaryFiltersVisible
    }));
  }

  clearFilters() {
    this.setState({
      filtersArray: []
    });
  }

  onFilterClick(event) {
    const categoryId = event.target.value;
    const isChecked = event.target.checked;

    if (isChecked) {
      this.addFilter(categoryId);
    } else {
      this.removeFilter(categoryId);
    }
  }

  handleFilterListClick = e => {
    if (!this.state.filterListVisible) {
      return;
    }
    if (this.filterContainer.contains(e.target)) {
      return;
    }
    if (this.filterButtonRef.contains(e.target)) {
      return;
    }
    this.toggleFilterList();
  };

  render() {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.sidebar}>
            <Nav
              filter={true}
              theme="dark"
              toggleFilterList={this.toggleFilterList}
              isLoading={this.state.isLoading}
              filterButtonRef={filterButtonRef =>
                (this.filterButtonRef = filterButtonRef)
              }
            />
            {!this.state.isLoading && (
              <div
                ref={filterContainer =>
                  (this.filterContainer = filterContainer)
                }
                className={`${styles.filterContainer} ${this.state
                  .filterListVisible && styles.filterListVisible}`}
              >
                <h2 className={styles.filterHeadline}>Filter by</h2>
                <ul className={styles.filterUl}>
                  {categories.map((category, index) => {
                    if (
                      this.state.secondaryFiltersVisible ||
                      category.primaryFilter
                    ) {
                      return (
                        <FilterItem
                          id={category.id}
                          title={category.title}
                          value={category.id}
                          htmlFor={category.id}
                          key={index}
                          onFilterClick={this.onFilterClick}
                          counter={this.state.tagCount[category.id]}
                          isChecked={this.state.filtersArray.includes(
                            category.id
                          )}
                        />
                      );
                    }
                  })}
                </ul>
                <button
                  onClick={this.toggleHiddenFilters.bind(this)}
                  className={styles.showMoreFilters}
                >
                  {this.state.secondaryFiltersVisible ? (
                    <>
                      <span className={styles.arrow}>↑</span>
                      <span className={styles.showMoreFiltersText}>
                        Show fewer filters
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={styles.arrow}>↓</span>
                      <span className={styles.showMoreFiltersText}>
                        Show more filters
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          {this.state.isLoading && <Loader />}
          {!this.state.isLoading && (
            <div
              className={`${styles.main} ${this.state.filterListVisible &&
                styles.slide}`}
            >
              {this.hasOneSelectedFilter() && (
                <div className={styles.filterBanner}>
                  <h2 className={styles.filterHeadline}>→ </h2>
                  <div className={styles.filterPillContainer}>
                    {_.map(this.state.filtersArray, value => {
                      // find category object
                      const category = _.find(categories, function(cat) {
                        return cat.id === value;
                      });
                      return (
                        <FilterPill
                          title={category.title}
                          key={category.title}
                          onCloseClick={() => {
                            this.removeFilter(category.id);
                          }}
                        />
                      );
                    })}
                  </div>
                  {this.state.filtersArray.length > 0 && (
                    <button
                      onClick={this.clearFilters.bind(this)}
                      className={styles.filterClear}
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              <div
                className={`${styles.profiles} ${this.state.filtersArray
                  .length > 0 && styles.filterBannerBump}`}
              >
                {/* filter through the designers using lodash */}
                {!this.state.isLoading &&
                  _.filter(this.state.designers, currentDesigner => {
                    // if no filters are checked, return all designers

                    if (this.state.filtersArray.length === 0) {
                      return true;
                    }

                    // variable to see if designer contains at least one of the active filters
                    let containsActiveFilter = false;

                    // loop through all the checked filters
                    this.state.filtersArray.forEach(filter => {
                      // if the designer's object tag contains one of the filters, set the containsActiveFilter variable to true
                      if (currentDesigner.node.profile.tags[filter] === true) {
                        containsActiveFilter = true;
                      }
                    });

                    // if containsActiveFilter is true, then the designer should be included
                    return containsActiveFilter;
                  }).map((profile, index) => (
                    <Profile
                      image={profile.node.profile.profile_image_url_https}
                      sizes={
                        profile.node.localFile &&
                        profile.node.localFile.childImageSharp &&
                        profile.node.localFile.childImageSharp.sizes
                      }
                      name={profile.node.profile.name}
                      description={profile.node.profile.description}
                      location={profile.node.profile.location || "N/A"}
                      hex={`#${profile.node.profile.profile_link_color}`}
                      handle={profile.node.profile.screen_name}
                      key={profile.node.profile.id_str}
                      contrast={profile.node.profile.contrast}
                      displayUrl={
                        profile.node.profile.entities.url
                          ? profile.node.profile.entities.url.urls[0]
                              .display_url
                          : ""
                      }
                      expandedUrl={
                        profile.node.profile.entities.url
                          ? profile.node.profile.entities.url.urls[0]
                              .expanded_url
                          : ""
                      }
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }
}

export default App;

export const pageQuery = graphql`
  query Index {
    allTwitterProfile {
      edges {
        node {
          id
          localFile {
            childImageSharp {
              sizes(grayscale: true, maxWidth: 200) {
                sizes
                aspectRatio
                src
                srcSet
                srcWebp
                srcSetWebp
              }
            }
          }
          profile {
            id_str
            description
            name
            screen_name
            location
            profile_image_url_https
            profile_link_color
            tags {
              graphic
              product
              manager
              lead
              letter
              creative
              head
              illustrator
              ux
              founder
              director
              research
              author
              ceo
              freelance
              speaker
              engineer
              content
              developer
              art
              web
              writer
              systems
              vp
            }
            entities {
              url {
                urls {
                  expanded_url
                  display_url
                }
              }
            }
          }
        }
      }
    }
  }
`;
