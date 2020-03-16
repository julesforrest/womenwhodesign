# Women Who Design

Women Who Design is a [Gatsby](https://www.gatsbyjs.org)-powered Twitter directory of accomplished women in the design industry. It aims to help people find notable and relevant voices to follow on Twitter by parsing Twitter bios for popular keywords.

Here are some things Women Who Design can help you with:

- **If you're a Twitter user, use this project to diversify the voices in your feed.** Run [proporti.onl](https://www.proporti.onl/) to check the ratio of the people you follow on Twitter. If you're following more men than women, follow women who work in your areas of interest. Be aware that a feed of white women is not diverse.
- **If you're a hiring manager, use this project to find candidates.** Examine the ratio of senior men to senior women in your organization. Are women of color equally represented? Consider hiring women into promotions above their current role.
- **If you're organizing a conference, use this project to find speakers.** Ensure that the women's speaking slots are as prominent as the men's. Are women of color equally represented? Consider reaching out to women who have never given a talk before.
- **If you have a podcast, use this project to find new guests.** Be mindful of interruptions and ensure that your women guests get equal speaking time. Are women of color equally represented? Consider inviting women who don't already have an audience.

## Forking this project

Women Who Design is happy to support new directories highlighting underrepresented or marginalized groups by providing its source code. These instructions will get you a copy of the project up and running on your local machine to get started.

### Prerequisites

This project requires API keys from [Twitter](https://twitter.com) to populate the profile data and [Seeker](https://seeker.company) to populate the job posts.

#### Seeker

Seeker is optional. To run this project without Seeker:

1. Clone the repo and open it in your code editor
2. Remove the `gatsby-source-seeker` plugin by deleting lines 12-17 from the `gatsby-config.js` file
3. Delete the entire `gatsby-node.js` file
4. Delete the entire `src/pages/jobs.js` file
5. At some point, remove the link to the jobs page from the `src/components/nav` file

#### Twitter

Twitter is required.

Start by creating an app on the [Twitter developer dashboard](https://developer.twitter.com/en/apps). Select the "Read only" access option.

If you haven't already, clone the repo and open it in your code editor.

On lines 6 and 7 of the `gatsby-config.js` file, replace `process.env.WWD_TWITTER_CONSUMER_KEY` with the consumer key from the "Keys and tokens" page of your app's developer dashboard.

Generate a bearer token by running this command in your terminal, replacing the variables with your consumer key and secret information.

```
curl -u "$CONSUMER_KEY:$CONSUMER_SECRET" \
    --data 'grant_type=client_credentials' \
    'https://api.twitter.com/oauth2/token'
```

Copy the bearer token and on line 8, replace `process.env.WWD_TWITTER_BEARER_TOKEN` with it.

### Generating directory profiles

The directory's profiles are generated from the list of users that the Women Who Design Twitter account follows.

To provide your own user list, replace the number on line 9 of the `gatsby-config.js` file with the Twitter ID of your chosen Twitter account. To get the Twitter ID of your account, provide your handle to a service like [Tweeter ID](https://tweeterid.com/).

Make sure that the account provided is following at least one account and that Twitter ID on line 9 is in quotes.

### Install dependencies

If you're new to development, start by installing [Homebrew](https://brew.sh/), a macOS package manager. Paste the following command in your terminal.

```
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

When Homebrew installed, use it to install [Yarn](https://yarnpkg.com/en/), a JS dependency manager.

```
brew install yarn
```

After Yarn is installed, use it to install the dependencies.

```
yarn
```

### Run the project locally

Making sure you're in the correct project folder, start the local development server.

```
yarn start
```

In your browser, open `localhost:8000`.
