"use strict"
let fis = require('fis3')
let configBuild = require('./config/build.json')

let namespace = configBuild.namespace //命名空间
let staticPath = configBuild.staticRoot + '/' + namespace //实际静态资源根目录
let tplPath = configBuild.tplRoot + '/' + namespace //模板根目录

if(namespace){
    fis.config.set('namespace', configBuild.namespace);
}

fis.hook('commonjs')


//排除不需要产出的目录
fis.set('project.ignore', fis.get('project.ignore').concat([
    'package.json',
    '.gitignore',
    'test/**'
]))

// 所有的文件产出到 {staticPath} 目录下
fis.match('*', {
    release: staticPath + '$0',
    useHash : false
})

fis.match('config/**', {
    release : false
})

// 所有模板放到 {tplPath} 目录下
fis.match('*.html', {
    release: tplPath + '$0',
    parser: fis.plugin('jinja2', {
        namespace : namespace
    })
})


//npm 组件
fis.match('/{node_modules,components,widget}/**.js', {
    isMod: true,
    useSameNameRequire: true
})

fis.match('/{page,widget}/**', {
    isMod: true,
    useSameNameRequire: true
})

fis.match('/static/**', {
    isMod: false,
    useSameNameRequire: false
})

fis.match('**.css', {
    postprocessor: fis.plugin('autoprefixer', {
        "browsers": ["last 2 versions","Android >= 4.0"]
    })
})

fis.match('/node_modules/**.css', {
    parser: null,
    postprocessor: null
})

// 添加css和image加载支持
fis.match('*.js', {
    preprocessor: [
        fis.plugin('js-require-css'),
        fis.plugin('js-require-file', {
            useEmbedWhenSizeLessThan: 10 * 1024 // 小于10k用base64
        })
    ]
})

//babel
fis.match('/{page,widget}/**.js', {
    parser: fis.plugin('babel-5.x', {
        stage: 3,
        blacklist: ["useStrict"]
    })
})

fis.match('*.{es6, es}', {
    isJsLike: true,
    rExt : 'js',
    isMod: true,
    useSameNameRequire: true,
    parser: fis.plugin('babel-5.x', {
        stage: 3,
        blacklist: ["useStrict"]
    })
})


// 禁用components
fis.unhook('components')
fis.hook('node_modules', {
    ignoreDevDependencies: true,
    shimProcess : false
})

fis.match('*', {
    deploy: fis.plugin('local-deliver', {
        to: configBuild.outputRoot
    })
})

// pack
fis.media('prod')
    .match('/{page,widget,pkg}/**', {
        useHash : true
    })
    .match('/{page,widget}/**.html', {
        useHash : false
    })
    .match('*.js', {
        optimizer: fis.plugin('uglify-js', {
            mangle: {
                expect: ['require', 'define']
            }
        })
    })
    .match('*.{png,gif,jpg,jpeg,eot,ttf,woff,svg,json}', { //静态引用增加url前缀
        url : configBuild.staticUrlPrefix  + staticPath + '$0'
    })
    .match('*.css', {
        useSprite: true,
        optimizer: fis.plugin('clean-css', {
            'keepSpecialComments': 0
        })
    })
    .match('*.png', {
        optimizer: fis.plugin('png-compressor') 
    })
    .match('::package', {
        postpackager: fis.plugin('loader', {
            resourceType: 'mod',
            allInOne: {
                ignore: ['static/lib/**', 'node_modules/jquery/**']
            }
        })
    })

