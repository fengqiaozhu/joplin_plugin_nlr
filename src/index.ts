import joplin from 'api';
import webviewHtml from "./html_generator";
import ebook from 'ebook-getter'

const path = require('path')

const addPanel = async function () {
    const panel = await joplin.views.panels.create('nlr-panel');
    await joplin.views.panels.setHtml(panel, webviewHtml());
    await joplin.views.panels.addScript(panel, './lib/vue.js')
    await joplin.views.panels.addScript(panel, './lib/element.css')
    await joplin.views.panels.addScript(panel, './lib/element.js')
    await joplin.views.panels.addScript(panel, './webview.js')
    await joplin.views.panels.addScript(panel, './webview.css')
    return panel
}

const fs = joplin.require('fs-extra')

const getDownloadList = async () => {
    const dataDir = await joplin.plugins.dataDir()
    let f = path.join(dataDir, 'download-list.json')
    return new Promise((resolve, reject) => {
        fs.pathExists(f)
            .then(exists => {
                if (exists) {
                    fs.readJson(f)
                        .then(list => {
                            resolve(list)
                        })
                } else {
                    resolve(null)
                }
            })
    })
}

const setDownloadList = async (list) => {
    const dataDir = await joplin.plugins.dataDir()
    await fs.writeJson(path.join(dataDir, 'download-list.json'), list)
}

const delDownloadList = () => {
    return new Promise((resolve, reject) => {
        joplin.plugins.dataDir()
            .then(dir => {
                fs.remove(path.join(dir, 'download-list.json'))
                    .then(() => {
                        resolve(true)
                    })
            })
    })
}

const downloadBook = () => {
    getDownloadList().then(downloadList => {
        if (typeof downloadList === "object") {
            let bookID = downloadList.info['Id']
            let list = downloadList.chapters
            let paused = downloadList['paused']
            if (!paused) {
                let chapterID = list.shift()['id']
                ebook.houzi.chapter(bookID * 1, chapterID * 1)
                    .then(async dt => {
                        if (list.length) {
                            await setDownloadList(downloadList)
                            console.log(dt)
                            downloadBook()
                        } else {
                            await delDownloadList()
                            return
                        }
                    })
                    .catch(e => {
                        console.log(e)
                    })
            }
        } else {
            return
        }
    })
}

joplin.plugins.register({
    onStart: async function () {
        let nlrPanel = null
        let downloadList = await getDownloadList()
        await joplin.commands.register({
            name: 'nlrToggle',
            label: 'NLR',
            iconName: 'fas fa-music',
            execute: async () => {
                if (!nlrPanel) {
                    nlrPanel = await addPanel()
                    await joplin.views.panels.onMessage(nlrPanel, async (message) => {
                        switch (message.name) {
                            case 'hideNlrPanel':
                                console.log('==========hideNlrPanel=============')
                                await joplin.views.panels.hide(nlrPanel)
                                break
                            case 'searchBook':
                                console.log('==========searchBook=============')
                                let bookName = message.bookName
                                return await ebook.houzi.search(bookName)
                            case 'getBookInfo':
                                console.log('==========getBookInfo=============')
                                let bookID = message.bookID
                                return await ebook.houzi.catalog(bookID)
                            case 'downloadBook':
                                let book = message.book
                                await setDownloadList(JSON.parse(book))
                                break
                            case 'getDownloadList':
                                return await getDownloadList()
                        }
                    })
                } else {
                    await joplin.views.panels.show(nlrPanel)
                }
            },
        });
        await joplin.views.menuItems.create('nlrMenu', 'nlrToggle')
    },
});
