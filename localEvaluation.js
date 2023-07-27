const Experiment = require('@amplitude/experiment-node-server');
const _ = require('lodash');

var experiment;
var debug = process.env.LOCAL_EVALUATION_CONFIG_DEBUG || false;
var serverUrl = process.env.LOCAL_EVALUATION_CONFIG_SERVER_URL || "https://api.lab.amplitude.com";
var flagConfigPollingIntervalMillis = process.env.LOCAL_EVALUATION_CONFIG_POLL_INTERVAL || 10;
var deploymentKey = process.env.LOCAL_EVALUATION_DEPLOYMENT_KEY || "";

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
    if (user && user.org_status && typeof user.org_status === "string") {
        userProperties.org_status = user.org_status;
    }
    if (user && user.subscription_type && typeof user.subscription_type === "string") {
        userProperties.subscription_type = user.subscription_type;
    }
    if (user && user.subscription_status && typeof user.subscription_status === "string") {
        userProperties.subscription_status = user.subscription_status;
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
    } catch (e) {
        throw new Error(`unable to create local evaluation client with error ${e.message}`)
    }
}

async function fetch(flagName, user) {
    try {
        const userProp = validateuser(user);
        const expUser = {user_properties: userProp};
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

module.exports = {GetFeatureFlagPayload, GetFeatureFlagBool, GetFeatureFlagString, Initialize}
