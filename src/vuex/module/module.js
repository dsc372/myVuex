import { forEachValue } from "../utils/forEachValue"

export default class Module{
    constructor(module){
        this._raw=module,
        this._children={},
        this.state=module.state
    }
    get namespaced(){
        return !!this._raw.namespaced;
    }
    addChild(key,module){
        this._children[key]=module
    }
    getChild(key){
        return this._children[key]
    }
    forEachMutations(cb){
        if(this._raw.mutations){
            forEachValue(this._raw.mutations,cb)
        }
    }
    forEachActions(cb){
        if(this._raw.actions){
            forEachValue(this._raw.actions,cb)
        }
    }
    forEachGetters(cb){
        if(this._raw.getters){
            forEachValue(this._raw.getters,cb)
        }
    }
    forEachModules(cb){
        forEachValue(this._children,cb)
    }
}