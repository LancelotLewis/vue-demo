import Vue from 'vue';
import Vuex from 'vuex';
import VueAxios from 'vue-axios';
import ElementUI from 'element-ui';

import 'normalize.css';
import 'element-ui/lib/theme-chalk/index.css';

import axios from '@/lib/axios+';

import App from './App.vue';
import router from './router';
import store from './store';

Vue.use(Vuex);
Vue.use(VueAxios, axios);
Vue.use(ElementUI, { size: 'small' });
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
