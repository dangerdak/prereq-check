const rp = require('request-promise-native');
const normalizeUrl = require('normalize-url');

const getGithubPage = (url) => {
  const options = {
    uri: url ? normalizeUrl(url) : '',
    resolveWithFullResponse: true,
  };

  return rp(options)
    .then((response) => {
      const githubObj = {};
      githubObj.success = true;
      githubObj.url = options.uri;
      return githubObj;
    })
    .catch((err) => {
      console.error('Fetching GitHub page failed');
      // console.error(err);
      const githubObj = {};
      githubObj.success = false;
      githubObj.statusCode = err.statusCode;
      if (err.statusCode === 404) {
        githubObj.message = 'Page not found';
      } else if (!err.url) {
        githubObj.message = 'No page entered';
      } else {
        githubObj.message = 'Error retrieving page';
      }
      return githubObj;
    });
};

module.exports = { getGithubPage };
