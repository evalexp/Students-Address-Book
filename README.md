# Students Address Book

## Basic Information

This is a students address book app based on Electron.

Only for school work.

Author: Zhouhao

Class: CUMT-CS-IS-2

Student ID: 08193059

## How to run

make sure that you have downloaded the latest node.js, type

```bash
node -v
npm -v
```

to check if it is latest.

Then clone this Repository from : https://github.com/evalexp/Students-Address-Book.git

open the folder that you clone, then type :
```bash
npm install
```

If you are in mainland, it would take times, but you can speed up this process by modifying the configuration file '%userprofile%/.npmrc'

Here are the configuration, paste it into your configuration file:

```conf
registry=https://registry.npm.taobao.org/
sass_binary_site=https://npm.taobao.org/mirrors/node-sass/
electron_mirror=http://npm.taobao.org/mirrors/electron/
```

After install the dependencies, try to run it by typing:

```bash
npm start
```

## About

We use four dependencies to build this app.

* Electron V11.1.0
* Vue V2.6.12 (Integrated)
* Element V2.14.1 (Integrated)
* lowdb V1.0.0

With nodeIntegration was enable in the Render process, it may has security risks.

By the way, to enable 'require' function in the Render process(I need to import ipcRender module into render process), I didn't set contextIsolation to be **True** in the Render process, so if someone edit it's source maliciously, it would cause prototype pollution which could bring a disaster to your computer.

In the standard development, you should encapsulate node module into **preload.js** and expose it as public api , and disable nodeIntegration in Render Process, also, enable contextIsolation to protect against prototype pollution and disable enableRemoteModule to protect against malicious script is important.
