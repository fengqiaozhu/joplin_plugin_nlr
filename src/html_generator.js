const webviewHtml = () => {
    return `
    <div id="app">
      <transition name="el-fade-in-linear">
          <div v-if="sourceLoaded" class="app-container">
              <div class="github-icon">
                <svg @click="handleOpenGithubLinkClick()" data-v-09fe1acc="" width="40" height="40" viewBox="0 0 250 250" aria-hidden="true" :style="{fill: 'var(--joplin-color)', color: 'var(--joplin-background-color)'}"><path data-v-09fe1acc="" d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path data-v-09fe1acc="" d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" class="octo-arm" style="transform-origin: 130px 106px;"></path><path data-v-09fe1acc="" d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg>
              </div>
              <div class="header">
                 <div class="title"><span>NLR</span></div>
                 <el-button type="warning" size="mini" @click="handleRetractClick"><span>HIDE</span>&nbsp;<i class="fa fa-sign-out"></i></el-button>
              </div>
              <div class="search-area" v-if="!selectedBook">
                  <el-input
                    placeholder="Please input the book name"
                    v-model="searchingBookName"
                    class="input-with-search"
                  >
                    <template #append>
                      <el-button @click="handleSearchBookClick">Search</el-button>
                    </template>
                  </el-input>
              </div>
              <div class="list-header" v-if="!!selectedBook">
                  <el-button class="button" :disabled="downloadStatus===1" type="text" @click="handleBackToBookListClick()"><i class="fa fa-chevron-left"></i>&nbsp;<span>BACK</span></el-button>
                  <div class="chapters-title">
                    <span>{{selectedBookInfo['Name']}}</span>
                  </div>
                  <el-button :disabled="!selectedCatalog.length||downloadStatus===1" type="success" @click="handleDownloadClick"><i :class="'fa '+(downloadStatus===1?'fa-spinner fa-spin':'fa-download')"></i>&nbsp;<span>DOWNLOAD</span></el-button>
              </div>
              <div class="search-result" 
                  ref="searchResultContainer"
                  v-loading="loadingResult" 
                  element-loading-text="LOADING..."
                  element-loading-background="var(--joplin-background-color-transparent)"
              >
                  <el-scrollbar>
                      <div class="book-list" v-if="!selectedBook" ref="bookList">
                        <transition-group name="el-fade-in-linear" tag="div">
                        <el-card class="box-card" v-for="book in searchResult" :key="book['Id']" :body-style="{background:'var(--joplin-background-color3)',color:'var(--joplin-color)'}">
                          <template #header>
                            <div class="card-header">
                              <span class="book-name">{{book['Name']}}</span>
                              <el-button class="button" type="text" @click="handleGetMoreBookInfoClick(book['Id'])">INFO</el-button>
                            </div>
                          </template>
                          <div class="book-info">
                                <div class="cover"><img :src="book['Img']" :alt="book['Name']"></div>
                                <div class="other-info">
                                    <div v-for="f in bookInfoFields" :key="f.field+book['Id']">
                                        <span class="item-title">{{f.label+': '}}</span><span class="item-content">{{book[f.field]}}</span>
                                    </div>
                                </div>
                            </div>
                        </el-card>
                        </transition-group>
                      </div>  
                      <div class="chapters-list" v-if="!!selectedBook" ref="chapterList">
                        <div class="card-layout">
                            <transition-group name="el-fade-in-linear" tag="div">
                                <el-card class="chapters-card" v-for="clog in catalogs" :key="clog.name+clog.list.length" :body-style="{background:'var(--joplin-background-color3)',color:'var(--joplin-color)'}">
                                  <template #header>
                                    <div class="card-header">
                                      <span>{{clog.name+' ('+ clog.list.length +')'}}</span>
                                      <el-checkbox :true-label="1" :false-label="0" v-model="clog.selected"></el-checkbox>
                                    </div>
                                  </template>
                                  <div v-for="c in chapterRenderData(clog.list)" :key="c.id" class="text item">
                                    {{c.name}}
                                  </div>
                                </el-card>
                            </transition-group>
                        </div>
                      </div>
                  </el-scrollbar>
              </div>
          </div>
      </transition>
    </div>
    `
}
export default webviewHtml