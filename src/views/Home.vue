<template>
  <div class="home">
    <el-upload
      class="home-upload"
      action=""
      drag
      :auto-upload="false"
      :on-change="changeFile"
      :show-file-list="false"
      >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip" v-show="chooseType">
        文件类型为：{{chooseType}}
      </div>
    </el-upload>
    <ul class="suggest-list" v-show="showList.length">
      <h5>给您推荐以下功能（{{showList.length}}）：</h5>
      <li class="suggest-item" v-for="(item, key) in showList" :key="key" @click="gotoUrl(item)">
        <img :src="item.img" alt="">
        <div>{{item.name}}</div>
      </li>
    </ul>
  </div>
</template>

<script>
import { MENUS } from '@/data/setting';

export default {
  name: 'home',
  methods: {
    changeFile({ raw }) {
      console.log(raw.type);
      switch (raw.type) {
        case 'image/png':
        case 'image/jpg':
        case 'image/jpeg':
          this.chooseType = 'img';
          break;
        case 'application/vnd.ms-excel':
          this.chooseType = 'excel';
          break;
        case 'application/msword':
        case 'text/plain':
          this.chooseType = 'text';
          break;
        default:
          this.chooseType = '';
      }
    },
    gotoUrl(item) {
      window.open(`http://dagoo.work${item.url}`);
    },
  },
  computed: {
    flaternMenus() {
      const list = [];
      for (const first of MENUS) {
        if (first.tags && first.tags.length > 0) {
          list.push({
            ...first,
            children: undefined,
          });
        }
        if (first.children && first.children.length > 0) {
          for (const second of first.children) {
            second.role != 'hidden' && second.role != 'side' && list.push({
              ...second,
            });
          }
        }
      }
      return list;
    },
    showList() {
      return this.chooseType ? this.flaternMenus.filter((item) => {
        const types = item.types || [];
        return types.includes(this.chooseType);
      }) : [];
      // switch (this.chooseType) {
      //   case 'img':
      //     return MENUS.filter(item => item.types.includes)
      // }
    },
  },
  data() {
    return {
      MENUS,
      chooseType: '',
    };
  },
};
</script>

<style lang="less">
.home {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.home-upload {
  width: 100vw;
  height: 80vh;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  .el-upload-dragger {
    width: 60vw;
    height: 60vh;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }
}
.suggest-list {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}
.suggest-item {
  display: inline-block;
  width: 150px;
  margin-right: 20px;
  text-align: center;
  cursor: pointer;
  &:last-child {
    margin-right: 0;
  }
  img {
    width: 100%;
  }
}
</style>