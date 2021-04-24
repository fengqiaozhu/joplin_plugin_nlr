import joplin from 'api';
import webviewHtml from "./html_generator";
import ebook from 'ebook-getter'
const utf8 = require('utf8')

const addPanel = async function () {
    const panel = await joplin.views.panels.create('nlr-panel');
    console.log(utf8.encode(webviewHtml()) )
    await joplin.views.panels.setHtml(panel, webviewHtml());
    await joplin.views.panels.addScript(panel, './lib/vue.js')
    await joplin.views.panels.addScript(panel, './lib/element.css')
    await joplin.views.panels.addScript(panel, './lib/element.js')
    await joplin.views.panels.addScript(panel, './webview.js')
    await joplin.views.panels.addScript(panel, './webview.css')
    return panel
}


joplin.plugins.register({
    onStart: async function () {
        let nlrPanel = null
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
