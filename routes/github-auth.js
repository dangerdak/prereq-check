const rp = require('request-promise-native');
require('env2')('config.json');

const isInTeam = teamsArray => teamsArray.some(team => team.name === process.env.AUTHORISED_TEAM_NAME && team.id === JSON.parse(process.env.AUTHORISED_TEAM_ID));

const getUserData = (token) => {
  const options = {
    uri: 'https://api.github.com/user',
    headers: {
      authorization: `token ${token}`,
      'User-Agent': 'prereqCheck',
    },
    json: true,
  };
  return rp(options);
};

const getUserTeams = (token) => {
  const options = {
    uri: 'https://api.github.com/user/teams',
    headers: {
      authorization: `token ${token}`,
      'User-Agent': 'prereqCheck',
    },
    json: true,
  };
  return rp(options);
};


const githubAuth = (req, res) => {
  if (req.query.code) {
    const options = {
      uri: 'https://github.com/login/oauth/access_token',
      qs: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: req.query.code,
      },
      headers: {
        Accept: 'application/json',
      },
      json: true,
    };
    rp(options)
      .then((oauthResponse) => {
        req.session.token = oauthResponse.access_token;
        return getUserData(req.session.token);
      })
      .catch((err) => {
        console.error('Couldn\'t log in with Github');
        // console.error(err);
      })
      .then((userData) => {
        req.session.user = userData.login;
        return getUserTeams(req.session.token);
      })
      .then((userTeams) => {
        req.session.isInTeam = isInTeam(userTeams);
        res.redirect('/links');
      })
      .catch((err) => {
        console.error('Error retrieving user team membership');
        // console.error(err);
      });
  } else {
    // login unsuccessful
    res.redirect('/');
  }
};

module.exports = {
  isInTeam,
  githubAuth,
};

