import fetch from 'node-fetch';
import { graphqlLodash } from 'graphql-lodash';

export default async function(queryString, variables) {
  const { query, transform } = graphqlLodash(queryString);
  const response = await fetch(process.env.GITHUB_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${process.env.GITHUB_API_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (response.ok) {
    const body = await response.json();
    if (body.data) {
      return transform(body.data);
    } else {
      throw new Error(`GraphQL Error: ${JSON.stringify(body, null, 2)}`);
    }
  } else {
    return response.text().then((body) => {
      throw new Error(response.status + ' ' + response.statusText + '\n' + body);
    });
  }
}
