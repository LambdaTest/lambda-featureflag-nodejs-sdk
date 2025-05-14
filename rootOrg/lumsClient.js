const axios = require('axios');

class LumsClient {
    constructor(baseURL, timeout) {
        this.baseURL = baseURL;
        this.timeout = timeout;
        this.httpClient = axios.create({
            baseURL,
            timeout,
            validateStatus: function (status) {
                return status >= 200 && status < 300;
            }
        });
    }

    async getRootOrgs(apiKey) {
        try {
            if (!apiKey) {
                throw new Error('API key is required');
            }

            const response = await this.httpClient.get('/sdk/rootOrg', {
                headers: {
                    'Authorization': `Api-Key ${apiKey}`
                }
            });

            return response.data.data;
        } catch (error) {
            if (error.response) {
                throw new Error(`${error.response.data?.title || 'Error'}: ${error.response.data?.message || error.message}`);
            }
            throw new Error(`Failed to make request: ${error.message}`);
        }
    }
}

module.exports = LumsClient; 