require('dotenv').config({ path: '.env.local', debug: true });
const fs = require('fs');
const path = require('path');

// Configuration
const GITHUB_USERNAME = process.env.GH_USERNAME?.trim();
const GITHUB_TOKEN = process.env.GH_TOKEN;
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'starred-repositories.json');
const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

// GraphQL Query
const createQuery = (cursor = null) => {
	return JSON.stringify({
		query: `
      query ($username: String!, $cursor: String) {
        user(login: $username) {
          starredRepositories(first: 100, after: $cursor, orderBy: {field: STARRED_AT, direction: DESC}) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              name
              description
              url
              stargazerCount
              forkCount
              pushedAt
              owner {
                login
                avatarUrl
              }
              primaryLanguage {
                name
                color
              }
              repositoryTopics(first: 10) {
                nodes {
                  topic {
                    name
                  }
                }
              }
            }
          }
        }
      }
    `,
		variables: {
			username: GITHUB_USERNAME,
			cursor: cursor,
		},
	});
};

// Helper function for delayed execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Main function to fetch all starred repositories
const fetchAllStarredRepos = async () => {
	if (!GITHUB_USERNAME || GITHUB_USERNAME.length === 0 || !GITHUB_TOKEN) {
		console.error('Error: GH_USERNAME (must be non-empty) and GH_TOKEN environment variables are required.');
		process.exit(1);
	}

	let allRepos = [];
	let hasNextPage = true;
	let cursor = null;
	let pageCount = 1;

	console.log('Starting to fetch starred repositories...');

	while (hasNextPage) {
		try {
			console.log(`Fetching page ${pageCount}...`);
			const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `bearer ${GITHUB_TOKEN}`,
				},
				body: createQuery(cursor),
			});

			const data = await response.json();

			if (data.errors) {
				console.error('GraphQL Errors:', data.errors);
				throw new Error('GraphQL query failed.');
			}

			if (!data.data || !data.data.user) {
				console.error('Error: Could not find user data in GraphQL response.');
				console.log('Response:', JSON.stringify(data, null, 2));
				throw new Error('Invalid GraphQL response format.');
			}

			const { starredRepositories } = data.data.user;
			const repos = starredRepositories.nodes.map((repo) => ({
				...repo,
				repositoryTopics: repo.repositoryTopics.nodes.map((node) => node.topic.name),
			}));

			allRepos = allRepos.concat(repos);

			hasNextPage = starredRepositories.pageInfo.hasNextPage;
			cursor = starredRepositories.pageInfo.endCursor;
			pageCount++;

			if (hasNextPage) {
				console.log('Waiting 2 seconds before next fetch...');
				await sleep(2000); // 2-second delay
			}
		} catch (error) {
			console.error(`An error occurred: ${error.message}`);
			process.exit(1);
		}
	}

	console.log(`Successfully fetched ${allRepos.length} repositories.`);

	// Ensure the output directory exists
	const outputDir = path.dirname(OUTPUT_PATH);
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	const payload = {
		generatedAt: new Date().toISOString(),
		repositories: allRepos,
	};

	// Persist repositories together with metadata timestamp for cache display
	fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2));
	console.log(`Data successfully written to ${OUTPUT_PATH}`);
};

// Run the script
fetchAllStarredRepos();
