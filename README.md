# Penguin changing rooms

As you may have noticed, CP inventory is really slow. This is our attempt on creating inventory that is fast and easy to use.

## Features

- Add and remove items on penguin
- Search items (by name, category or [tags](data/item_tags.json))
- Make the composed outfit available as image to download (requires PHP)

## Installation

1. Choose a media server.

    It will need to provide at least `play/en/web_service/game_configs/paper_items.json` file, and `game/items/images/paper/icon/120/` and `game/items/images/paper/image/600/` directories that contain files named <code>**id**.png</code> for each item ID. Combining https://icer.ink/media1.clubpenguin.com/ and https://icer.ink/media8.clubpenguin.com/ should cover that (though some item images are missing).

    Note that when the media server is on different domain from the application, browser’s [CORS policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) might prevent it from accessing canvas data, which is required for taking clothes off. You may need change the CORS HTTP headers sent by the media server. Or, if that is not possible, proxy the requests. Sample caching proxy is included in the `mediacache/` directory.

    By default, the proxy in `mediacache/` is used (configurable using `MEDIA_SERVER_URI` environment variable during build) and it proxies original Club Penguin media servers (configurable at the top of `mediacache/get.php`). The proxy will download item images as they are requested and store them for future use. You can also populate the cache manually by putting the `game/` and `play/` directories from media server dump into the `mediacache/` directory.

    If you want to use the proxy, you need to make the `mediacache/` directory writeable.

2. Install dependencies using `npm install`.

3. Build the client using `npm run-script build`.

4. Set you web server’s document root to `dist/` directory (`.htaccess` should do that automatically). Also configure it to point URLs starting with `data/` to the `data/` directory.

5. If you want to offer the composed outfits, you will need to have the items’ paper images available locally. If you use the mediacache proxy, this is handled automatically and they will be downloaded on-demand from the media servers you configured in `mediacache/get.php`.

    If you want to use something different, pass the file system location to `data/composed/get.php` through `MEDIA_SERVER_LOCAL_DIRECTORY` environment variable. You will then be responsible for item images being present.

6. You can also change the location where the composed images are store by passing a path to `data/composed/get.php` through `CACHE_DIRECTORY` environment variable. This is useful if you do not want to have the directory containing the source code writeable.

## About us

We are team behind https://fan-club-penguin.cz – the largest community of Club Penguin players in Czech Republic and Slovakia.

## License

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. Image data are property of Club Penguin.
