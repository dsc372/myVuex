import Module from './module'
import {forEachValue} from '../utils/forEachValue'

export default class ModuleCollection{
    constructor(options){
        this.root=null
        this.register([],options)
    }
    getNamespaced(path){
        let module=this.root
        return path.reduce((str,key)=>{
            module=module.getChild(key)
            return str+(module.namespaced?`${key}/`:'')
        },'')
    }
    register(path,rootModules){
        let newModule=new Module(rootModules)
        rootModules.newModule=newModule
        if(this.root===null){
            this.root=newModule
        }else{
            let parent=path.slice(0,-1).reduce((start,current)=>{
                return start._children[current]
            },this.root)
            parent._children[path[path.length-1]]=newModule
        }
        if(rootModules.modules){
            forEachValue(rootModules.modules,(moduleName,moduleValue)=>{
                this.register(path.concat(moduleName),moduleValue)
            })
        }
    }
}