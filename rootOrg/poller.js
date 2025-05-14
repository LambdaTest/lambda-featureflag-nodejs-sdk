class Poller {
    constructor() {
        this.shutdown = false;
    }

    poll(interval, callback) {
        const pollFunction = async () => {
            if (this.shutdown) {
                return;
            }
            try {
                await callback();
            } catch (error) {
                console.error('Error in poller callback:', error);
            }
            if (!this.shutdown) {
                setTimeout(pollFunction, interval);
            }
        };

        pollFunction();
    }

    stop() {
        this.shutdown = true;
    }
}

module.exports = Poller; 