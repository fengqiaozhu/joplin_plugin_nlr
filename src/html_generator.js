const webviewHtml = () => {
    return `
    <div id="app">
      <div class="header">
         <div class="title"><span>NLR</span></div>
         <el-button type="primary" size="mini" @click="handleRetractClick">retract</el-button>
      </div>
      <div class="search-area">
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
    </div>
    `
}
export default webviewHtml