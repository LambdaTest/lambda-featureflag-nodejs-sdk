const { DefaultConfig } = require('./config');
const Poller = require('./poller');
const LumsClient = require('./lumsClient');

class Client {
    constructor(apiKey, config = DefaultConfig) {
        this.apiKey = apiKey;
        this.config = config;
        this.flags = new Map();
        this.poller = new Poller();
        this.lumsClient = new LumsClient(config.serverUrl, config.flagConfigPollerRequestTimeout);
    }

    async start() {
        if (this.poller) {
            this.poller.stop();
        }
        this.poller = new Poller();
        this.poller.poll(this.config.flagConfigPollerInterval, () => this.pollFlags());
        return this.pollFlags();
    }

    stop() {
        this.poller.stop();
    }

    async pollFlags() {
        try {
            const rootOrgs = await this.lumsClient.getRootOrgs(this.apiKey);
            this.flags = new Map(Object.entries(rootOrgs));
            return true;
        } catch (error) {
            console.error('Error polling flags:', error);
            return false;
        }
    }

    evaluate(orgId) {
        const org = this.flags.get(orgId);
        return [org, !!org];
    }
}

module.exports = Client; 