import { install, Vue } from "./install"
import ModuleCollection from "./module/module-collection"
import { forEachValue } from "./utils/forEachValue"

function installModule(store, rootState, path, rootModule) {
  if (path.length > 0) {
    //只有是子模块的时候才需要将子模块的状态定义在根上根模块
    let parent = path.slice(0, -1).reduce((start, current) => {
      return start[current]
    }, rootState)
    store._withCommiting(()=>{
        Vue.set(parent,path[path.length - 1],rootModule.state)
    })//register的新模块也是响应式的
    // parent[path[path.length - 1]]=rootModule.state
  }
  let namespaced=store._modules.getNamespaced(path)
  rootModule.forEachMutations((mutationKey, mutationValue) => {
    store._mutations[namespaced+mutationKey] = store._mutations[namespaced+mutationKey] || []
    store._mutations[namespaced+mutationKey].push((payload) => {
      store._withCommiting(()=>{
        mutationValue(rootModule.state, payload)//更改state一定是在commiting=true的情况下
      })
      store.subscribes.forEach(fn=>fn({type:namespaced+mutationKey},rootState))
    })
  })
  rootModule.forEachActions((actionKey, actionValue) => {
    store._actions[namespaced+actionKey] = store._actions[namespaced+actionKey] || []
    store._actions[namespaced+actionKey].push((payload) => {
      actionValue(store, payload)
    })
  })
  rootModule.forEachGetters((getterKey, getterValue) => {
    if (store._wrappedGetters[namespaced+getterKey]) {
      console.warn("duplicate key")
    }else{
        store._wrappedGetters[namespaced+getterKey] = () => {
            return getterValue(rootModule.state)
        }
    }
  })
  rootModule.forEachModules((moduleKey, moduleValue) => {
    installModule(store, rootState, path.concat(moduleKey), moduleValue)
  })
}

function resetStoreVM(store, state) {
    let oldVm=store._vm
  store.getters={}
  const computed={}
  const wrappedGetters=store._wrappedGetters
  forEachValue(wrappedGetters,(getterKey,getterValue)=>{
    computed[getterKey]=getterValue
    Object.defineProperty(store.getters,getterKey,{
        get:()=>{
            return store._vm[getterKey]
        }
    })
  })
  store._vm = new Vue({
    data() {
      //定义数据时vue会对带$或_的做退让，不进行代理，增强私密性
      return {
        $state: state,
      }
    },
    computed
  })
  if(store.strict){
    store._vm.$watch(()=>store._vm._data.$state,()=>{
        console.assert(store._commiting,'You can\'t change state outside mutation')
    },{sync:true,deep:true})
  }
  if(oldVm){
    Vue.nextTick(()=>{oldVm.$destroy()})
  }
}

class Store {
  constructor(options) {
    this._modules = new ModuleCollection(options) //将用户传入的配置格式化,主要处理state和modules

    //没有namespaced:true的情况
    this._mutations = Object.create(null)
    this._actions = Object.create(null)
    this._wrappedGetters = Object.create(null)

    this.plugins=options.plugins||[]
    this.subscribes=[]

    this.strict=options.strict
    this._commiting=false

    const state = this._modules.root.state
    installModule(this, state, [], this._modules.root)

    resetStoreVM(this, state)

    this.plugins.forEach(plugin=>plugin(this))
  }
  _withCommiting(fn){
    this._commiting=true
    fn()
    this._commiting=false
  }
  get state() {
    return this._vm._data.$state
  }
  commit=(type,payload)=>{
    this._mutations[type].forEach(fn=>fn.call(this,payload))
  }
  dispatch=(type,payload)=>{
    if(this._actions[type]){
        return Promise.all(this._actions[type].map(fn=>fn.call(this,payload)))
    }
  }
  registerModule(path,module){
    this._modules.register(path,module)
    installModule(this,this.state,path,module.newModule)
    resetStoreVM(this,this.state)//创建一个新的实例，因为新的计算属性无法挂在到旧的实例上
  }
  subscribe(fn){
    this.subscribes.push(fn)
  }
}

export default {
  Store,
  install,
}
