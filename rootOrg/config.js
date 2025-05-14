class Config {
    constructor(serverUrl, flagConfigPollerInterval, flagConfigPollerRequestTimeout) {
        this.serverUrl = serverUrl;
        this.flagConfigPollerInterval = flagConfigPollerInterval;
        this.flagConfigPollerRequestTimeout = flagConfigPollerRequestTimeout;
    }
}

const DefaultConfig = new Config(
    'https://api.lambdatest.com',
    120 * 1000, // 120 seconds in milliseconds
    10 * 1000   // 10 seconds in milliseconds
);

module.exports = { Config, DefaultConfig }; 