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
                        ],
                        downloadStatus: 0,
                        sourceLoaded: false,
                        loadingResult: false
                    };
                },
                computed: {
                    selectedBookInfo() {
                        return this.searchResult.filter(item => item['Id'] === this.selectedBook)[0]
                    },
                    selectedCatalog() {
                        let catalogs = []
                        this.catalogs.filter(c => !!c.selected).forEach(item => {
                            catalogs = catalogs.concat(item['list'].map(p => {
                                p.catalog = item.name
                                return p
                            }))
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
                        let self = this
                        if (this.searchingBookName) {
                            self.loadingResult = true
                            webviewApi.postMessage({
                                name: 'searchBook',
                                bookName: self.searchingBookName
                            }).then(dt => {
                                self.loadingResult = false
                                if (dt.status === 1 && dt.info === 'success') {
                                    self.searchResult = dt.data
                                }
                            })
                        }
                    },
                    handleGetMoreBookInfoClick(bookID) {
                        let self = this
                        self.selectedBook = bookID
                        self.loadingResult = true
                        webviewApi.postMessage({
                            name: 'getBookInfo',
                            bookID: bookID
                        }).then(info => {
                            if (info.status === 1 && info.info === 'success') {
                                self.catalogs = info.data.list.map(item => {
                                    item.selected = 1
                                    return item
                                })
                            }
                            self.$nextTick(() => {
                                self.loadingResult = false
                            })
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
                        }).then(() => {
                            this.downloadStatus = 1
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
                            if (!dt) {
                                this.downloadStatus = 0
                            }
                        })
                    }
                },
                mounted() {
                    let self = this
                    self.sourceLoaded = true
                    self.getDownloadList()
                    setInterval(() => {
                        self.getDownloadList()
                    }, 2000)
                }
            };
            const app = Vue.createApp(App);
            app.use(ElementPlus, {size: 'mini'});
            document.getElementsByClassName('app-container')[0].setAttribute("style", "display: flex");
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
