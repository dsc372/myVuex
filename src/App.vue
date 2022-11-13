<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <div>周岁{{age}}</div>
    <div>虚岁{{$store.getters.newAge}}</div>
    <button @click="$store.dispatch('add',1)">点我一秒后加年龄</button>
    <div>a模块的周岁：{{$store.state.a.age}}</div>
    <div>a模块的虚岁:{{$store.getters['a/newAge']}}</div>
    <button @click="$store.dispatch('a/add',1)">点我一秒后加a的年龄</button>
    <div>b模块的周岁：{{$store.state.a.b.age}}</div>
    <div>b模块的虚岁:{{$store.getters['a/b/newAge']}}</div>
    <button @click="$store.dispatch('a/b/add',1)">点我一秒后加b的年龄</button>
  </div>
</template>

<script>
function mapState(stateList){
  let obj={}
  for(let i=0;i<stateList.length;i++){
    let stateKey=stateList[i]
    obj[stateKey]=function(){
      return this.$store.state[stateKey]
    }
  }
  return obj
}
export default {
  name: 'App',
  computed:{
    ...mapState(['age'])
  },
  mounted(){
    console.log(this.$store)
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
