import Vue from 'vue'
import Vuex from '@/vuex'
// import Vuex from 'vuex'

Vue.use(Vuex)

const testPlugins=function(store){
  let preState=JSON.parse(JSON.stringify(store.state))
  store.subscribe(function(mutationType,rootState){
    let newState=JSON.parse(JSON.stringify(rootState))
    console.log(' mutation:',mutationType,',preState:',preState,',newState:',newState)
    preState=JSON.parse(JSON.stringify(rootState))
  })//state数据变化是会触发回调
}

const store =new Vuex.Store({
  strict:true,
  plugins:[
    testPlugins
  ],
  state: {
    age:18
  },
  getters: {
    newAge(state){
      return state.age-1
    }
  },
  mutations: {
    add(state,payload){
      state.age+=payload
    }
  },
  actions: {
    add({commit},payload){
      setTimeout(()=>{
        commit('add',payload)
      },1000)
    }
  },
  modules: {
    a:{
      namespaced:true,
      state: {
        age:30
      },
      getters: {
        newAge(state){
          return state.age-1
        }
      },
      mutations: {
        add(state,payload){
          state.age+=payload
        }
      },
      actions: {
        add({commit},payload){
          setTimeout(()=>{
            commit('a/add',payload)
          },1000)
        }
      },
    }
  }
})

store.registerModule(['a','b'],{
  namespaced:true,
  state: {
    age:50
  },
  getters: {
    newAge(state){
      return state.age-1
    }
  },
  mutations: {
    add(state,payload){
      state.age+=payload
    }
  },
  actions: {
    add({commit},payload){
      setTimeout(()=>{
        commit('a/b/add',payload)
      },1000)
    }
  },
})

export default store
