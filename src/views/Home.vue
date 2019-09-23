<template>
  <div class="home">
    <el-upload
      class="home-upload"
      drag
      action=""
      :auto-upload="false"
      :on-change="changeFile"
      :show-file-list="false"
      accept=".png, .jpg, .jpeg, .txt, .csv"
      >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div class="el-upload__tip" slot="tip">
        support: .png, .jpg, .jpeg, .txt, .csv
      </div>
      <!-- <div class="el-upload__tip" slot="tip" v-show="chooseType">
        文件类型为：{{ chooseType }}
      </div> -->
    </el-upload>
    <ul class="suggest-list" v-show="showList.length">
      <h5>给您推荐以下功能（{{ showList.length }}）：</h5>
      <li
        class="suggest-item"
        v-for="(item, key) in showList"
        :key="key"
        @click="gotoUrl(item)"
      >
        <img :src="item.img" alt="" />
        <div>{{ item.name }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
import jschardet from 'jschardet';
import _ from 'lodash';
import * as dataForge from 'data-forge';
import { MENUS } from '@/data/setting';

const checkSortColumn = (arr) => {
  const isAllDate = arr.every((item) => {
    const date = isNaN(item) ? item : +item;
    return !isNaN(+new Date(date));
  });
  if (!isAllDate) {
    return false;
  }
  const sortArr = Array.from(new Set(arr.slice(0))).sort((a, b) => {
    const aVal = isNaN(a) ? a : +a;
    const bVal = isNaN(b) ? b : +b;
    return aVal - bVal;
  });
  if (_.isEqual(arr, sortArr)) {
    return true;
  } else {
    return false;
  }
};

const checkBinaryColumn = (arr) => {
  return arr.every((item) => +item === 0 || +item === 1);
};
const checkNumberColumn = (arr) => {
  return arr.every((item) => !isNaN(item));
};

const checkColumnType = (arr) => {
  if (checkSortColumn(arr)) return 'sortNumber';
  if (checkNumberColumn(arr)) {
    if (checkBinaryColumn(arr)) return 'binaryNumber';
    return 'number';
  }
  return 'string';
};

const checkBinaryTable = (typeArr) => {
  const typeList = typeArr[0].type !== 'binaryNumber' ? typeArr.slice(1) : typeArr.slice(0);
  return typeList.every((item) => item.type === 'binaryNumber');
};

const checkSortTable = (typeArr) => {
  return typeArr.some((item) => item.type === 'sortNumber');
};
const checkNumberTable = (typeArr) => {
  const typeList = typeArr[0].type !== 'number' ? typeArr.slice(1) : typeArr.slice(0);
  return typeList.every((item) => item.type === 'number');
};
const checkThreeTable = (typeArr) => {
  if (typeArr.length !== 3) return false;
  return typeArr[0].type === 'string' && typeArr[1].type === 'string' && typeArr[2].type.toLowerCase().includes('number');
};
const checkTwoTable = (typeArr) => {
  if (typeArr.length !== 2) return false;
  return typeArr[0].type === 'string' && typeArr[1].type === 'string';
};
const checkTwo2Table = (typeArr) => {
  if (typeArr.length !== 2) return false;
  return typeArr[0].type === 'string' && typeArr[1].type.toLowerCase().includes('number');
};


export default {
  name: 'home',
  methods: {
    readFile(raw) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        const reader_ = new FileReader();
        reader_.onload = ({ target }) => {
          console.log(target.result);
          resolve(target.result);
        };
        reader.onload = ({ target }) => {
          const str = atob(target.result.split(';base64,')[1]);
          let { encoding } = jschardet.detect(str);
          switch (encoding.toUpperCase()) {
            case 'KOI8-R':
              encoding = 'GB2312';
              break;
            case 'windows-1252':
            case 'WINDOWS-1252':
              encoding = 'ANSI';
              break;
            case 'GBK':
            case 'GB2312':
            case 'UTF-8':
              break;
            default:
              encoding = '';
          }
          reader_.readAsText(raw, encoding);
        };
        reader.readAsDataURL(raw);
      });
    },
    changeFile({ raw }) {
      console.log('raw.type', raw.type);
      switch (raw.type) {
        case 'image/png':
        case 'image/jpg':
        case 'image/jpeg':
          this.chooseType = 'img';
          break;
        case 'application/vnd.ms-excel':
          this.chooseType = 'excel';
          break;
        // case 'application/msword':
        case 'text/plain':
          this.chooseType = 'text';
          break;
        // case 'application/json':
        //   this.chooseType = 'json';
        //   break;
        default:
          this.chooseType = '';
      }
      this.chooseType === 'excel' && this.readFile(raw).then((fileData) => {
        const tags = [];
        let df;
        switch (this.chooseType) {
          case 'excel':
            df = dataForge.fromCSV(fileData);
            break;
          case 'json':
            df = dataForge.fromJSON(fileData);
            break;
        }
        if (df) {
          window.df = df;
          const resArr = [];
          for (const column of df.getColumns()) {
            const name = column.name;
            const series = column.series;
            resArr.push({
              name,
              type: checkColumnType(series.toArray()),
            });
          }
          if (checkBinaryTable(resArr) && resArr.length - 1 === df.count()) tags.push('binaryNumber');
          if (checkSortTable(resArr)) tags.push('sortNumber');
          if (checkNumberTable(resArr)) tags.push('number');
          if (checkThreeTable(resArr)) tags.push('col2+1');
          if (checkTwoTable(resArr)) tags.push('col2');
          if (checkTwo2Table(resArr)) tags.push('col1+1');
          tags.push(`size_${resArr.length}`);
        }
        this.chooseTags = [...tags];
      });
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
            second.role != 'hidden' &&
              second.role != 'side' &&
              list.push({
                ...second,
              });
          }
        }
      }
      return list;
    },
    showList() {
      const chooseType = this.chooseType ? this.chooseType : 'none';
      const list = this.flaternMenus.filter((item) => {
        const types = item.types || [];
        const hasType = types.includes(this.chooseType);
        return this.chooseTags.length > 0 ? hasType && _.intersection(types, this.chooseTags).length > 0 : hasType;
      })
      return list;
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
      chooseTags: [],
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
