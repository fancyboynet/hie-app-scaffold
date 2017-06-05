"use strict"
let fis = require('fis3')
let configBuild = require('./config/build.json')

fis.set('namespace', configBuild.namespace)  //命名空间
fis.set('staticRoot', configBuild.namespace) //静态资源目录
fis.set('tplRoot', configBuild.namespace) //模板目录
fis.set('staticUrlPrefix', configBuild.namespace) //静态资源前缀
fis.set('outputRoot', configBuild.namespace) //输出目录

