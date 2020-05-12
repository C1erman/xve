# xve
A Hexo-like blog and SPA generator.

## Install

```shell
npm install xve -g
```

Make sure you have a `Node.js@10` `npm@6.0`.

The global installed `webpack@4.0` is also important.

## Use

xve will scan your `.md` files to generate a react.js-based SPA.

Then you can push the SPA to your Github Pages or somewhere else in server.

### Initialize

First of first, you MUST initialize the whole project.

Some npm packages will be download in this stage.

```shell
$ xve init
```

### New

```shell
$ xve new "post name"
```

Then you will find a "post name" named `.md` file be created in folder : `src/md`.

Write something you like in this file.

### Generate SPA

```shell
$ xve gen
```

Generate the `react.js` based SPA.

### Preview

Generate firstly.

Then Preview.

```shell
$ xve show
```

Based on `webpack-dev-server`.

### Push

```shell
$ xve push
```

This will push your SPA in `public` folder.

But make sure your `.ssh` file to Github works well. If not, you can do it in manual.

## Important Files

### source.json

xve will scan your `.md` files, then make this JSON file in `public` folder.

`source.json` will power the whole react SPA.

Avoid naming your `.md` file as `source.md`.

### config.json

This config file is in folder `src/react/src`, it tells some configuration items for SPA.

Most importantly, the `jsonPath` tells the URL where the SPA to fetch `source.json` file.