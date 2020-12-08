# website-scraper-onaction
Very simple plugin for [website-scraper](https://github.com/website-scraper/node-website-scraper),
which makes the actions easier to handle. You can run your custom handler for almost
all available action, ***no need to write your custom plugin***.


## Installation
```shell
npm install website-scraper git+https://github.com/sbreiler/website-scraper-onaction.git
```

## Available actions
At the moment, these actions are supported:
* [beforeStart](https://github.com/website-scraper/node-website-scraper/#beforestart)
* [afterFinish](https://github.com/website-scraper/node-website-scraper/#afterfinish)
* [error](https://github.com/website-scraper/node-website-scraper/#error)
* [beforeRequest](https://github.com/website-scraper/node-website-scraper/#beforerequest)
* [afterResponse](https://github.com/website-scraper/node-website-scraper/#afterresponse)
* [onResourceSaved](https://github.com/website-scraper/node-website-scraper/#onresourcesaved)
* [onResourceError](https://github.com/website-scraper/node-website-scraper/#onresourceerror)

**Caution:** the names are case sensitive!

All original arguments get passed to your custom action handler function, please refer
to the documentation of [website-scraper](https://github.com/website-scraper/node-website-scraper) for
further information about the arguments.

You can provide one handler for each action. If you want to have more than one handler for an action,
you could initiat more than one instance of this plugin.  

**Not** supported actions are:
* generateFilename
* getReference
* saveResource

## Basic usage
```javascript
new OnActionPlugin({
    action1: function handler1(arguments) {
        // your custom code
    },
    action2: function handler2(arguments) {
        // your custom code
    }
    // ...
});
```

## Example
```javascript
const scrape = require('website-scraper');
const OnActionPlugin = require('website-scraper-onaction');
const _ = require('lodash');

const allFiles = [];
const errorUrls = [];

scrape({
    urls: ['https://www.instagram.com/gopro/'],
    directory: '/path/to/save',
    plugins: [
        new OnActionPlugin({
            onResourceSaved: ({resource}) => {
                // log every filename
                allFiles.push(resource.getFilename());
            },
            afterResponse: ({response}) => {
                if( response.statusCode !== 200 ) {
                    // log urls with non 200 status code
                    errorUrls.push(
                        {
                            statusCode: response.statusCode,
                            href: response.request.href
                        }
                    );
                }
                else {
                    // remove csrf.token from html content
                    const contentType = _.get(response, 'headers.content-type');
                    const isHtml = contentType && contentType.split(';')[0] === 'text/html';

                    if(
                        isHtml && _.isString(response.body)
                    ) {
                        return response.body.replace(/"csrf\.token":"[^"]*",?/gm, '');
                    }
                }

                return response.body;
            }
        })
    ]
});
```