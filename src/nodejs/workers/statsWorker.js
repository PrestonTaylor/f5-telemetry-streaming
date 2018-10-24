/*
 * Copyright 2018. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

const logger = require('../logger.js');
const util = require('../util.js');
const systemStats = require('../systemStatsHandler.js');

class RestWorker {
    constructor() {
        this.WORKER_URI_PATH = 'shared/telemetry/stats';
        this.isPassThrough = true;
        this.isPublic = true;
    }

    /**
     * Called by LX framework when plugin is initialized.
     *
     * @public
     * @param {function} success - callback to indicate successful startup
     * @param {function} failure - callback to indicate startup failure
     *
     * @returns {undefined}
     */
    // eslint-disable-next-line no-unused-vars
    onStart(success, failure) {
        logger.info('onStart');
        success();
    }

    /**
     * Recognize readiness to handle requests.
     * The iControl LX framework calls this method when
     * onStart() work is complete.
     *
     * @public
     * @param {function} success - callback to indicate successful startup
     * @param {function} failure - callback to indicate startup failure
     * @param {object} [state=undefined] - NOT USED: previously-persisted state
     * @param {string} [errMsg=null] - framework's error message if onStart() failed
     *
     * @returns {undefined}
     */
    // eslint-disable-next-line no-unused-vars
    onStartCompleted(success, failure, loadedState, errMsg) {
        logger.info('onStartCompleted');
        success();
    }

    /**
     * Handles Get requests
     * @param {object} restOperation
     *
     * @returns {void}
     */
    onGet(restOperation) {
        const urlpath = restOperation.getUri().href;
        logger.info(`GET operation ${urlpath}`);
        systemStats.collect()
            .then((res) => {
                util.restOperationResponder(restOperation, 200, res);
            })
            .catch((e) => {
                const res = `systemStats.collect error: ${e}`;
                util.restOperationResponder(restOperation, 500, res);
            });
    }

    /**
     * Handles Post requests.
     * @param {object} restOperation
     *
     * @returns {void}
     */
    onPost(restOperation) {
        const urlpath = restOperation.getUri().href;
        const body = restOperation.getBody(); // eslint-disable-line no-unused-vars
        logger.info(`POST operation ${urlpath}`);

        util.restOperationResponder(restOperation, 200, {});
    }

    /**
     * Handles Delete requests.
     * @param {object} restOperation
     *
     * @returns {void}
     */
    onDelete(restOperation) {
        const urlpath = restOperation.getUri().href;
        logger.info(`DELETE operation ${urlpath}`);

        util.restOperationResponder(restOperation, 200, {});
    }
}

module.exports = RestWorker;
