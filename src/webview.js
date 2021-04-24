class WebviewRunner {
    constructor(modules) {
        let self = this
        self.modules = modules
    }

    whenAvailable(callback) {
        let self = this
        let interval = 10; // ms
        window.setTimeout(function () {
            let availableLen = self.modules.filter(item => !!window[item])
            if (availableLen.length === self.modules.length) {
                callback(self.modules);
            } else {
                self.whenAvailable(callback);
            }
        }, interval);
    }

    run() {
        let self = this
        self.whenAvailable((loaded) => {
            console.log(loaded.join(',') + ' loaded succeed!')
            const App = {
                data() {
                    return {
                        searchingBookName: '',
                        searchResult: [],
                        selectedBook: '',
                        chapters: [],
                        chaptersToDownload: [],
                        bookInfoFields: [
                            {field: 'Author', label: '作者'},
                            {field: 'BookStatus', label: '状态'},
                            {field: 'Desc', label: '描述'}
                        ]
                    };
                },
                methods: {
                    handleRetractClick() {
                        webviewApi.postMessage({
                            name: 'hideNlrPanel'
                        });
                    },
                    handleSearchBookClick() {
                        if (this.searchingBookName) {
                            webviewApi.postMessage({
                                name: 'searchBook',
                                bookName: this.searchingBookName
                            }).then(dt => {
                                if (dt.status === 1 && dt.info === 'success') {
                                    this.searchResult = dt.data
                                }
                            })
                        }
                    },
                    handleGetMoreBookInfoClick(bookID) {
                        // this.selectedBook = bookID
                        webviewApi.postMessage({
                            name: 'getBookInfo',
                            bookID: bookID
                        }).then(info => {
                            console.log(info)
                        })
                    }
                }
            };
            const app = Vue.createApp(App);
            app.use(ElementPlus, {size: 'mini'});
            app.mount("#app");
        })
    }
}


// run script
(() => {
    const modules = ['Vue', 'ElementPlus']

    const webviewRunner = new WebviewRunner(modules)

    webviewRunner.run()
})()
