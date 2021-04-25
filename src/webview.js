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
                        catalogs: [],
                        chaptersToDownload: [],
                        bookInfoFields: [
                            {field: 'Author', label: '作者'},
                            {field: 'BookStatus', label: '状态'},
                            {field: 'Desc', label: '描述'}
                        ]
                    };
                },
                computed: {
                    selectedBookInfo() {
                        return this.searchResult.filter(item => item['Id'] === this.selectedBook)[0]
                    },
                    selectedCatalog() {
                        let catalogs = []
                        this.catalogs.filter(c => !!c.selected).forEach(item => {
                            catalogs = catalogs.concat(item['list'])
                        })
                        return catalogs
                    }
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
                        this.selectedBook = bookID
                        webviewApi.postMessage({
                            name: 'getBookInfo',
                            bookID: bookID
                        }).then(info => {
                            if (info.status === 1 && info.info === 'success') {
                                this.catalogs = info.data.list
                            }
                        })
                    },
                    handleBackToBookListClick() {
                        this.catalogs = []
                        this.selectedBook = ''
                    },
                    handleDownloadClick() {
                        webviewApi.postMessage({
                            name: 'downloadBook',
                            book: JSON.stringify({
                                info: this.selectedBookInfo,
                                chapters: this.selectedCatalog
                            })
                        })
                    },
                    chapterRenderData(chapters) {
                        let dt = JSON.parse(JSON.stringify(chapters))
                        if (chapters.length > 5) {
                            dt.splice(3, chapters.length - 4, {name: '...', type: 'more'})
                        }
                        return dt
                    },
                    getDownloadList() {
                        webviewApi.postMessage({
                            name: 'getDownloadList'
                        }).then(dt => {
                            console.log(dt)
                        })
                    }
                },
                mounted() {
                    let self = this
                    self.getDownloadList()
                    setInterval(() => {
                        self.getDownloadList()
                    }, 2000)
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
