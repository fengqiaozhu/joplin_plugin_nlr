const webviewHtml = () => {
    return `
    <div id="app">
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
      <div class="search-result">
          <div class="book-list" v-if="!selectedBook">
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
          </div>
          <div class="chapters-list" v-if="!!selectedBook">
            <div class="list-header">
              <el-button class="button" type="text" @click="handleBackToBookListClick()"><i class="fa fa-chevron-left"></i>&nbsp;<span>BACK</span></el-button>
              <div class="chapters-title">
                <span>{{selectedBookInfo['Name']}}</span>
              </div>
              <el-button :disabled="!selectedCatalog.length" type="primary" @click="handleDownloadClick"><i class="fa fa-download"></i>&nbsp;<span>DOWNLOAD</span></el-button>
            </div>
            <div class="list">
                <div class="card-layout">
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
                </div>
            </div>
          </div>
      </div>
    </div>
    `
}
export default webviewHtml