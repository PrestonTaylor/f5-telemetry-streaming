/*
 * Copyright 2018. F5 Networks, Inc. See End User License Agreement ("EULA") for
 * license terms. Notwithstanding anything to the contrary in the EULA, Licensee
 * may copy and modify this software product for its internal business purposes.
 * Further, Licensee may upload, publish and distribute the modified version of
 * the software product on devcentral.f5.com.
 */

'use strict';

const request = require('request');
const crypto = require('crypto');

function makeRequest(requestOptions) {
    return new Promise((resolve, reject) => {
        request.post(requestOptions, (error, response, body) => {
            if (error) {
                reject(error);
            } else if (response.statusCode === 200) {
                resolve();
            } else {
                reject(new Error(`response: ${response.statusCode} ${response.statusMessage} ${body}`));
            }
        });
    });
}

/**
 * See {@link ../README.md#context} for documentation
 */
module.exports = function (context) {
    const workspaceId = context.config.workspaceId;
    const sharedKey = context.config.passphrase.text;
    const logType = context.config.logType || 'F5Telemetry';
    const date = new Date().toUTCString();

    // for event types other than systemInfo, let's not chunk
    // so simply format according to what the chunking code expects
    if (context.event.type !== 'systemInfo') {
        const copyData = JSON.parse(JSON.stringify(context.event.data));
        context.event.data = {};
        context.event.data[context.event.type] = copyData;
    }

    const promises = [];
    const tracerMsg = [];
    const defaultHttpHeaders = {
        'content-type': 'application/json',
        'x-ms-date': date
    };
    Object.keys(context.event.data).forEach((type) => {
        let data = context.event.data[type];
        if (typeof data !== 'object') {
            data = { value: data }; // make data an object
        }
        const body = JSON.stringify(data);
        const contentLength = Buffer.byteLength(body, 'utf8');
        const stringToSign = `POST\n${contentLength}\napplication/json\nx-ms-date:${date}\n/api/logs`;
        const signature = crypto.createHmac('sha256', new Buffer(sharedKey, 'base64')).update(stringToSign, 'utf-8').digest('base64');
        const authorization = `SharedKey ${workspaceId}:${signature}`;

        const requestOptions = {
            url: `https://${workspaceId}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`,
            headers: Object.assign(defaultHttpHeaders, {
                'Log-Type': `${logType}_${type}`,
                Authorization: authorization
            }),
            body,
            strictSSL: !context.config.allowSelfSignedCert
        };

        if (context.tracer) {
            // deep copy and parse body, otherwise it will be stringified again
            const requestOptionsCopy = JSON.parse(JSON.stringify(requestOptions));
            requestOptionsCopy.body = JSON.parse(requestOptionsCopy.body);
            tracerMsg.push(requestOptionsCopy);
        }

        promises.push(makeRequest(requestOptions));
    });

    if (context.tracer) {
        context.tracer.write(JSON.stringify(tracerMsg, null, 4));
    }

    return Promise.all(promises)
        .then(() => {
            context.logger.debug('success');
        })
        .catch((error) => {
            context.logger.error(`error: ${error.message || error}`);
        });
};
