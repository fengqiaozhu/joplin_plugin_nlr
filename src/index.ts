import joplin from 'api';
import webviewHtml from "./html_generator";
import ebook from 'ebook-getter'

const path = require('path')
const fs = joplin.require('fs-extra')
const requestTimeDelay = 2000

let ebookFolderID = ''


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
        if (downloadList) {
            let bookID = downloadList['info']['Id']
            let list = downloadList['chapters']
            let paused = downloadList['paused']
            if (!paused) {
                let chapterID = list.shift()['id']
                ebook.houzi.chapter(bookID * 1, chapterID * 1)
                    .then(async dt => {
                        console.log(dt)
                        if (list.length) {
                            await setDownloadList(downloadList)
                            await saveToNote(dt)
                            setTimeout(() => {
                                downloadBook()
                            }, requestTimeDelay)
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

const saveToNote = async (dt) => {
    if (dt['info'] === "success" && dt['status'] === 1) {
        let chapter = dt.data
        let content = chapter['content']
        let title = chapter['cname']
        let bookName = chapter['name']
        let folderID = await createFolder(ebookFolderID, bookName)
        await joplin.data.post(['notes'], null, {parent_id: folderID, title: title, body: content});
    }
}

const createFolder = async (parentID, folderName) => {
    let folders = await joplin.data.get(['folders'])
    folders = parentID ? folders['items'].filter(item => item['parent_id'] === parentID) : folders['items']
    console.log(folders)
    let addingFolder = folders.filter(item => item.title === folderName)
    if (!addingFolder.length) {
        await joplin.data.post(['folders'], null, {parent_id: parentID, title: folderName})
            .then(added => {
                return added['id']
            })
    } else {
        return addingFolder[0]['id']
    }
}

joplin.plugins.register({
    onStart: async function () {
        let nlrPanel = null
        ebookFolderID = await createFolder(null, 'Ebooks')
        await joplin.commands.register({
            name: 'nlrToggle',
            label: 'NLR',
            iconName: 'fas fa-music',
            execute: async () => {
                if (!nlrPanel) {
                    nlrPanel = await addPanel()
                    downloadBook()
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
                                downloadBook()
                                break
                            case 'getDownloadList':
                                return await getDownloadList()
                            case 'pauseDownload':

                                break
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
