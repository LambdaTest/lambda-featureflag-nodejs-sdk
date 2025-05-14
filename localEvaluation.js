const Experiment = require('@amplitude/experiment-node-server');
const _ = require('lodash');
const { Client, Config } = require('./rootOrg');

var experiment;
let rootOrgClient = null;

var debug = process.env.LOCAL_EVALUATION_CONFIG_DEBUG || false;
var serverUrl = process.env.LOCAL_EVALUATION_CONFIG_SERVER_URL || "http://api.lambdatest.com";
var flagConfigPollingIntervalMillis = process.env.LOCAL_EVALUATION_CONFIG_POLL_INTERVAL || 120;
var apiRequestTimeout = process.env.LOCAL_EVALUATION_API_REQUEST_TIMEOUT || 10;
var deploymentKey = process.env.LOCAL_EVALUATION_DEPLOYMENT_KEY || "server-jAqqJaX3l8PgNiJpcv9j20ywPzANQQFh";


async function initializeRootOrg(retries = 3) {
    
    rootOrgClient = new Client(deploymentKey, new Config(
        serverUrl,
        flagConfigPollingIntervalMillis * 1000,
        apiRequestTimeout * 1000
    ));

    let error = null;
    for (let i = 0; i < retries; i++) {
        try {
            await rootOrgClient.start();
            error = null;
            break;
        } catch (err) {
            error = new Error(`Unable to get root orgs with given config ${JSON.stringify(rootOrgClient.config)} attempt:${i + 1} with error ${err.message}`);
            continue;
        }
    }

    if (error) {
        throw new Error(`Unable to get root orgs with given config ${JSON.stringify(rootOrgClient.config)} with error ${error.message}`);
    }

    return true;
}

function validateuser(user) {
    let userProperties = {};
    if (user && user.org_id && typeof user.org_id === "string") {
        userProperties.org_id = user.org_id;
    }
    if (user && user.org_name && typeof user.org_name === "string") {
        userProperties.org_name = user.org_name;
    }
    if (user && user.username && typeof user.username === "string") {
        userProperties.username = user.username;
    }
    if (user && user.email && typeof user.email === "string") {
        userProperties.email = user.email;
    }
    if (user && user.plan && typeof user.plan === "string") {
        userProperties.plan = user.plan;
    }
    if (user && user.hub_region && typeof user.hub_region === "string") {
        userProperties.hub_region = user.hub_region;
    }
    if (user && user.infra_provider && typeof user.infra_provider === "string") {
        userProperties.infra_provider = user.infra_provider;
    }
    if (user && user.subscription_type && typeof user.subscription_type === "string") {
        userProperties.subscription_type = user.subscription_type;
    }
    if (user && user.template_id && typeof user.template_id === "string") {
        userProperties.template_id = user.template_id;
    }
    if (user && user.user_status && typeof user.user_status === "string") {
        userProperties.user_status = user.user_status;
    }
    return userProperties;
}

async function Initialize() {
    try {
        let config = {};
        config.debug = debug;
        config.serverUrl = serverUrl;
        config.flagConfigPollingIntervalMillis = flagConfigPollingIntervalMillis * 1000;
        experiment = Experiment.Experiment.initializeLocal(deploymentKey, config);
        await experiment.start();
        await initializeRootOrg();
    } catch (e) {
        throw new Error(`unable to create local evaluation client with error ${e.message}`)
    }
}

async function fetch(flagName, user) {
    try {
        const userProp = validateuser(user);
        const expUser = {user_properties: userProp};
        if (userProp?.org_id) {
            const [org, exists] = rootOrgClient.evaluate(userProp.org_id);
            if (exists && org) {
                expUser.user_properties.org_id=org;
            }
        }
        return await experiment.evaluate(expUser, [flagName]);
    } catch (e) {
        return new Error(`error in evaluating flag: ${flagName} error: ${e}`)
    }
}

async function GetFeatureFlagString(flagName, user) {
    const data = await fetch(flagName, user);
    if (data.error || !data[flagName]) {
        return "";
    }
    return data[flagName].value.toLowerCase();
}

async function GetFeatureFlagBool(flagName, user) {
    const data = await fetch(flagName, user);
    if (data.error || !data[flagName]) {
        return false;
    }
    return data[flagName].value.toLowerCase() === 'true';
}

async function GetFeatureFlagPayload(flagName, user) {
    const data = await fetch(flagName, user);
    if (data.error || !data[flagName]) {
        return {};
    }
    return data[flagName];
}

module.exports = {
    initializeRootOrg,
    getRootOrgClient: () => rootOrgClient,
    GetFeatureFlagPayload,
    GetFeatureFlagBool,
    GetFeatureFlagString,
    Initialize
};
