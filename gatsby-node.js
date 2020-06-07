const path = require(`path`);
const _ = require("lodash");

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `Seeker`) {
    const slug = `/jobs/${node.job.id.slice(0, 5)}-${_.kebabCase(
      node.job.company.name
    )}-${_.kebabCase(node.job.job_title)}`;

    createNodeField({
      node,
      name: `slug`,
      value: slug
    });
  }
};

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  return new Promise(resolve => {
    graphql(`
      {
        allSeeker {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
      }
    `).then(result => {
      if (result.data) {
        result.data.allSeeker.edges.forEach(({ node }) => {
          createPage({
            path: node.fields.slug,
            component: path.resolve(`./src/templates/job-post.js`),
            context: {
              // Data passed to context is available
              // in page queries as GraphQL variables.
              slug: node.fields.slug
            }
          });
        });
      }
      resolve();
    });
  });
};
