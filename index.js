require('dotenv').load();
const express = require('express');
const { exec } = require('child_process');

const callThingsURL = (data) => {
    return new Promise((resolve, reject) => {
        // setup express server that handlers callback
        let server;
        const timeout = setTimeout(() => {
            server.close();
            reject('timeout');
        }, 5000);
        const app = express();
        const createRoute = (route, handler) => {
            app.get(route, (req, res) => {
                res.send('handled');
                server.close();
                clearTimeout(timeout);
                handler(req);
            });
        };
        const successRoute = '/success';
        const errorRoute = '/error';
        createRoute(successRoute, (req) => resolve(JSON.parse(req.query['x-things-ids'])));
        createRoute(errorRoute, (req) => reject(req));
        const port = process.env.SERVER_PORT || 4567;
        const callbackUrl = `${process.env.CALLBACK_URL_SCHEME}://` || `http://localhost:${port}`;
        server = app.listen(port, () => {
            // construct things json URL
            const query = Object.entries({
                'auth-token': process.env.AUTH_TOKEN,
                reveal: false,
                'x-success': encodeURI(`${callbackUrl}${successRoute}`),
                'x-error': encodeURI(`${callbackUrl}${errorRoute}`),
                'x-cancel': encodeURI(`${callbackUrl}${errorRoute}`),
                data: encodeURIComponent(JSON.stringify(data)),
            });
            const queryString = query.map((entry) => entry.join('=')).join('&');
            const url = `things://x-callback-url/json?${queryString}`;
            // call URL
            exec(`open -g '${url}'`);
        });
    });
};

(async () => {
    try {
        // const res = await callThingsURL([
        //     {
        //         operation: 'update',
        //         type: 'project',
        //         id: 'E97BB6A0-677E-43D8-9A83-2582A3DACE8D',
        //         attributes: {
        //             title: 'Test3 Synced Project',
        //             area: 'Cinuru',
        //             items: [
        //                 {
        //                     type: 'heading',
        //                     attributes: {
        //                         title: 'Second Heading',
        //                     },
        //                 },
        //                 {
        //                     type: 'to-do',
        //                     attributes: {
        //                         title: 'Test ToDo',
        //                         heading: 'Second Heading',
        //                     },
        //                 },
        //             ],
        //         },
        //     },
        // ]);
        const res = await callThingsURL([
            {
                operation: 'create',
                type: 'to-do',
                attributes: {
                    title: 'Test ToDo',
                    heading: 'Second Heading',
                    'list-id': 'E97BB6A0-677E-43D8-9A83-2582A3DACE8D',
                },
            },
        ]);
        console.log('executed, got', res);
        return;
    } catch (e) {
        throw e;
    }
})();
