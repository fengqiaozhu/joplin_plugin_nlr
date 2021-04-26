const webviewHtml = () => {
    return `
    <div id="app">
      <transition name="el-fade-in-linear">
          <div v-if="sourceLoaded" class="app-container">
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
                  v-loading="loadingResult" 
                  element-loading-text="LOADING..."
                  element-loading-background="rgba(0, 0, 0, 0.8)"
              >
                  <div class="book-list" v-if="!selectedBook">
                    <transition-group name="el-fade-in-linear" tag="div">
                    <el-card class="box-card" v-for="book in searchResult" :key="book['Id']">
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
                  <div class="chapters-list" v-if="!!selectedBook">
                    <div class="list">
                        <div class="card-layout">
                        <transition-group name="el-fade-in-linear" tag="div">
                            <el-card class="chapters-card" v-for="clog in catalogs" :key="clog.name+clog.list.length">
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
                  </div>
              </div>
          </div>
      </transition>
    </div>
    `
}
export default webviewHtml