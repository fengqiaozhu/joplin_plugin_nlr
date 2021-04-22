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
                    return {};
                },
                methods: {
                    handleRetractClick() {
                        console.log('aaaaaaaaa')
                        webviewApi.postMessage({
                            name: 'hideNlrPanel'
                        });
                    }
                }
            };
            const app = Vue.createApp(App);
            app.use(ElementPlus);
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
